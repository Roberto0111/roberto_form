export const orderStatuses = [
  "pending_review",
  "awaiting_transfer",
  "payment_review",
  "paid",
  "producing",
  "shipped",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_review: "等待人工確認",
  awaiting_transfer: "已確認・待轉帳",
  payment_review: "已回報・核帳中",
  paid: "已收款",
  producing: "製作中",
  shipped: "已出貨",
  completed: "已完成",
  cancelled: "已取消",
};

export const orderActionNames = [
  "confirm",
  "confirm_manual",
  "resend_confirmation",
  "mark_paid",
  "request_transfer_again",
  "start_production",
  "mark_shipped",
  "complete",
  "cancel",
  "reopen",
] as const;

export type OrderActionName = (typeof orderActionNames)[number];

export const orderActions: Record<OrderActionName, {
  label: string;
  from: OrderStatus[];
  to: OrderStatus;
  sendsConfirmationEmail?: boolean;
}> = {
  confirm: {
    label: "確認訂單並寄 Email",
    from: ["pending_review"],
    to: "awaiting_transfer",
    sendsConfirmationEmail: true,
  },
  confirm_manual: {
    label: "只更新為已確認",
    from: ["pending_review"],
    to: "awaiting_transfer",
  },
  resend_confirmation: {
    label: "重寄確認信",
    from: ["awaiting_transfer"],
    to: "awaiting_transfer",
    sendsConfirmationEmail: true,
  },
  mark_paid: { label: "確認已入帳", from: ["awaiting_transfer", "payment_review"], to: "paid" },
  request_transfer_again: { label: "請買家重新回報", from: ["payment_review"], to: "awaiting_transfer" },
  start_production: { label: "開始製作", from: ["paid"], to: "producing" },
  mark_shipped: { label: "標記已出貨", from: ["producing"], to: "shipped" },
  complete: { label: "完成訂單", from: ["shipped"], to: "completed" },
  cancel: {
    label: "取消訂單",
    from: ["pending_review", "awaiting_transfer", "payment_review", "paid", "producing"],
    to: "cancelled",
  },
  reopen: { label: "恢復待確認", from: ["cancelled"], to: "pending_review" },
};

export const isOrderStatus = (value: string): value is OrderStatus =>
  orderStatuses.includes(value as OrderStatus);

export const isOrderActionName = (value: string): value is OrderActionName =>
  orderActionNames.includes(value as OrderActionName);
