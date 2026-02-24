"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ProposalInput } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const durationOptions = [
  { value: "1週間", label: "1週間" },
  { value: "1ヶ月", label: "1ヶ月" },
  { value: "3ヶ月", label: "3ヶ月" },
  { value: "6ヶ月", label: "6ヶ月" },
  { value: "それ以上", label: "それ以上" },
];

const budgetOptions = [
  { value: "〜30万", label: "〜30万" },
  { value: "〜50万", label: "〜50万" },
  { value: "〜100万", label: "〜100万" },
  { value: "100万以上", label: "100万以上" },
  { value: "応相談", label: "応相談" },
];

interface ProposalFormProps {
  defaults?: Partial<ProposalInput>
}

// ログインモーダル
function LoginModal({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 text-center text-2xl font-bold text-gray-900">
          あと一歩！
        </div>
        <p className="mb-6 text-center text-sm text-gray-500">
          Google アカウントでログインすると提案書が生成されます。
          <br />
          入力内容はログイン後も引き継がれます。
        </p>
        <Button
          onClick={onLogin}
          className="w-full h-12 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google でログイン
        </Button>
        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}

export default function ProposalForm({ defaults = {} }: ProposalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assistLoading, setAssistLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [restored, setRestored] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<ProposalInput | null>(null);
  const [form, setForm] = useState<ProposalInput>({
    projectTitle: defaults.projectTitle ?? "",
    clientName: defaults.clientName ?? "",
    projectDescription: defaults.projectDescription ?? "",
    techStack: defaults.techStack ?? [],
    duration: defaults.duration ?? "",
    budget: defaults.budget ?? "",
    yourName: defaults.yourName ?? "",
    yourRole: defaults.yourRole ?? "",
    hourlyRate: defaults.hourlyRate ?? 0,
  });
  const [techStackInput, setTechStackInput] = useState(
    defaults.techStack?.join(", ") ?? ""
  );

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      // ログイン後に戻った際、下書きを復元する
      const draft = sessionStorage.getItem("proposalDraft");
      if (draft) {
        sessionStorage.removeItem("proposalDraft");
        try {
          const parsed = JSON.parse(draft) as ProposalInput;
          setForm(parsed);
          setTechStackInput(parsed.techStack?.join(", ") ?? "");
          setRestored(true);
        } catch {}
      }
    };
    init();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "hourlyRate" ? Number(value) : value,
    }));
  };

  const handleAssistDescription = async () => {
    setAssistLoading(true);
    setForm((prev) => ({ ...prev, projectDescription: "" }));
    try {
      const res = await fetch("/api/assist/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle: form.projectTitle,
          clientName: form.clientName,
          techStack: techStackInput.split(",").map((s) => s.trim()).filter(Boolean),
          currentDescription: form.projectDescription,
        }),
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setForm((prev) => ({ ...prev, projectDescription: text }));
      }
    } catch {
      alert("AIによる補完に失敗しました。もう一度お試しください。");
    } finally {
      setAssistLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 未ログインの場合はモーダルを表示
    if (!isLoggedIn) {
      const draft: ProposalInput = {
        ...form,
        techStack: techStackInput.split(",").map((s) => s.trim()).filter(Boolean),
      };
      setPendingDraft(draft);
      setShowLoginModal(true);
      return;
    }

    await generate();
  };

  const generate = async (draft?: ProposalInput) => {
    setLoading(true);
    const payload: ProposalInput = draft ?? {
      ...form,
      techStack: techStackInput.split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 403) {
        router.push('/dashboard');
        return;
      }

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      sessionStorage.setItem("proposalInput", JSON.stringify(payload));
      sessionStorage.setItem("proposalOutput", JSON.stringify(data));
      router.push("/preview");
    } catch {
      alert("提案書の生成に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = async () => {
    if (pendingDraft) {
      sessionStorage.setItem("proposalDraft", JSON.stringify(pendingDraft));
      sessionStorage.setItem("editMode", "draft");
      sessionStorage.setItem("proposalEditInput", JSON.stringify(pendingDraft));
    }
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/generate")}`,
      },
    });
  };

  return (
    <>
      {/* ログインモーダル */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLoginRedirect}
        />
      )}

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>提案書情報を入力</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 下書き復元メッセージ */}
          {restored && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <svg className="h-4 w-4 shrink-0 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <p className="text-sm text-green-700">
                入力内容を復元しました。このまま生成できます。
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* 案件タイトル */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="projectTitle">案件タイトル</Label>
              <Input
                id="projectTitle"
                name="projectTitle"
                value={form.projectTitle}
                onChange={handleChange}
                placeholder="例: ECサイトリニューアル"
                required
              />
            </div>

            {/* クライアント名 */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clientName">クライアント名</Label>
              <Input
                id="clientName"
                name="clientName"
                value={form.clientName}
                onChange={handleChange}
                placeholder="例: 株式会社○○"
                required
              />
            </div>

            {/* 案件概要 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="projectDescription">案件概要</Label>
                <button
                  type="button"
                  onClick={handleAssistDescription}
                  disabled={assistLoading || !form.projectTitle}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {assistLoading ? (
                    <>
                      <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      生成中...
                    </>
                  ) : (
                    <>✨ AIで補完</>
                  )}
                </button>
              </div>
              <Textarea
                id="projectDescription"
                name="projectDescription"
                value={form.projectDescription}
                onChange={handleChange}
                rows={4}
                placeholder="案件の概要を入力してください。プロジェクト名を入力後「✨ AIで補完」を押すと自動生成できます"
                required
              />
              {!form.projectTitle && (
                <p className="text-xs text-gray-400">※ 案件タイトルを入力すると「AIで補完」が使えます</p>
              )}
            </div>

            {/* 技術スタック */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="techStack">技術スタック（カンマ区切り）</Label>
              <Input
                id="techStack"
                name="techStack"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="例: React, Next.js, TypeScript, PostgreSQL"
              />
            </div>

            {/* 期間・予算 */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>期間</Label>
                <Select
                  value={form.duration}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, duration: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>予算感</Label>
                <Select
                  value={form.budget}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, budget: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* あなたの情報 */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="yourName">あなたの名前</Label>
                <Input
                  id="yourName"
                  name="yourName"
                  value={form.yourName}
                  onChange={handleChange}
                  placeholder="例: 山田太郎"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="yourRole">役割</Label>
                <Input
                  id="yourRole"
                  name="yourRole"
                  value={form.yourRole}
                  onChange={handleChange}
                  placeholder="例: フルスタックエンジニア"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="hourlyRate">時給（円）</Label>
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  value={form.hourlyRate || ""}
                  onChange={handleChange}
                  placeholder="例: 5000"
                  required
                />
              </div>
            </div>

            {/* 送信ボタン */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  生成中...
                </span>
              ) : (
                "提案書を生成する"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
