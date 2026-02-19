import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const input = await req.json()
    const { generateProposal } = await import('@/lib/ai')
    const output = await generateProposal(input)
    return NextResponse.json(output)
  } catch (error) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
