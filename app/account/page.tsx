import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { ensureOrdersSchema } from "@/db/orders";
import { orders } from "@/db/schema";
import { formatPrice, products } from "@/lib/catalog";
import { customerOrderStatusLabels } from "@/lib/order-status";
import { isOrderStatus } from "@/lib/order-workflow";

export const dynamic = "force-dynamic";

type AccountItem = { productIndex?: number; name: string; quantity: number; lineTotal: number };

export default async function AccountPage() {
  const user = await requireChatGPTUser("/account");
  await ensureOrdersSchema();
  const db = getDb();
  const accountOrders = await db.select().from(orders)
    .where(eq(orders.email, user.email.toLowerCase()))
    .orderBy(desc(orders.createdAt))
    .limit(100);

  const visibleOrders = await Promise.all(accountOrders.map(async (order) => {
    if (order.accessToken) return order;
    const accessToken = crypto.randomUUID().replaceAll("-", "");
    const [updated] = await db.update(orders).set({ accessToken }).where(eq(orders.id, order.id)).returning();
    return updated ?? { ...order, accessToken };
  }));

  return (
    <main className="account-shell">
      <header className="account-header">
        <Link href="/" className="brand"><span className="brand-mark">RF</span><span>ROBERT <span className="brand-light">FORM</span></span></Link>
        <div><span>{user.displayName}</span><Link href="/track">訂單編號查詢</Link><a href={chatGPTSignOutPath("/")}>登出</a></div>
      </header>

      <section className="account-hero">
        <div><p className="eyebrow">MY ROBERT FORM</p><h1>你的作品，<br />都在這裡。</h1></div>
        <div className="account-identity"><span>目前登入帳號</span><strong>{user.email}</strong><p>系統只會顯示使用這個 Email 下單的訂單。</p></div>
      </section>

      <section className="account-orders">
        <div className="account-section-title"><div><p className="eyebrow">ORDER HISTORY</p><h2>我的訂單</h2></div><span>{visibleOrders.length} 筆</span></div>
        {visibleOrders.length === 0 ? <div className="account-empty"><strong>這個帳號目前沒有訂單</strong><p>請確認登入 Email 與結帳時填寫的 Email 相同；也可以使用訂單編號查詢。</p><div><Link href="/">前往商品目錄 →</Link><Link href="/track">使用訂單編號查詢</Link></div></div> : <div className="account-order-list">{visibleOrders.map((order) => {
          let items: AccountItem[] = [];
          try { items = JSON.parse(order.itemsJson) as AccountItem[]; } catch { items = []; }
          const status = isOrderStatus(order.status) ? order.status : "pending_review";
          const firstItem = items[0];
          const firstProduct = firstItem && Number.isInteger(firstItem.productIndex) ? products[firstItem.productIndex!] : null;
          return <article key={order.id}>
            <div className="account-order-image">{firstProduct ? <img src={firstProduct.image} alt="" /> : <span>RF</span>}</div>
            <div className="account-order-main"><div><span>訂單編號</span><strong>{order.id}</strong></div><h3>{items.map((item) => `${item.name} × ${item.quantity}`).join("、") || "ROBERT FORM 訂單"}</h3><time>{new Date(order.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" })}</time></div>
            <div className="account-order-summary"><span className={`track-status-pill ${status}`}>{customerOrderStatusLabels[status]}</span><strong>{formatPrice(order.total)}</strong>{order.accessToken && <Link href={`/track/${order.accessToken}`}>查看進度與訂單內容 →</Link>}</div>
          </article>;
        })}</div>}
      </section>

      <section className="account-help"><div><p className="eyebrow">NEED HELP?</p><h2>找不到訂單嗎？</h2></div><p>最常見原因是登入 Email 和下單 Email 不同。你仍可使用訂單編號＋下單 Email 查詢，或聯絡我們協助。</p><div><Link href="/track">訂單編號查詢 →</Link><a href="mailto:loxa8858@gmail.com">Email 聯絡</a></div></section>
    </main>
  );
}
