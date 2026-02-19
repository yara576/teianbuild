import Anthropic from "@anthropic-ai/sdk"
import type { ProposalInput, ProposalOutput } from "./types"

function getMockProposal(input: ProposalInput): ProposalOutput {
  const baseRate = input.hourlyRate
  const estimateItems = [
    { item: "要件定義・設計", quantity: 16, unit: "時間", unitPrice: baseRate, amount: 16 * baseRate },
    { item: "フロントエンド開発", quantity: 40, unit: "時間", unitPrice: baseRate, amount: 40 * baseRate },
    { item: "バックエンド開発", quantity: 32, unit: "時間", unitPrice: baseRate, amount: 32 * baseRate },
    { item: "テスト・品質保証", quantity: 16, unit: "時間", unitPrice: baseRate, amount: 16 * baseRate },
    { item: "デプロイ・運用準備", quantity: 8, unit: "時間", unitPrice: baseRate, amount: 8 * baseRate },
  ]
  const totalAmount = estimateItems.reduce((sum, item) => sum + item.amount, 0)

  return {
    summary: `${input.clientName}様向けに${input.projectTitle}の開発を提案いたします。${input.techStack.join("、")}を活用し、${input.duration}の期間で高品質なシステムを構築いたします。`,
    scope: `本プロジェクトでは、${input.projectDescription}を実現するためのシステム開発を行います。要件定義から設計、実装、テスト、デプロイまで一貫して対応いたします。`,
    deliverables: [
      "要件定義書",
      "システム設計書（画面設計・DB設計・API設計）",
      "ソースコード一式",
      "テスト結果報告書",
      "運用マニュアル",
      "デプロイ済み本番環境",
    ],
    timeline: [
      {
        phase: "要件定義・設計フェーズ",
        duration: "2週間",
        tasks: ["要件ヒアリング", "画面設計", "データベース設計", "API設計"],
      },
      {
        phase: "開発フェーズ",
        duration: "4週間",
        tasks: ["フロントエンド実装", "バックエンド実装", "API連携", "単体テスト"],
      },
      {
        phase: "テスト・リリースフェーズ",
        duration: "2週間",
        tasks: ["結合テスト", "ユーザー受入テスト", "バグ修正", "本番デプロイ"],
      },
    ],
    estimateItems,
    totalAmount,
    notes: `・お支払い条件：着手時50%、納品時50%\n・瑕疵担保期間：納品後3ヶ月\n・稼働時間：平日10:00〜19:00を基本とします\n・仕様変更が発生した場合は別途お見積もりとなります`,
  }
}

export async function generateProposal(input: ProposalInput): Promise<ProposalOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey || apiKey === "your_api_key_here") {
    return getMockProposal(input)
  }

  const client = new Anthropic({ apiKey })

  const systemPrompt = `あなたは日本語のフリーランスエンジニア向け提案書を生成する専門家です。
クライアントに提出するプロフェッショナルな提案書の内容を生成してください。
必ず以下のJSON形式で回答してください。それ以外のテキストは含めないでください。

{
  "summary": "提案概要（2-3文）",
  "scope": "プロジェクトスコープの説明",
  "deliverables": ["納品物1", "納品物2", ...],
  "timeline": [
    { "phase": "フェーズ名", "duration": "期間", "tasks": ["タスク1", "タスク2", ...] }
  ],
  "estimateItems": [
    { "item": "項目名", "quantity": 数値, "unit": "単位", "unitPrice": 数値, "amount": 数値 }
  ],
  "totalAmount": 合計金額（数値）,
  "notes": "備考・注意事項"
}`

  const userPrompt = `以下の情報を元に提案書を生成してください：

プロジェクト名: ${input.projectTitle}
クライアント名: ${input.clientName}
プロジェクト概要: ${input.projectDescription}
技術スタック: ${input.techStack.join(", ")}
期間: ${input.duration}
予算: ${input.budget}
担当者名: ${input.yourName}
役割: ${input.yourRole}
時給単価: ${input.hourlyRate}円`

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  })

  const content = message.content[0]
  if (content.type !== "text") {
    return getMockProposal(input)
  }

  try {
    return JSON.parse(content.text) as ProposalOutput
  } catch {
    return getMockProposal(input)
  }
}
