"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import ProposalForm from "@/components/proposal/ProposalForm"
import { templates } from "@/lib/templates"
import type { Template } from "@/lib/templates"
import type { ProposalInput } from "@/lib/types"

const colorMap: Record<string, { card: string; badge: string; icon: string }> = {
  indigo: {
    card: "border-indigo-200 bg-indigo-50/50 hover:border-indigo-400 hover:bg-indigo-50",
    badge: "bg-indigo-100 text-indigo-700",
    icon: "bg-indigo-100",
  },
  violet: {
    card: "border-violet-200 bg-violet-50/50 hover:border-violet-400 hover:bg-violet-50",
    badge: "bg-violet-100 text-violet-700",
    icon: "bg-violet-100",
  },
  sky: {
    card: "border-sky-200 bg-sky-50/50 hover:border-sky-400 hover:bg-sky-50",
    badge: "bg-sky-100 text-sky-700",
    icon: "bg-sky-100",
  },
  amber: {
    card: "border-amber-200 bg-amber-50/50 hover:border-amber-400 hover:bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    icon: "bg-amber-100",
  },
}

export default function GeneratePage() {
  const [selected, setSelected] = useState<Template | null>(null)
  const [fromEdit, setFromEdit] = useState(false)

  useEffect(() => {
    const editMode = sessionStorage.getItem('editMode')
    if (editMode === 'true') {
      sessionStorage.removeItem('editMode')
      const saved = sessionStorage.getItem('proposalEditInput')
      if (saved) {
        try {
          const input = JSON.parse(saved) as ProposalInput
          setFromEdit(true)
          setSelected({ id: 'edit', name: '再編集', description: '', icon: '✏️', color: 'indigo', defaults: input })
        } catch {}
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* 戻るリンク */}
        <div className="mb-8">
          {selected ? (
            fromEdit ? (
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                ← ダッシュボードに戻る
              </Link>
            ) : (
              <button
                onClick={() => setSelected(null)}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                ← テンプレート選択に戻る
              </button>
            )
          ) : (
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              ← トップに戻る
            </Link>
          )}
        </div>

        {!selected ? (
          /* テンプレート選択 */
          <div>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900">テンプレートを選択</h1>
              <p className="mt-2 text-sm text-gray-500">
                案件タイプに合ったテンプレートを選ぶと、フォームに初期値が自動入力されます
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {templates.map((template) => {
                const colors = colorMap[template.color]
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelected(template)}
                    className={`group rounded-2xl border-2 p-6 text-left transition-all duration-150 cursor-pointer ${colors.card}`}
                  >
                    <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${colors.icon}`}>
                      {template.icon}
                    </div>
                    <h3 className="mb-1 text-base font-semibold text-gray-900">{template.name}</h3>
                    <p className="mb-3 text-sm text-gray-500">{template.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {template.defaults.techStack?.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors.badge}`}
                        >
                          {tech}
                        </span>
                      ))}
                      {(template.defaults.techStack?.length ?? 0) > 3 && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          +{(template.defaults.techStack?.length ?? 0) - 3}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* テンプレートなしで進む */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setSelected({ id: "blank", name: "テンプレートなし", description: "", icon: "", color: "indigo", defaults: {} })}
                className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors cursor-pointer"
              >
                テンプレートを使わずに入力する
              </button>
            </div>
          </div>
        ) : (
          /* フォーム */
          <div>
            {selected.id !== "blank" && selected.id !== "edit" && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
                <span className="text-xl">{selected.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{selected.name}</p>
                  <p className="text-xs text-gray-400">テンプレートが適用されています</p>
                </div>
              </div>
            )}
            <ProposalForm defaults={selected.defaults} />
          </div>
        )}
      </div>
    </div>
  )
}
