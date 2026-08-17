"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function TrackLookupPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const lookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${basePath}/api/order-status/lookup`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: form.get("orderId"), email: form.get("email") }),
      });
      const result = await response.json() as { trackingPath?: string; error?: string };
      if (!response.ok || !result.trackingPath) throw new Error(result.error ?? "查詢失敗。");
      window.location.assign(`${basePath}${result.trackingPath}`);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "查詢失敗，請稍後再試。" );
      setSubmitting(false);
    }
  };

  return (
    <main className="track-lookup-shell">
      <header><Link href="/" className="brand"><span className="brand-mark">RF</span><span>ROBERT <span className="brand-light">FORM</span></span></Link><div><Link href="/account">登入／我的訂單</Link><Link href="/">返回商品目錄</Link></div></header>
      <section>
        <div className="track-lookup-copy"><p className="eyebrow">ORDER LOOKUP</p><h1>查看你的<br />作品進度。</h1><p>輸入訂單編號與結帳時使用的 Email，即可安全返回專屬訂單頁。</p></div>
        <form onSubmit={lookup}>
          <label><span>訂單編號</span><input name="orderId" required autoCapitalize="characters" placeholder="RF20260817ABC123" /></label>
          <label><span>下單 Email</span><input name="email" type="email" required autoComplete="email" placeholder="name@example.com" /></label>
          {error && <p role="alert">{error}</p>}
          <button type="submit" disabled={submitting}>{submitting ? "正在查詢…" : "查詢訂單 →"}</button>
          <small>為保護個人資料，兩項資料必須與訂單完全相符。</small>
        </form>
      </section>
      <footer><span>需要協助？</span><a href="mailto:loxa8858@gmail.com">loxa8858@gmail.com</a><a href="https://www.instagram.com/radish_studio_/" target="_blank" rel="noreferrer">Instagram 私訊 ↗</a></footer>
    </main>
  );
}
