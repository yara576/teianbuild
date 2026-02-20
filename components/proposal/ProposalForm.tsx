"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProposalInput } from "@/lib/types";
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
  const [form, setForm] = useState<ProposalInput>({
    projectTitle: "",
    clientName: "",
    projectDescription: "",
    techStack: defaults.techStack ?? [],
    duration: defaults.duration ?? "",
    budget: defaults.budget ?? "",
    yourName: "",
    yourRole: defaults.yourRole ?? "",
    hourlyRate: 0,
  });
  const [techStackInput, setTechStackInput] = useState(
    defaults.techStack?.join(", ") ?? ""
  );

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
          <Button type="submit" disabled={loading} className="mt-2 cursor-pointer">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
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
  );
}
