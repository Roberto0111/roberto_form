import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("includes the Robert Form catalog, checkout, and order contacts", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /ROBERT FORM｜3D 列印生活選品/);
  assert.match(page, /把想像/);
  assert.match(page, /瀏覽 97 件選品/);
  assert.match(page, /loxa8858@gmail\.com/);
  assert.match(page, /instagram\.com\/radish_studio_/);
  assert.match(page, /訂製洽詢/);
  assert.match(page, /Instagram 私訊/);
  assert.match(page, /Email 訂製洽詢/);
  assert.match(page, /照片轉立體作品/);
  assert.match(page, /印上姓名與文字/);
  assert.match(page, /Logo、圖案與 QR Code/);
  assert.match(page, /送出訂單，等待確認/);
  assert.match(page, /超商門市取貨/);
  assert.match(page, /綠界線上付款/);
  assert.match(page, /複製商品連結/);
  assert.match(page, /searchParams\.set\("product"/);
  assert.doesNotMatch(page, /<a[^>]+href=["'][^"']*makerworld\.com/i);
});

test("creates stable direct links for every product", async () => {
  const catalog = await readFile(new URL("../lib/catalog.ts", import.meta.url), "utf8");
  assert.match(catalog, /export const productSlug/);
  assert.match(catalog, /replace\(\/\[\^a-z0-9\]\+\/g, "-"\)/);
});

test("protects and supports the complete order workflow", async () => {
  const manager = await readFile(new URL("../app/orders/order-manager.tsx", import.meta.url), "utf8");
  const adminRoute = await readFile(new URL("../app/api/orders/[id]/route.ts", import.meta.url), "utf8");
  const email = await readFile(new URL("../lib/order-email.ts", import.meta.url), "utf8");
  const workflow = await readFile(new URL("../lib/order-workflow.ts", import.meta.url), "utf8");
  assert.match(workflow, /確認訂單並寄 Email/);
  assert.match(workflow, /確認已入帳/);
  assert.match(workflow, /開始製作/);
  assert.match(workflow, /標記已出貨/);
  assert.match(manager, /處理紀錄/);
  assert.match(manager, /拓竹列印設定/);
  assert.match(manager, /product\.source/);
  assert.match(adminRoute, /ORDER_ADMIN_EMAIL/);
  assert.match(adminRoute, /sendOrderConfirmationEmail/);
  assert.match(email, /Idempotency-Key/);
  assert.match(email, /https:\/\/api\.brevo\.com\/v3\/smtp\/email/);
  assert.match(email, /https:\/\/api\.resend\.com\/emails/);
});

test("gives buyers a private order page, transfer report, and shipment tracking", async () => {
  const checkoutRoute = await readFile(new URL("../app/api/orders/route.ts", import.meta.url), "utf8");
  const statusRoute = await readFile(new URL("../app/api/order-status/[token]/route.ts", import.meta.url), "utf8");
  const lookupRoute = await readFile(new URL("../app/api/order-status/lookup/route.ts", import.meta.url), "utf8");
  const buyerPage = await readFile(new URL("../app/track/order-status-view.tsx", import.meta.url), "utf8");
  const manager = await readFile(new URL("../app/orders/order-manager.tsx", import.meta.url), "utf8");
  assert.match(checkoutRoute, /accessToken/);
  assert.match(checkoutRoute, /trackingPath/);
  assert.match(statusRoute, /transferLastFive/);
  assert.match(statusRoute, /payment_review/);
  assert.match(lookupRoute, /orders\.email/);
  assert.match(buyerPage, /訂單進度/);
  assert.match(buyerPage, /我已完成轉帳/);
  assert.match(buyerPage, /前往官方物流查詢/);
  assert.match(manager, /確認出貨並公開物流資訊/);
  assert.match(manager, /開啟專屬訂單頁/);
  assert.match(manager, /款項已入帳，更新買家進度/);
});

test("offers a signed-in customer account filtered by verified email", async () => {
  const account = await readFile(new URL("../app/account/page.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(account, /requireChatGPTUser\("\/account"\)/);
  assert.match(account, /eq\(orders\.email, user\.email\.toLowerCase\(\)\)/);
  assert.match(account, /我的訂單/);
  assert.match(account, /查看進度與訂單內容/);
  assert.match(page, /登入／我的訂單/);
});

test("keeps the full site navigation available on mobile", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(page, /mobile-menu-trigger/);
  assert.match(page, /手機版主要導覽/);
  assert.match(page, /使用訂單編號查詢/);
  assert.match(styles, /\.mobile-menu-panel/);
  assert.match(styles, /\.mobile-menu-trigger/);
});

test("ships 97 unique products and the scheduled Reel batch", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const catalog = await readFile(new URL("../lib/catalog.ts", import.meta.url), "utf8");
  const productCount = (catalog.match(/\{ name:/g) ?? []).length;
  assert.equal(productCount, 97);

  const productSources = [...catalog.matchAll(/source: "([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.equal(new Set(productSources).size, productSources.length);
  assert.doesNotMatch(page, /href=\{product\.source\}/);

  const reelNames = [
    "01-brand-intro-reel.mp4",
    "02-moon-lamp-reel.mp4",
    "03-jewelry-tree-reel.mp4",
    "04-desk-organizer-reel.mp4",
    "05-japandi-planters-reel.mp4",
    "06-bottle-opener-reel.mp4",
    "07-custom-luggage-tags-reel.mp4",
    "08-chair-sand-adaptors-reel.mp4",
    "09-custom-process-reel.mp4",
    "10-entryway-organizer-reel.mp4",
    "11-camping-spice-rack-reel.mp4",
    "12-travel-cable-organizer-reel.mp4",
    "13-bath-towel-hooks-reel.mp4",
    "14-midcentury-planter-reel.mp4",
    "15-keychain-opener-reel.mp4",
    "16-travel-hygiene-kit-reel.mp4",
    "17-camp-chair-cup-holder-reel.mp4",
    "18-custom-letter-beads-reel.mp4",
  ];
  await Promise.all(
    reelNames.map((name) =>
      access(new URL(`../public/social/instagram/${name}`, import.meta.url)),
    ),
  );
});
