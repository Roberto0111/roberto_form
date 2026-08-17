"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import type { PublicOrder } from "@/lib/order-status";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const assetPath = (path: string) => `${basePath}${path}`;
const formatDateTime = (value: string | null) => value
  ? new Date(value).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
  : "";

export default function OrderStatusView({ token, initialOrder }: { token: string; initialOrder: PublicOrder }) {
  const [order, setOrder] = useState(initialOrder);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState("");

  const refresh = async (quiet = false) => {
    if (!quiet) setRefreshing(true);
    try {
      const response = await fetch(`${basePath}/api/order-status/${token}`, { cache: "no-store" });
      const result = await response.json() as { order?: PublicOrder; error?: string };
      if (!response.ok || !result.order) throw new Error(result.error ?? "目前無法更新進度。");
      setOrder(result.order);
    } catch (error) {
      if (!quiet) setNotice({ kind: "error", text: error instanceof Error ? error.message : "目前無法更新進度。" });
    } finally {
      if (!quiet) setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh(true);
    }, 30_000);
    return () => window.clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const submitTransfer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${basePath}/api/order-status/${token}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lastFive: form.get("lastFive"),
          transferDate: form.get("transferDate"),
          amount: Number(form.get("amount")),
          note: form.get("note"),
        }),
      });
      const result = await response.json() as { order?: PublicOrder; message?: string; error?: string };
      if (!response.ok || !result.order) throw new Error(result.error ?? "轉帳資料送出失敗。");
      setOrder(result.order);
      setNotice({ kind: "success", text: result.message ?? "轉帳資料已送出。" });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "轉帳資料送出失敗。" });
    } finally {
      setSubmitting(false);
    }
  };

  const copy = async (value: string, label: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  };

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  return (
    <main className="track-shell">
      <header className="track-header">
        <Link href="/" className="brand"><span className="brand-mark">RF</span><span>ROBERT <span className="brand-light">FORM</span></span></Link>
        <div><Link href="/track">查詢其他訂單</Link><button type="button" onClick={() => void refresh()} disabled={refreshing}>{refreshing ? "更新中…" : "重新整理進度"}</button></div>
      </header>

      <section className="track-hero">
        <div>
          <p className="eyebrow">ORDER STATUS</p>
          <span className={`track-status-pill ${order.status}`}>{order.statusLabel}</span>
          <h1>{order.customerName}，<br />我們正在處理你的作品。</h1>
        </div>
        <dl>
          <div><dt>訂單編號</dt><dd>{order.id}</dd></div>
          <div><dt>訂單總額</dt><dd>{formatPrice(order.total)}</dd></div>
          <div><dt>配送方式</dt><dd>{order.shippingMethod === "cvs" ? "超商門市取貨" : "宅配"}</dd></div>
          <div><dt>最後更新</dt><dd>{formatDateTime(order.updatedAt)}</dd></div>
        </dl>
      </section>

      {notice && <div className={`track-notice ${notice.kind}`} role="status">{notice.text}<button type="button" onClick={() => setNotice(null)}>×</button></div>}

      {order.status === "cancelled" && <section className="track-cancelled"><strong>這筆訂單已取消</strong><p>若有疑問或希望重新訂製，請直接聯絡 ROBERT FORM。</p></section>}

      <section className="track-grid">
        <div className="track-timeline-card">
          <div className="track-section-heading"><p className="eyebrow">PROGRESS</p><h2>訂單進度</h2></div>
          <ol className="track-timeline">
            {order.timeline.map((event) => <li key={event.key} className={event.state}>
              <span className="timeline-dot">{event.state === "complete" ? "✓" : ""}</span>
              <div><strong>{event.label}</strong><p>{event.description}</p>{event.at && <time>{formatDateTime(event.at)}</time>}</div>
            </li>)}
          </ol>
        </div>

        <div className="track-action-column">
          {order.status === "pending_review" && <section className="track-action-card waiting"><p className="eyebrow">NEXT STEP</p><h2>先不用轉帳</h2><p>店家正在確認模型授權、規格、金額與交期。確認完成後，本頁會顯示銀行資料與轉帳回報表單。</p></section>}

          {order.bank && order.canReportTransfer && <section className="track-action-card payment">
            <p className="eyebrow">PAYMENT</p><h2>完成銀行轉帳</h2><p>請依下列資料轉帳，再填寫末五碼讓店家核帳。</p>
            <dl className="track-bank">
              <div><dt>銀行</dt><dd>{order.bank.name}（{order.bank.code}）</dd></div>
              <div><dt>分行</dt><dd>{order.bank.branch}</dd></div>
              <div><dt>帳號</dt><dd>{order.bank.account}</dd></div>
              <div><dt>戶名</dt><dd>{order.bank.holder}</dd></div>
              <div><dt>應付金額</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
            <button className="track-copy-button" type="button" onClick={() => void copy(order.bank!.account, "account")}>{copied === "account" ? "已複製帳號 ✓" : "複製轉帳帳號"}</button>
            <form className="transfer-report-form" onSubmit={submitTransfer}>
              <div><label><span>轉帳帳號末五碼</span><input name="lastFive" required inputMode="numeric" pattern="[0-9]{5}" maxLength={5} placeholder="12345" /></label><label><span>轉帳日期</span><input name="transferDate" required type="date" defaultValue={today} max={today} /></label></div>
              <label><span>實際轉帳金額</span><input name="amount" required type="number" min={1} defaultValue={order.total} /></label>
              <label><span>備註（選填）</span><textarea name="note" rows={3} placeholder="例如：分兩筆轉帳、轉帳人姓名不同" /></label>
              <button type="submit" disabled={submitting}>{submitting ? "正在送出…" : "我已完成轉帳，送出核對 →"}</button>
              <small>送出不代表已入帳；店家核對後，進度會更新為「款項已確認」。</small>
            </form>
          </section>}

          {order.transfer && <section className="track-action-card transfer-summary"><p className="eyebrow">TRANSFER RECEIVED</p><h2>{order.status === "payment_review" ? "正在核對款項" : "轉帳資料"}</h2><dl><div><dt>帳號末五碼</dt><dd>{order.transfer.lastFive}</dd></div><div><dt>轉帳日期</dt><dd>{order.transfer.date}</dd></div><div><dt>回報金額</dt><dd>{formatPrice(order.transfer.amount)}</dd></div><div><dt>回報時間</dt><dd>{formatDateTime(order.transfer.reportedAt)}</dd></div></dl>{order.transfer.note && <p>備註：{order.transfer.note}</p>}</section>}

          {(["paid", "producing"] as string[]).includes(order.status) && <section className="track-action-card confirmed"><p className="eyebrow">PAYMENT CONFIRMED</p><h2>{order.status === "producing" ? "作品製作中" : "款項已確認"}</h2><p>{order.status === "producing" ? "作品已排入列印與後處理；完成包裝後會更新物流資訊。" : "款項已入帳，接下來將依排程開始製作。"}</p></section>}

          {order.shipment && <section className="track-action-card shipment"><p className="eyebrow">SHIPMENT</p><h2>包裹已出貨</h2><dl><div><dt>物流方式</dt><dd>{order.shipment.carrier}</dd></div><div><dt>物流單號</dt><dd>{order.shipment.trackingNumber}</dd></div><div><dt>出貨時間</dt><dd>{formatDateTime(order.shipment.shippedAt)}</dd></div></dl><div className="shipment-actions"><button type="button" onClick={() => void copy(order.shipment!.trackingNumber, "tracking")}>{copied === "tracking" ? "已複製 ✓" : "複製物流單號"}</button>{order.shipment.trackingUrl && <a href={order.shipment.trackingUrl} target="_blank" rel="noreferrer">前往官方物流查詢 ↗</a>}</div></section>}
        </div>
      </section>

      <section className="track-order-details">
        <div className="track-section-heading"><p className="eyebrow">ORDER DETAILS</p><h2>商品與配送</h2></div>
        <div className="track-detail-grid">
          <ul>{order.items.map((item, index) => <li key={`${item.name}-${index}`}>{item.image ? <img src={assetPath(item.image)} alt="" /> : <span className="item-placeholder">RF</span>}<div><strong>{item.name}</strong><small>{formatPrice(item.unitPrice)} × {item.quantity}</small></div><b>{formatPrice(item.lineTotal)}</b></li>)}</ul>
          <dl><div><dt>商品小計</dt><dd>{formatPrice(order.subtotal)}</dd></div><div><dt>配送費</dt><dd>{formatPrice(order.shippingFee)}</dd></div><div className="total"><dt>訂單總額</dt><dd>{formatPrice(order.total)}</dd></div><div><dt>收件地點</dt><dd>{order.destination}</dd></div></dl>
        </div>
      </section>

      <footer className="track-footer"><div><span className="brand-mark">RF</span><strong>ROBERT FORM</strong></div><p>訂單有任何問題？請提供訂單編號 {order.id}。</p><div><a href="https://www.instagram.com/radish_studio_/" target="_blank" rel="noreferrer">Instagram 私訊 ↗</a><a href={`mailto:loxa8858@gmail.com?subject=${encodeURIComponent(`ROBERT FORM 訂單詢問｜${order.id}`)}`}>Email 聯絡 →</a></div></footer>
    </main>
  );
}
