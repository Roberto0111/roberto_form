import { desc } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/db";
import { ensureOrdersSchema } from "@/db/orders";
import { orderEvents, orders } from "@/db/schema";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { isOrderEmailConfigured } from "@/lib/order-email";
import OrderManager from "./order-manager";

export const dynamic = "force-dynamic";

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
  const db = getDb();
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);
  const recentEvents = await db.select().from(orderEvents).orderBy(desc(orderEvents.createdAt)).limit(500);

  return (
    <main className="orders-admin">
      <header>
        <div>
          <p className="eyebrow">ROBERT FORM · ORDER DESK</p>
          <h1>訂單管理</h1>
        </div>
        <div className="orders-admin-actions">
          <span>{user.email}</span>
          <Link href="/">返回網站</Link>
          <a href={chatGPTSignOutPath("/")}>登出</a>
        </div>
      </header>

      <OrderManager initialOrders={allOrders} initialEvents={recentEvents} emailConfigured={isOrderEmailConfigured()} />
    </main>
  );
}
