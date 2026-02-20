import type { ProposalInput } from "./types"

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  color: string
  defaults: Partial<ProposalInput>
}

export const templates: Template[] = [
  {
    id: "web",
    name: "Web 開発",
    description: "フロントエンド・フルスタック開発の提案書",
    icon: "🌐",
    color: "indigo",
    defaults: {
      yourRole: "Webエンジニア",
      techStack: ["React", "Next.js", "TypeScript", "PostgreSQL"],
      duration: "3ヶ月",
      budget: "〜100万",
    },
  },
  {
    id: "api",
    name: "API / バックエンド",
    description: "API設計・バックエンド開発の提案書",
    icon: "⚙️",
    color: "violet",
    defaults: {
      yourRole: "バックエンドエンジニア",
      techStack: ["Node.js", "Python", "FastAPI", "PostgreSQL", "Docker"],
      duration: "3ヶ月",
      budget: "〜100万",
    },
  },
  {
    id: "infra",
    name: "インフラ / クラウド",
    description: "AWS・GCP構築・運用の提案書",
    icon: "☁️",
    color: "sky",
    defaults: {
      yourRole: "インフラエンジニア",
      techStack: ["AWS", "Terraform", "Docker", "Kubernetes", "CI/CD"],
      duration: "1ヶ月",
      budget: "〜50万",
    },
  },
  {
    id: "consultant",
    name: "技術顧問",
    description: "技術戦略・アドバイザリーの提案書",
    icon: "💡",
    color: "amber",
    defaults: {
      yourRole: "技術顧問",
      techStack: ["アーキテクチャ設計", "コードレビュー", "チーム支援"],
      duration: "それ以上",
      budget: "応相談",
    },
  },
]
