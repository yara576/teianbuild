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

export default function ProposalForm({ defaults = {} }: ProposalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [restored, setRestored] = useState(false);
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
      // ログイン状態を確認
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 未ログインの場合は下書き保存してログインページへ
    if (!isLoggedIn) {
      const draft: ProposalInput = {
        ...form,
        techStack: techStackInput.split(",").map((s) => s.trim()).filter(Boolean),
      };
      sessionStorage.setItem("proposalDraft", JSON.stringify(draft));
      sessionStorage.setItem("editMode", "draft");
      sessionStorage.setItem("proposalEditInput", JSON.stringify(draft));
      router.push("/auth/login?next=/generate");
      return;
    }

    setLoading(true);

    const payload: ProposalInput = {
      ...form,
      techStack: techStackInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>提案書情報を入力</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 未ログイン時のお知らせ */}
        {isLoggedIn === false && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <p className="text-sm text-indigo-700">
              入力後、Google アカウントでログインすると提案書が生成されます。入力内容は保持されます。
            </p>
          </div>
        )}

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
            <Label htmlFor="projectDescription">案件概要</Label>
            <Textarea
              id="projectDescription"
              name="projectDescription"
              value={form.projectDescription}
              onChange={handleChange}
              rows={4}
              placeholder="案件の概要を入力してください"
              required
            />
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
            ) : isLoggedIn === false ? (
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Google でログインして生成する
              </span>
            ) : (
              "提案書を生成する"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
