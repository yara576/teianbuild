import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ナビゲーション */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">
            teian<span className="text-indigo-600">build</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-500 sm:block">無料で3件まで使えます</span>
            <Link href="/generate">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
                無料で試す
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ヒーロー */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        {/* 背景グラデーション */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-violet-100/40 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-6 text-center">
          <Badge className="mb-6 bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-200">
            ✨ AI で提案書作成を、もっとスマートに
          </Badge>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            提案書を、
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              30秒で完成
            </span>
            させる。
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-gray-500 sm:text-xl">
            案件情報を入力するだけで、AIがプロ品質の提案書・見積書を自動生成。
            フリーランスエンジニアの「提案書作成2時間」を終わらせます。
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/generate">
              <Button
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 text-base font-semibold shadow-lg shadow-indigo-200 cursor-pointer sm:w-auto"
              >
                今すぐ無料で試す →
              </Button>
            </Link>
            <p className="text-sm text-gray-400">クレジットカード不要 · 3件まで無料</p>
          </div>
        </div>

        {/* プレビューモック */}
        <div className="mx-auto mt-16 max-w-4xl px-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/80">
            {/* ウィンドウバー */}
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-4 text-xs text-gray-400">teianbuild.app/preview</span>
            </div>
            {/* 提案書プレビュー */}
            <div className="p-8 sm:p-12">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">提 案 書</h2>
                <p className="mt-1 text-sm text-gray-400">2026年2月19日</p>
              </div>
              <div className="mb-6 flex justify-between text-sm">
                <div>
                  <p className="font-semibold text-gray-700">株式会社サンプル 御中</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-700">山田 太郎</p>
                  <p className="text-gray-400">フルスタックエンジニア</p>
                </div>
              </div>
              <div className="mb-6 h-px bg-gray-100" />
              <h3 className="mb-3 text-lg font-bold text-gray-800">ECサイトリニューアル開発</h3>
              <div className="space-y-3">
                <div className="rounded-lg bg-indigo-50/60 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">提案概要</p>
                  <p className="text-sm text-gray-600">株式会社サンプル様向けに、Next.js・TypeScript を活用した EC サイトのリニューアル開発を提案いたします...</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "期間", value: "3ヶ月" },
                    { label: "合計金額", value: "¥1,120,000" },
                    { label: "成果物", value: "6点" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="mt-1 text-sm font-bold text-gray-800">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["項目", "数量", "単価", "金額"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        ["要件定義・設計", "16h", "¥5,000", "¥80,000"],
                        ["フロントエンド開発", "120h", "¥5,000", "¥600,000"],
                        ["バックエンド開発", "80h", "¥5,000", "¥400,000"],
                      ].map(([item, qty, price, amount]) => (
                        <tr key={item}>
                          <td className="px-3 py-2 text-gray-700">{item}</td>
                          <td className="px-3 py-2 text-gray-500">{qty}</td>
                          <td className="px-3 py-2 text-gray-500">{price}</td>
                          <td className="px-3 py-2 font-medium text-gray-700">{amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 統計 */}
      <section className="border-y border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: "30秒", label: "平均生成時間" },
              { value: "無料", label: "3件まで使える" },
              { value: "PDF", label: "そのまま提出できる" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold text-indigo-600 sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使い方 */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">3ステップで完成</h2>
            <p className="mt-3 text-gray-500">複雑な操作は一切不要。入力して、生成して、完成。</p>
          </div>
          <div className="relative grid gap-8 sm:grid-cols-3">
            {/* 接続線 */}
            <div className="absolute top-8 left-1/3 right-1/3 hidden h-px bg-gradient-to-r from-indigo-200 to-violet-200 sm:block" />
            {[
              { step: "01", title: "案件情報を入力", desc: "クライアント名・案件概要・技術スタック・単価を入力するだけ。" },
              { step: "02", title: "AI が自動生成", desc: "Claude AI が提案書・見積書・スケジュールを数秒で作成。" },
              { step: "03", title: "PDF でダウンロード", desc: "プロ品質のPDFをそのままクライアントに提出できます。" },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                  <span className="text-lg font-bold">{item.step}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 機能 */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">なぜ teianbuild なのか</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: "⚡",
                title: "圧倒的な速さ",
                desc: "従来2〜3時間かかっていた提案書作成が30秒に。浮いた時間を開発に集中できます。",
              },
              {
                icon: "🎯",
                title: "エンジニア特化",
                desc: "汎用AIとは違い、工数見積・技術スタック・フリーランス特有の条件を熟知したプロンプト設計。",
              },
              {
                icon: "📄",
                title: "即提出できるPDF",
                desc: "生成された提案書はそのままクライアントに提出できるプロ品質。書き直し不要。",
              },
              {
                icon: "🔒",
                title: "シンプルで安全",
                desc: "アカウント不要でスタート。入力した情報は生成にのみ使用され、保存・共有はされません。",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <span className="mb-3 block text-3xl">{f.icon}</span>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 最終 CTA */}
      <section className="relative overflow-hidden py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600" />
        </div>
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl">
            今日から、提案書で
            <br />
            時間を無駄にしない。
          </h2>
          <p className="mb-8 text-indigo-200">
            クレジットカード不要。アカウント登録不要。3件まで完全無料。
          </p>
          <Link href="/generate">
            <Button
              size="lg"
              className="bg-white text-indigo-700 hover:bg-indigo-50 px-10 py-6 text-base font-bold shadow-xl cursor-pointer"
            >
              無料で提案書を作成する →
            </Button>
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-400">
          © 2026 teianbuild · フリーランスエンジニアのための AI 提案書ジェネレーター
        </div>
      </footer>
    </div>
  );
}
