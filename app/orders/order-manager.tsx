"use client";

import { useMemo, useState } from "react";
import { formatPrice, products } from "@/lib/catalog";
import { orderActions, orderStatusLabels, orderStatuses, type OrderActionName, type OrderStatus } from "@/lib/order-workflow";

type StoredItem = { productIndex?: number; name: string; englishName?: string; quantity: number; unitPrice: number; lineTotal: number };
type AdminOrder = {
  id: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  shippingMethod: string;
  shippingFee: number;
  subtotal: number;
  total: number;
  customerName: string;
  phone: string;
  email: string;
  address: string | null;
  storeChain: string | null;
  storeName: string | null;
  storeCode: string | null;
  note: string | null;
  itemsJson: string;
  accessToken: string | null;
  transferLastFive: string | null;
  transferDate: string | null;
  transferAmount: number | null;
  transferNote: string | null;
  transferReportedAt: string | null;
  paymentReceivedAt: string | null;
  productionStartedAt: string | null;
  shippedAt: string | null;
  completedAt: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
};
type AdminEvent = {
  id: number;
  orderId: string;
  createdAt: string;
  action: string;
  previousStatus: string;
  nextStatus: string;
  actorEmail: string;
  message: string | null;
  externalId: string | null;
};

const actionsByStatus: Record<OrderStatus, OrderActionName[]> = {
  pending_review: ["confirm", "confirm_manual", "cancel"],
  awaiting_transfer: ["mark_paid", "resend_confirmation", "cancel"],
  payment_review: ["mark_paid", "request_transfer_again", "cancel"],
  paid: ["start_production", "cancel"],
  producing: ["mark_shipped", "cancel"],
  shipped: ["complete"],
  completed: [],
  cancelled: ["reopen"],
};

