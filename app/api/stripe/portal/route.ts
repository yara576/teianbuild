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

    const { data: usage } = await supabase
      .from('user_usage')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!usage?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    const origin = req.headers.get('origin') ?? `https://${req.headers.get('host')}`
    const appUrl = origin

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: usage.stripe_customer_id,
      return_url: `${appUrl}/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
