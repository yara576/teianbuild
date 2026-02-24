import Anthropic from "@anthropic-ai/sdk"
import type { ProposalInput, ProposalOutput } from "./types"

function parseBudgetYen(budget: string): number {
  if (budget === "〜30万") return 300000
  if (budget === "〜50万") return 500000
  if (budget === "〜100万") return 1000000
  if (budget === "100万以上") return 2000000
  return 0 // 応相談
}

function parseDurationDays(duration: string): number {
  if (duration === "1週間") return 5
  if (duration === "1ヶ月") return 20
  if (duration === "3ヶ月") return 60
  if (duration === "6ヶ月") return 120
  if (duration === "それ以上") return 180
  return 60
}

function extractJson(text: string): string {
  const match = text.match(/\{[\s\S]*\}/)
  return match ? match[0] : text
}

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

  // 予算・期間から工数のヒントを算出
  const budgetYen = parseBudgetYen(input.budget)
  const durationDays = parseDurationDays(input.duration)
  const maxHours = budgetYen > 0 && input.hourlyRate > 0
    ? Math.floor(budgetYen / input.hourlyRate)
    : durationDays * 6
  const budgetHint = budgetYen > 0
    ? `予算上限 ${budgetYen.toLocaleString()}円、時給 ${input.hourlyRate}円から算出される最大工数は約${maxHours}時間です。この範囲内で現実的な見積もりを作成してください。`
    : `期間${input.duration}（約${durationDays}営業日）と時給${input.hourlyRate}円を考慮し、現実的な工数で見積もりを作成してください。`

  const systemPrompt = `あなたは日本のフリーランスエンジニア向けに、クライアントへ提出するプロフェッショナルな提案書・見積書を作成する専門家です。

【出力ルール】
- 必ず以下のJSON形式のみを出力してください。前後に説明文・コードブロックは不要です
- 日本語の丁寧なビジネス文書として作成してください
- 技術スタックに合わせた具体的かつ専門的な内容にしてください
- 見積もりは提供された予算・期間・時給に基づき現実的な工数で算出してください

【提案書品質基準】
- summary: クライアントの課題・目的・採用技術・期待効果を含む説得力ある提案概要（3〜4文）
- scope: プロジェクトの範囲を明確に定義し、含まれる作業・含まれない作業を明示
- deliverables: 技術スタックに応じた具体的な成果物リスト（6〜8項目）
- timeline: 期間に応じた現実的なフェーズ分け（3〜4フェーズ）、各フェーズに具体的タスク4〜6個
- estimateItems: 作業を細分化した見積もり項目（6〜10項目）、合計が予算内に収まること
- notes: 日本のフリーランス商慣習に沿った契約・支払い・保証条件

【JSON形式】
{
  "summary": "提案概要",
  "scope": "プロジェクトスコープ",
  "deliverables": ["成果物1", "成果物2"],
  "timeline": [
    { "phase": "フェーズ名", "duration": "期間", "tasks": ["タスク1", "タスク2"] }
  ],
  "estimateItems": [
    { "item": "作業項目名", "quantity": 工数(数値), "unit": "時間", "unitPrice": 時給(数値), "amount": 合計(数値) }
  ],
  "totalAmount": 合計金額(数値),
  "notes": "備考・契約条件"
}`

  const userPrompt = `以下の情報を元に、${input.clientName}様への提案書を生成してください。

【案件情報】
プロジェクト名: ${input.projectTitle}
クライアント名: ${input.clientName}
案件概要: ${input.projectDescription}
技術スタック: ${input.techStack.length > 0 ? input.techStack.join(", ") : "未指定"}
期間: ${input.duration}
予算感: ${input.budget}

【担当者情報】
氏名: ${input.yourName}
役割: ${input.yourRole}
時給単価: ${input.hourlyRate.toLocaleString()}円

【工数の目安】
${budgetHint}

技術スタック（${input.techStack.join(", ")}）の特性を活かし、${input.projectDescription}を実現するための具体的かつ説得力のある提案書を作成してください。`

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  })

  const content = message.content[0]
  if (content.type !== "text") {
    return getMockProposal(input)
  }

  try {
    const jsonText = extractJson(content.text)
    return JSON.parse(jsonText) as ProposalOutput
  } catch {
    return getMockProposal(input)
  }
}
