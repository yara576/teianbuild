import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function GenerateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: usage } = await supabase
      .from('user_usage')
      .select('proposals_created, is_paid')
      .eq('user_id', user.id)
      .single()

    const proposalsCreated = usage?.proposals_created ?? 0
    const isPaid = usage?.is_paid ?? false

    if (!isPaid && proposalsCreated >= 3) {
      redirect('/dashboard')
    }
  }

  return <>{children}</>
}
