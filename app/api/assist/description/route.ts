import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    projectTitle,
    clientName,
    techStack,
    currentDescription,
    duration,
    budget,
    yourRole,
    hourlyRate,
  } = await req.json()

  const emptyFields = []
  if (!duration) emptyFields.push('duration（期間）: "1週間" | "1ヶ月" | "3ヶ月" | "6ヶ月" | "それ以上" のいずれか')
  if (!budget) emptyFields.push('budget（予算感）: "〜30万" | "〜50万" | "〜100万" | "100万以上" | "応相談" のいずれか')
  if (!yourRole) emptyFields.push('yourRole（役割）: 技術スタックに合った職種名（例: フルスタックエンジニア）')
  if (!hourlyRate) emptyFields.push('hourlyRate（時給）: 役割・技術スタックに合った時給（数値のみ、例: 5000）')

  const prompt = `フリーランスエンジニアの提案書作成を支援してください。
以下の情報をもとに、必ずJSON形式のみで回答してください。

【入力情報】
プロジェクト名: ${projectTitle || '（未入力）'}
クライアント名: ${clientName || '（未入力）'}
技術スタック: ${techStack?.length > 0 ? techStack.join(', ') : '（未入力）'}
${currentDescription ? `現在の概要: ${currentDescription}` : ''}

【出力するJSONの形式】
{
  "description": "案件概要（200〜300文字、プロジェクトの背景・目的・課題・解決策・期待効果を含む自然なビジネス文章）",
  ${emptyFields.length > 0 ? emptyFields.map(f => `"${f.split('（')[0].trim()}": "値"`) .join(',\n  ') : ''}
}

【制約】
- 案件概要は箇条書きではなく自然なビジネス文章で記述
${emptyFields.length > 0 ? `- 以下のフィールドの値を提案してください:\n${emptyFields.map(f => `  - ${f}`).join('\n')}` : ''}
- JSONのみを出力し、前後に説明文は不要`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : '{}')
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ description: text })
  }
}
