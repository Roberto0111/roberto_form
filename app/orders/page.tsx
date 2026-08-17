import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { ensureOrdersSchema } from "@/db/orders";
import { orders } from "@/db/schema";
import { formatPrice } from "@/lib/catalog";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";

export const dynamic = "force-dynamic";

type StoredItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

const statusLabel: Record<string, string> = {
  pending_review: "待確認規格",
  awaiting_transfer: "待轉帳",
  paid: "已付款",
  producing: "製作中",
  shipped: "已出貨",
  completed: "已完成",
  cancelled: "已取消",
};

export default async function OrdersPage() {
  const user = await requireChatGPTUser("/orders");
  const allowedEmail = (process.env.ORDER_ADMIN_EMAIL ?? "").toLowerCase();

  if (!allowedEmail || user.email.toLowerCase() !== allowedEmail) {
    return (
      <main className="orders-admin denied">
        <p className="eyebrow">ROBERT FORM · PRIVATE</p>
        <h1>這個帳號沒有訂單管理權限。</h1>
        <p>目前登入：{user.email}</p>
        <a href={chatGPTSignOutPath("/orders")}>切換登入帳號</a>
      </main>
    );
  }

  await ensureOrdersSchema();
  const allOrders = await getDb().select().from(orders).orderBy(desc(orders.createdAt)).limit(100);

  return (
    <main className="orders-admin">
      <header>
        <div>
          <p className="eyebrow">ROBERT FORM · ORDER DESK</p>
          <h1>訂單管理</h1>
        </div>
        <div className="orders-admin-actions">
          <span>{user.email}</span>
          <a href="/">返回網站</a>
          <a href={chatGPTSignOutPath("/")}>登出</a>
        </div>
      </header>

      <section className="orders-summary">
        <strong>{allOrders.length}</strong>
        <span>最近 100 筆訂單</span>
      </section>

      <section className="orders-list">
        {allOrders.length === 0 ? <p className="orders-empty">目前還沒有訂單。</p> : allOrders.map((order) => {
          let items: StoredItem[] = [];
          try { items = JSON.parse(order.itemsJson) as StoredItem[]; } catch { items = []; }
          const destination = order.shippingMethod === "cvs"
            ? `${order.storeChain} ${order.storeName}（${order.storeCode}）`
            : order.address;
          return (
            <article className="order-record" key={order.id}>
              <div className="order-record-head">
                <div><span>訂單編號</span><strong>{order.id}</strong></div>
                <span className={`order-status ${order.status}`}>{statusLabel[order.status] ?? order.status}</span>
                <time>{new Date(order.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</time>
              </div>
              <div className="order-record-grid">
                <div><span>買家</span><strong>{order.customerName}</strong><p>{order.phone}<br />{order.email}</p></div>
                <div><span>配送</span><strong>{order.shippingMethod === "cvs" ? "超商取貨" : "宅配"}</strong><p>{destination}</p></div>
                <div><span>款項</span><strong>{formatPrice(order.total)}</strong><p>銀行轉帳 · 尚待人工確認</p></div>
              </div>
              <ul className="order-items">
                {items.map((item, index) => <li key={`${order.id}-${index}`}><span>{item.name} × {item.quantity}</span><strong>{formatPrice(item.lineTotal)}</strong></li>)}
              </ul>
              {order.note && <p className="order-note"><strong>備註：</strong>{order.note}</p>}
            </article>
          );
        })}
      </section>
    </main>
  );
}
