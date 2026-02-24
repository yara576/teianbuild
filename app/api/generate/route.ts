import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const FREE_PLAN_LIMIT = 3

export async function POST(req: NextRequest) {
  try {
    const input = await req.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // 無料プランの上限チェック
      const { count } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if ((count ?? 0) >= FREE_PLAN_LIMIT) {
        return NextResponse.json({ error: 'LIMIT_EXCEEDED' }, { status: 403 })
      }
    }

    const { generateProposal } = await import('@/lib/ai')
    const output = await generateProposal(input)

    if (user) {
      await supabase.from('proposals').insert({
        user_id: user.id,
        input: input,
        output: output,
      })
    }

    return NextResponse.json(output)
  } catch (error) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
