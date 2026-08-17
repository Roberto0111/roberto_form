import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { ensureOrdersSchema } from "@/db/orders";
import { orders } from "@/db/schema";
import { estimatePrice, products } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const SHIPPING_FEES = {
  cvs: 60,
  home: 100,
} as const;

type OrderRequest = {
  items?: Array<{ productIndex?: number; quantity?: number }>;
  customerName?: string;
  phone?: string;
  email?: string;
  shippingMethod?: keyof typeof SHIPPING_FEES;
  address?: string;
  storeChain?: string;
  storeName?: string;
  storeCode?: string;
  note?: string;
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function createOrderId() {
  const now = new Date();
  const date = [now.getUTCFullYear(), String(now.getUTCMonth() + 1).padStart(2, "0"), String(now.getUTCDate()).padStart(2, "0")].join("");
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `RF${date}${random}`;
}

export async function POST(request: Request) {
  let body: OrderRequest;
  try {
    body = (await request.json()) as OrderRequest;
  } catch {
    return NextResponse.json({ error: "訂單格式不正確。" }, { status: 400 });
  }

  const customerName = clean(body.customerName, 60);
  const phone = clean(body.phone, 30);
  const email = clean(body.email, 120).toLowerCase();
  const shippingMethod = body.shippingMethod;
  const address = clean(body.address, 240);
  const storeChain = clean(body.storeChain, 20);
  const storeName = clean(body.storeName, 80);
  const storeCode = clean(body.storeCode, 30);
  const note = clean(body.note, 600);

  if (!customerName || !/^09\d{8}$/.test(phone.replaceAll(/[-\s]/g, "")) || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "請確認姓名、台灣手機號碼與 Email。" }, { status: 400 });
  }
  if (!shippingMethod || !(shippingMethod in SHIPPING_FEES)) {
    return NextResponse.json({ error: "請選擇配送方式。" }, { status: 400 });
  }
  if (shippingMethod === "home" && !address) {
    return NextResponse.json({ error: "宅配訂單需要完整收件地址。" }, { status: 400 });
  }
  if (shippingMethod === "cvs" && (!storeChain || !storeName || !storeCode)) {
    return NextResponse.json({ error: "超商取貨需要超商、門市名稱與店號。" }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 30) {
    return NextResponse.json({ error: "購物車內容不正確。" }, { status: 400 });
  }

  const merged = new Map<number, number>();
  for (const rawItem of body.items) {
    const productIndex = Number(rawItem.productIndex);
    const quantity = Number(rawItem.quantity);
    if (!Number.isInteger(productIndex) || !products[productIndex] || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return NextResponse.json({ error: "商品或數量不正確。" }, { status: 400 });
    }
    merged.set(productIndex, Math.min(20, (merged.get(productIndex) ?? 0) + quantity));
  }

  const lineItems = Array.from(merged, ([productIndex, quantity]) => {
    const product = products[productIndex];
    const unitPrice = estimatePrice(product).price;
    return {
      productIndex,
      name: product.zh,
      englishName: product.name,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
    };
  });
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingFee = SHIPPING_FEES[shippingMethod];
  const total = subtotal + shippingFee;
  const id = createOrderId();
  const createdAt = new Date().toISOString();

  try {
    await ensureOrdersSchema();
    await getDb().insert(orders).values({
      id,
      createdAt,
      status: "pending_review",
      paymentMethod: "bank_transfer",
      shippingMethod,
      shippingFee,
      subtotal,
      total,
      customerName,
      phone,
      email,
      address: shippingMethod === "home" ? address : null,
      storeChain: shippingMethod === "cvs" ? storeChain : null,
      storeName: shippingMethod === "cvs" ? storeName : null,
      storeCode: shippingMethod === "cvs" ? storeCode : null,
      note: note || null,
      itemsJson: JSON.stringify(lineItems),
    });
  } catch (error) {
    console.error("Unable to create order", error);
    return NextResponse.json({ error: "目前無法建立訂單，請稍後再試或改用 IG 私訊。" }, { status: 500 });
  }

  return NextResponse.json({
    order: { id, createdAt, subtotal, shippingFee, total, shippingMethod, items: lineItems },
    bank: {
      name: process.env.BANK_NAME ?? "",
      code: process.env.BANK_CODE ?? "",
      branch: process.env.BANK_BRANCH ?? "",
      account: process.env.BANK_ACCOUNT ?? "",
      holder: process.env.BANK_HOLDER ?? "",
    },
    message: "訂單已送出。請等候店家確認規格與授權後，再依通知金額完成轉帳。",
  });
}
