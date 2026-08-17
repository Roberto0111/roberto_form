import type { OrderStatus } from "./order-workflow";

export type PublicOrderItem = {
  name: string;
  englishName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image: string | null;
};
export type PublicTimelineEvent = {
  key: string;
  label: string;
  description: string;
  at: string | null;
  state: "complete" | "current" | "upcoming" | "cancelled";
};

export type PublicOrder = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  statusLabel: string;
  customerName: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingMethod: "cvs" | "home";
  destination: string;
  items: PublicOrderItem[];
  timeline: PublicTimelineEvent[];
  bank: null | {
    name: string;
    code: string;
    branch: string;
    account: string;
    holder: string;
  };
  transfer: null | {
    lastFive: string;
    date: string;
    amount: number;
    note: string;
    reportedAt: string;
  };
  shipment: null | {
    carrier: string;
    trackingNumber: string;
    trackingUrl: string;
    shippedAt: string | null;
  };
  canReportTransfer: boolean;
  updatedAt: string;
};

export const customerOrderStatusLabels: Record<OrderStatus, string> = {
  pending_review: "訂單已收到・等待店家確認",
  awaiting_transfer: "訂單已確認・等待轉帳",
  payment_review: "轉帳已回報・核帳中",
  paid: "款項已確認・等待製作",
  producing: "作品製作中",
  shipped: "商品已出貨",
  completed: "訂單已完成",
  cancelled: "訂單已取消",
};

export const carrierTrackingPages: Record<string, string> = {
  "7-ELEVEN 交貨便": "https://eservice.7-11.com.tw/e-tracking/search.aspx",
  "全家店到店": "https://fmec.famiport.com.tw/FP_Entrance/QueryShop?openExternalBrowser=1",
  "黑貓宅急便": "https://www.t-cat.com.tw/inquire/trace.aspx",
  "新竹物流": "https://www.hct.com.tw/Search/SearchGoods_n.aspx",
  "中華郵政": "https://postserv.post.gov.tw/pstmail/main_mail.html",
};
