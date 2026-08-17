import type { InferSelectModel } from "drizzle-orm";
import { products } from "./catalog";
import { carrierTrackingPages, customerOrderStatusLabels, type PublicOrder, type PublicOrderItem, type PublicTimelineEvent } from "./order-status";
import { isOrderStatus, type OrderStatus } from "./order-workflow";
import { orderEvents, orders } from "@/db/schema";

type OrderRow = InferSelectModel<typeof orders>;
type OrderEventRow = InferSelectModel<typeof orderEvents>;
type StoredItem = {
  productIndex?: number;
  name: string;
  englishName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

const stageDefinitions: Array<{ key: string; label: string; description: string; statuses: OrderStatus[] }> = [
  { key: "received", label: "訂單送出", description: "我們已收到商品與聯絡資料。", statuses: ["pending_review"] },
  { key: "confirmed", label: "店家確認", description: "規格、授權、金額與交期已確認。", statuses: ["awaiting_transfer"] },
  { key: "transfer", label: "轉帳回報", description: "買家已送出末五碼，等待人工核帳。", statuses: ["payment_review"] },
  { key: "paid", label: "款項確認", description: "店家已確認款項入帳。", statuses: ["paid"] },
  { key: "producing", label: "製作中", description: "作品已排入 3D 列印與後處理。", statuses: ["producing"] },
  { key: "shipped", label: "已出貨", description: "包裹已交付物流，可使用單號查詢。", statuses: ["shipped"] },
  { key: "completed", label: "訂單完成", description: "本次訂單流程已完成。", statuses: ["completed"] },
];

const eventKeys: Record<string, string> = {
  confirmation_email_sent: "confirmed",
  confirm_manual: "confirmed",
  mark_paid: "paid",
  start_production: "producing",
  mark_shipped: "shipped",
  complete: "completed",
};

export function serializePublicOrder(order: OrderRow, events: OrderEventRow[]): PublicOrder {
  const status = isOrderStatus(order.status) ? order.status : "pending_review";
  let storedItems: StoredItem[] = [];
  try { storedItems = JSON.parse(order.itemsJson) as StoredItem[]; } catch { storedItems = []; }

  const items: PublicOrderItem[] = storedItems.map((item) => {
    const product = Number.isInteger(item.productIndex) && products[item.productIndex!]
      ? products[item.productIndex!]
      : products.find((candidate) => candidate.name === item.englishName || candidate.zh === item.name);
    return { ...item, image: product?.image ?? null };
  });

  const eventTimes = new Map<string, string>();
  for (const event of events) {
    const key = eventKeys[event.action];
    if (key && !eventTimes.has(key)) eventTimes.set(key, event.createdAt);
  }
  eventTimes.set("received", order.createdAt);
  if (order.transferReportedAt) eventTimes.set("transfer", order.transferReportedAt);
  if (order.paymentReceivedAt) eventTimes.set("paid", order.paymentReceivedAt);
  if (order.productionStartedAt) eventTimes.set("producing", order.productionStartedAt);
  if (order.shippedAt) eventTimes.set("shipped", order.shippedAt);
  if (order.completedAt) eventTimes.set("completed", order.completedAt);

  const currentIndex = status === "cancelled"
    ? -1
    : Math.max(0, stageDefinitions.findIndex((stage) => stage.statuses.includes(status)));
  const timeline: PublicTimelineEvent[] = stageDefinitions.map((stage, index) => ({
    key: stage.key,
    label: stage.label,
    description: stage.description,
    at: eventTimes.get(stage.key) ?? null,
    state: status === "cancelled" ? "cancelled" : index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming",
  }));
  if (!order.transferReportedAt) {
    const transferStage = timeline.find((stage) => stage.key === "transfer");
    if (transferStage) {
      transferStage.label = "款項核對";
      transferStage.description = ["paid", "producing", "shipped", "completed"].includes(status)
        ? "店家已由銀行入帳紀錄直接確認款項。"
        : "等待買家回報轉帳，或由店家直接核對入帳。";
    }
  }

  const showBank = status === "awaiting_transfer" || status === "payment_review";
  const carrier = order.carrier ?? "";
  const updatedAt = events.at(-1)?.createdAt ?? order.createdAt;

  return {
    id: order.id,
    createdAt: order.createdAt,
    status,
    statusLabel: customerOrderStatusLabels[status],
    customerName: order.customerName,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    shippingMethod: order.shippingMethod === "home" ? "home" : "cvs",
    destination: order.shippingMethod === "cvs"
      ? `${order.storeChain ?? ""} ${order.storeName ?? ""}（${order.storeCode ?? ""}）`
      : order.address ?? "",
    items,
    timeline,
    bank: showBank ? {
      name: process.env.BANK_NAME ?? "",
      code: process.env.BANK_CODE ?? "",
      branch: process.env.BANK_BRANCH ?? "",
      account: process.env.BANK_ACCOUNT ?? "",
      holder: process.env.BANK_HOLDER ?? "",
    } : null,
    transfer: order.transferReportedAt ? {
      lastFive: order.transferLastFive ?? "",
      date: order.transferDate ?? "",
      amount: order.transferAmount ?? order.total,
      note: order.transferNote ?? "",
      reportedAt: order.transferReportedAt,
    } : null,
    shipment: order.trackingNumber ? {
      carrier,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl || carrierTrackingPages[carrier] || "",
      shippedAt: order.shippedAt,
    } : null,
    canReportTransfer: status === "awaiting_transfer",
    updatedAt,
  };
}