const paymentNote: Record<OrderStatus, string> = {
  pending_review: "銀行轉帳 · 等待店家確認",
  awaiting_transfer: "確認信已寄出 · 等待買家轉帳",
  payment_review: "買家已回報 · 等待人工核帳",
  paid: "銀行轉帳 · 已人工核帳",
  producing: "已收款 · 製作中",
  shipped: "已收款 · 已出貨",
  completed: "已收款 · 訂單完成",
  cancelled: "訂單已取消",
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function OrderManager({ initialOrders, initialEvents, emailConfigured }: {
  initialOrders: AdminOrder[];
  initialEvents: AdminEvent[];
  emailConfigured: boolean;
}) {
  const [allOrders, setAllOrders] = useState(initialOrders);
  const [events, setEvents] = useState(initialEvents);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [busyOrder, setBusyOrder] = useState("");
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [shipmentDrafts, setShipmentDrafts] = useState<Record<string, { carrier: string; trackingNumber: string; trackingUrl: string }>>({});

  const counts = useMemo(() => Object.fromEntries(orderStatuses.map((status) => [status, allOrders.filter((order) => order.status === status).length])) as Record<OrderStatus, number>, [allOrders]);
  const shownOrders = filter === "all" ? allOrders : allOrders.filter((order) => order.status === filter);

  const performAction = async (order: AdminOrder, actionName: OrderActionName, extra: Record<string, string> = {}) => {
    if (actionName === "cancel" && !window.confirm(`確定要取消訂單 ${order.id}？`)) return;
    setBusyOrder(order.id);
    setNotice(null);
    try {
      const response = await fetch(`${basePath}/api/orders/${encodeURIComponent(order.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: actionName, ...extra }),
      });
      const result = await response.json() as { order?: { id: string; status: string }; event?: AdminEvent; message?: string; error?: string };
      if (!response.ok || !result.order) throw new Error(result.error ?? "訂單更新失敗。");
      setAllOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: result.order!.status } : item));
      if (result.event) setEvents((current) => [result.event!, ...current]);
      setNotice({ kind: "success", text: result.message ?? "訂單已更新。" });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "訂單更新失敗。" });
    } finally {
      setBusyOrder("");
    }
  };

  return (
    <>
      {!emailConfigured && <div className="orders-setup-warning"><strong>自動寄信尚未啟用</strong><span>狀態管理已可使用；設定寄件服務後，「確認訂單並寄 Email」就會開放。</span></div>}
      {notice && <div className={`orders-notice ${notice.kind}`} role="status"><span>{notice.text}</span><button type="button" onClick={() => setNotice(null)}>×</button></div>}

      <section className="orders-overview" aria-label="訂單狀態統計">
        <button className={filter === "all" ? "active" : ""} type="button" onClick={() => setFilter("all")}><strong>{allOrders.length}</strong><span>全部訂單</span></button>
        {orderStatuses.map((status) => <button className={filter === status ? "active" : ""} type="button" key={status} onClick={() => setFilter(status)}><strong>{counts[status]}</strong><span>{orderStatusLabels[status]}</span></button>)}
      </section>

      <section className="orders-list">
        {shownOrders.length === 0 ? <p className="orders-empty">這個狀態目前沒有訂單。</p> : shownOrders.map((order) => {
          let items: StoredItem[] = [];
          try { items = JSON.parse(order.itemsJson) as StoredItem[]; } catch { items = []; }
          const status = orderStatuses.includes(order.status as OrderStatus) ? order.status as OrderStatus : "pending_review";
          const destination = order.shippingMethod === "cvs" ? `${order.storeChain} ${order.storeName}（${order.storeCode}）` : order.address;
          const orderEvents = events.filter((event) => event.orderId === order.id);
          const emailSubject = encodeURIComponent(`ROBERT FORM 訂單確認｜${order.id}`);
          const emailBody = encodeURIComponent(`${order.customerName} 您好，您的訂單 ${order.id} 已確認，訂單總額為 ${formatPrice(order.total)}。`);
          const shipmentDraft = shipmentDrafts[order.id] ?? {
            carrier: order.shippingMethod === "cvs" ? (order.storeChain === "全家" ? "全家店到店" : "7-ELEVEN 交貨便") : "黑貓宅急便",
            trackingNumber: "",
            trackingUrl: "",
          };
          return (
            <article className="order-record" key={order.id}>
              <div className="order-record-head">
                <div><span>訂單編號</span><strong>{order.id}</strong></div>
                <span className={`order-status ${status}`}>{orderStatusLabels[status]}</span>
                <time>{new Date(order.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</time>
              </div>
              <div className="order-record-grid">
                <div><span>買家</span><strong>{order.customerName}</strong><p><a href={`tel:${order.phone}`}>{order.phone}</a><br /><a href={`mailto:${order.email}`}>{order.email}</a></p></div>
                <div><span>配送</span><strong>{order.shippingMethod === "cvs" ? "超商取貨" : "宅配"}</strong><p>{destination}</p></div>
                <div><span>款項</span><strong>{formatPrice(order.total)}</strong><p>{paymentNote[status]}</p></div>
              </div>
              <div className="order-buyer-link"><span>買家進度頁</span>{order.accessToken ? <><a href={`/track/${order.accessToken}`} target="_blank" rel="noreferrer">開啟專屬訂單頁 ↗</a><button type="button" onClick={() => navigator.clipboard?.writeText(new URL(`/track/${order.accessToken}`, window.location.origin).toString())}>複製連結</button></> : <small>舊訂單尚未產生連結；買家可用訂單編號與 Email 查詢。</small>}</div>
              {order.transferReportedAt && <div className="order-transfer-report"><div><span>轉帳回報</span><strong>{formatPrice(order.transferAmount ?? order.total)}</strong></div><dl><div><dt>帳號末五碼</dt><dd>{order.transferLastFive}</dd></div><div><dt>轉帳日期</dt><dd>{order.transferDate}</dd></div><div><dt>回報時間</dt><dd>{new Date(order.transferReportedAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</dd></div></dl>{order.transferNote && <p>買家備註：{order.transferNote}</p>}</div>}
              <div className="order-print-heading"><div><span>列印製作</span><strong>從訂單直接前往拓竹</strong></div><p>按商品的「拓竹列印設定」，會開啟該作品的 MakerWorld 列印頁；再選擇列印設定，即可交給 Bambu Studio／Bambu Handy。</p></div>
              <ul className="order-items">{items.map((item, index) => {
                const product = Number.isInteger(item.productIndex) && products[item.productIndex!]
                  ? products[item.productIndex!]
                  : products.find((candidate) => candidate.name === item.englishName || candidate.zh === item.name);
                return <li key={`${order.id}-${index}`}><div className="order-item-name"><span>{item.name} × {item.quantity}</span>{product ? <a className="bambu-print-link" href={product.source} target="_blank" rel="noreferrer" aria-label={`在拓竹開啟 ${item.name} 的列印設定`}>拓竹列印設定 ↗</a> : <small>這筆舊訂單沒有列印來源</small>}</div><strong>{formatPrice(item.lineTotal)}</strong></li>;
              })}</ul>
              {order.note && <p className="order-note"><strong>備註：</strong>{order.note}</p>}
              <div className="order-workflow">
                <div><span>下一步</span><div className="order-action-buttons">{actionsByStatus[status].filter((actionName) => (actionName !== "confirm_manual" || !emailConfigured) && actionName !== "mark_shipped").map((actionName) => {
                  const action = orderActions[actionName];
                  const needsEmail = Boolean(action.sendsConfirmationEmail);
                  return <button className={actionName === "confirm" ? "primary" : actionName === "cancel" ? "danger" : ""} type="button" key={actionName} disabled={busyOrder === order.id || (needsEmail && !emailConfigured)} title={needsEmail && !emailConfigured ? "請先設定寄件服務" : undefined} onClick={() => performAction(order, actionName)}>{busyOrder === order.id ? "處理中…" : action.label}</button>;
                })}{(status === "pending_review" || status === "awaiting_transfer") && !emailConfigured && <a href={`mailto:${order.email}?subject=${emailSubject}&body=${emailBody}`}>改用人工 Email ↗</a>}</div></div>
                {status === "producing" && <form className="shipment-admin-form" onSubmit={(event) => { event.preventDefault(); void performAction(order, "mark_shipped", shipmentDraft); }}>
                  <span>出貨與物流資訊</span>
                  <div><label><span>物流方式</span><select value={shipmentDraft.carrier} onChange={(event) => setShipmentDrafts((current) => ({ ...current, [order.id]: { ...shipmentDraft, carrier: event.target.value } }))}><option>7-ELEVEN 交貨便</option><option>全家店到店</option><option>黑貓宅急便</option><option>新竹物流</option><option>中華郵政</option><option>其他物流</option></select></label><label><span>物流單號</span><input required value={shipmentDraft.trackingNumber} onChange={(event) => setShipmentDrafts((current) => ({ ...current, [order.id]: { ...shipmentDraft, trackingNumber: event.target.value } }))} /></label><label><span>自訂查詢網址（選填）</span><input type="url" placeholder="https://" value={shipmentDraft.trackingUrl} onChange={(event) => setShipmentDrafts((current) => ({ ...current, [order.id]: { ...shipmentDraft, trackingUrl: event.target.value } }))} /></label><button type="submit" disabled={busyOrder === order.id}>{busyOrder === order.id ? "處理中…" : "確認出貨並公開物流資訊 →"}</button></div>
                </form>}
                {orderEvents.length > 0 && <details><summary>處理紀錄（{orderEvents.length}）</summary><ol>{orderEvents.map((event) => <li key={event.id}><time>{new Date(event.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</time><span>{event.message ?? event.action}</span></li>)}</ol></details>}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
