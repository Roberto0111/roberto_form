import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { ensureOrdersSchema } from "@/db/orders";
import { orderEvents, orders } from "@/db/schema";
import { serializePublicOrder } from "@/lib/public-order";
import OrderStatusView from "../order-status-view";

export const dynamic = "force-dynamic";

export default async function TrackOrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{32}$/.test(token)) notFound();
  await ensureOrdersSchema();
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.accessToken, token)).limit(1);
  if (!order) notFound();
  const events = await db.select().from(orderEvents).where(eq(orderEvents.orderId, order.id)).orderBy(asc(orderEvents.createdAt));
  return <OrderStatusView token={token} initialOrder={serializePublicOrder(order, events)} />;
}
