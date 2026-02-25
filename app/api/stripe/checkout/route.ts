import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // NEXT_PUBLIC_APP_URL を優先。未設定の場合は origin ヘッダーを使うが
    // Host ヘッダーは信頼しない（Host header injection 対策）
    const envUrl = process.env.NEXT_PUBLIC_APP_URL
    const originHeader = req.headers.get('origin')
    const appUrl = envUrl ?? (originHeader?.startsWith('https://') ? originHeader : null)
    if (!appUrl) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/dashboard`,
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
