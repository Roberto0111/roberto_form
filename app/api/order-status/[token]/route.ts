import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { ensureOrdersSchema } from "@/db/orders";
import { orderEvents, orders } from "@/db/schema";
import { serializePublicOrder } from "@/lib/public-order";

export const dynamic = "force-dynamic";

const tokenPattern = /^[a-f0-9]{32}$/;
const noStoreHeaders = { "cache-control": "no-store, private" };

async function findOrder(token: string) {
  if (!tokenPattern.test(token)) return null;
  await ensureOrdersSchema();
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.accessToken, token)).limit(1);
  if (!order) return null;
  const events = await db.select().from(orderEvents).where(eq(orderEvents.orderId, order.id)).orderBy(asc(orderEvents.createdAt));
  return { db, order, events };
}
export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const found = await findOrder(token);
  if (!found) return NextResponse.json({ error: "找不到這筆訂單。" }, { status: 404, headers: noStoreHeaders });
  return NextResponse.json({ order: serializePublicOrder(found.order, found.events) }, { headers: noStoreHeaders });
}

export async function PATCH(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const found = await findOrder(token);
  if (!found) return NextResponse.json({ error: "找不到這筆訂單。" }, { status: 404, headers: noStoreHeaders });
  if (found.order.status === "payment_review") {
    return NextResponse.json({ error: "轉帳資料已送出，正在等待店家核對。" }, { status: 409, headers: noStoreHeaders });
  }
  if (found.order.status !== "awaiting_transfer") {
    return NextResponse.json({ error: "目前訂單狀態不需要回報轉帳。" }, { status: 409, headers: noStoreHeaders });
  }

  let body: { lastFive?: unknown; transferDate?: unknown; amount?: unknown; note?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "轉帳資料格式不正確。" }, { status: 400, headers: noStoreHeaders });
  }
  const lastFive = typeof body.lastFive === "string" ? body.lastFive.trim() : "";
  const transferDate = typeof body.transferDate === "string" ? body.transferDate.trim() : "";
  const amount = Number(body.amount);
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 300) : "";
  if (!/^\d{5}$/.test(lastFive)) {
    return NextResponse.json({ error: "請輸入轉帳帳號末五碼。" }, { status: 400, headers: noStoreHeaders });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(transferDate) || Number.isNaN(Date.parse(`${transferDate}T00:00:00+08:00`))) {
    return NextResponse.json({ error: "請選擇正確的轉帳日期。" }, { status: 400, headers: noStoreHeaders });
  }
  if (!Number.isInteger(amount) || amount < 1 || amount > 10_000_000) {
    return NextResponse.json({ error: "請輸入正確的轉帳金額。" }, { status: 400, headers: noStoreHeaders });
  }

  const now = new Date().toISOString();
  const [updated] = await found.db.update(orders).set({
    status: "payment_review",
    transferLastFive: lastFive,
    transferDate,
    transferAmount: amount,
    transferNote: note || null,
    transferReportedAt: now,
  }).where(and(eq(orders.id, found.order.id), eq(orders.status, "awaiting_transfer"))).returning();
  if (!updated) {
    return NextResponse.json({ error: "訂單狀態剛剛已更新，請重新整理。" }, { status: 409, headers: noStoreHeaders });
  }
  await found.db.insert(orderEvents).values({
    orderId: found.order.id,
    createdAt: now,
    action: "transfer_reported",
    previousStatus: "awaiting_transfer",
    nextStatus: "payment_review",
    actorEmail: "buyer",
    message: `買家已回報轉帳末五碼 ${lastFive}，金額 NT$${amount}`,
  });
  const events = await found.db.select().from(orderEvents).where(eq(orderEvents.orderId, found.order.id)).orderBy(asc(orderEvents.createdAt));
  return NextResponse.json({
    order: serializePublicOrder(updated, events),
    message: "轉帳資料已送出，我們核對入帳後會更新訂單進度。",
  }, { headers: noStoreHeaders });
}
