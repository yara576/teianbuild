import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { projectTitle, clientName, techStack, currentDescription } = await req.json()

  const prompt = `フリーランスエンジニアの提案書に記載する「案件概要」を作成してください。
プロジェクトの背景・目的・課題・解決策・期待効果を含む、説得力のある概要を200〜300文字程度で作成してください。
箇条書きではなく自然なビジネス文章で記述してください。

プロジェクト名: ${projectTitle || '（未入力）'}
クライアント名: ${clientName || '（未入力）'}
技術スタック: ${techStack?.length > 0 ? techStack.join(', ') : '（未入力）'}
${currentDescription ? `現在の概要（これを元に改善してください）: ${currentDescription}` : ''}

案件概要の本文のみを出力してください。タイトルや前置きは不要です。`

  const stream = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
