import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 冪等性チェック：処理済みイベントはスキップ
  const { data: existing } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('event_id', event.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ received: true, skipped: true })
  }

  // イベントを処理済みとして記録（失敗時はスキップして重複処理を防ぐ）
  const { error: insertError } = await supabase
    .from('stripe_events')
    .insert({ event_id: event.id, type: event.type })

  if (insertError) {
    // ユニーク制約違反は別リクエストが先に処理済み → 重複処理を防ぐためスキップ
    console.warn('stripe_events insert failed (possible duplicate):', insertError.message)
    return NextResponse.json({ received: true, skipped: true })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      if (userId && session.subscription) {
        await supabase.from('user_usage').upsert(
          {
            user_id: userId,
            is_paid: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active',
          },
          { onConflict: 'user_id' }
        )
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      if (subscription.customer) {
        await supabase
          .from('user_usage')
          .update({
            is_paid: false,
            stripe_subscription_id: null,
            subscription_status: 'cancelled',
          })
          .eq('stripe_customer_id', subscription.customer as string)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      if (subscription.customer) {
        const isActive = subscription.status === 'active'
        await supabase
          .from('user_usage')
          .update({
            is_paid: isActive,
            subscription_status: subscription.status,
          })
          .eq('stripe_customer_id', subscription.customer as string)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.customer) {
        await supabase
          .from('user_usage')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer as string)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
