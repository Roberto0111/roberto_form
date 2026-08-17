import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { ensureOrdersSchema } from "@/db/orders";
import { orders } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { orderId?: unknown; email?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "查詢資料格式不正確。" }, { status: 400 });
  }
  const orderId = typeof body.orderId === "string" ? body.orderId.trim().toUpperCase().slice(0, 30) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 120) : "";
  if (!/^RF\d{8}[A-F0-9]{6}$/.test(orderId) || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "請確認訂單編號與下單 Email。" }, { status: 400 });
  }

  await ensureOrdersSchema();
  const db = getDb();
  const [order] = await db.select({ id: orders.id, accessToken: orders.accessToken })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.email, email)))
    .limit(1);
  if (!order) {
    return NextResponse.json({ error: "找不到相符訂單，請確認資料或聯絡店家。" }, { status: 404 });
  }

  const token = order.accessToken ?? crypto.randomUUID().replaceAll("-", "");
  if (!order.accessToken) await db.update(orders).set({ accessToken: token }).where(eq(orders.id, order.id));
  return NextResponse.json({ trackingPath: `/track/${token}` }, { headers: { "cache-control": "no-store, private" } });
}
