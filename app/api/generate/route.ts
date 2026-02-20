import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const input = await req.json()
    const { generateProposal } = await import('@/lib/ai')
    const output = await generateProposal(input)

    // ログインユーザーの場合はDBに保存
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
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
