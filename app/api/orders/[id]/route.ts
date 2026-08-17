import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { ensureOrdersSchema } from "@/db/orders";
import { orderEvents, orders } from "@/db/schema";
import { sendOrderConfirmationEmail } from "@/lib/order-email";
import { isOrderActionName, isOrderStatus, orderActions } from "@/lib/order-workflow";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  const allowedEmail = (process.env.ORDER_ADMIN_EMAIL ?? "").toLowerCase();
  if (!user) return NextResponse.json({ error: "請先登入店家帳號。" }, { status: 401 });
  if (!allowedEmail || user.email.toLowerCase() !== allowedEmail) {
    return NextResponse.json({ error: "這個帳號沒有訂單管理權限。" }, { status: 403 });
  }

  let actionName = "";
  try {
    const body = await request.json() as { action?: unknown };
    actionName = typeof body.action === "string" ? body.action : "";
  } catch {
    return NextResponse.json({ error: "操作格式不正確。" }, { status: 400 });
  }
  if (!isOrderActionName(actionName)) {
    return NextResponse.json({ error: "不支援的訂單操作。" }, { status: 400 });
  }

  const { id } = await context.params;
  await ensureOrdersSchema();
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return NextResponse.json({ error: "找不到這筆訂單。" }, { status: 404 });
  if (!isOrderStatus(order.status)) {
    return NextResponse.json({ error: "訂單目前狀態無法處理。" }, { status: 409 });
  }

  const action = orderActions[actionName];
  if (!action.from.includes(order.status)) {
    return NextResponse.json({ error: "訂單狀態已改變，請重新整理後再試。" }, { status: 409 });
  }

  let externalId: string | null = null;
  if (action.sendsConfirmationEmail) {
    const previousEmails = await db.select({ id: orderEvents.id })
      .from(orderEvents)
      .where(and(eq(orderEvents.orderId, id), eq(orderEvents.action, "confirmation_email_sent")))
      .orderBy(desc(orderEvents.id));
    try {
      externalId = await sendOrderConfirmationEmail(order, previousEmails.length + 1);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "確認信寄送失敗。" }, { status: 502 });
    }
  }

  if (action.to !== order.status) {
    await db.update(orders).set({ status: action.to }).where(and(eq(orders.id, id), eq(orders.status, order.status)));
  }
  const now = new Date().toISOString();
  const [event] = await db.insert(orderEvents).values({
    orderId: id,
    createdAt: now,
    action: action.sendsConfirmationEmail ? "confirmation_email_sent" : actionName,
    previousStatus: order.status,
    nextStatus: action.to,
    actorEmail: user.email,
    message: action.sendsConfirmationEmail ? `確認信已寄至 ${order.email}` : action.label,
    externalId,
  }).returning();

  return NextResponse.json({
    order: { id, status: action.to },
    event,
    message: action.sendsConfirmationEmail ? `訂單已確認，Email 已寄至 ${order.email}。` : `已更新為「${action.label}」。`,
  });
}

