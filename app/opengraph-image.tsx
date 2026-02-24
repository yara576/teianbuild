import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "teianbuild - AI提案書ジェネレーター";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #f5f3ff 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 背景の装飾円 */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "rgba(99,102,241,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(139,92,246,0.07)",
          }}
        />

        {/* ロゴ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <span style={{ fontSize: "40px", fontWeight: "800", color: "#1e1b4b", letterSpacing: "-1px" }}>
            teian
          </span>
          <span style={{ fontSize: "40px", fontWeight: "800", color: "#4f46e5", letterSpacing: "-1px" }}>
            build
          </span>
        </div>

        {/* メインコピー */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "900",
            color: "#111827",
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: "24px",
            letterSpacing: "-2px",
          }}
        >
          提案書を、
          <span style={{ color: "#4f46e5" }}>30秒</span>
          で完成。
        </div>

        {/* サブコピー */}
        <div
          style={{
            fontSize: "26px",
            color: "#6b7280",
            textAlign: "center",
            lineHeight: 1.5,
            marginBottom: "48px",
            maxWidth: "800px",
          }}
        >
          案件情報を入力するだけで、AIがプロ品質の提案書・見積書を自動生成
        </div>

        {/* バッジ */}
        <div
          style={{
            display: "flex",
            gap: "16px",
          }}
        >
          {["✨ AI自動生成", "📄 PDF出力", "🆓 無料で3件"].map((text) => (
            <div
              key={text}
              style={{
                background: "white",
                border: "2px solid #e0e7ff",
                borderRadius: "999px",
                padding: "10px 24px",
                fontSize: "20px",
                color: "#4f46e5",
                fontWeight: "600",
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
