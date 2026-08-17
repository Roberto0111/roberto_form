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
  assert.doesNotMatch(page, /<a[^>]+href=["'][^"']*makerworld\.com/i);
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
  ];
  await Promise.all(
    reelNames.map((name) =>
      access(new URL(`../public/social/instagram/${name}`, import.meta.url)),
    ),
  );
});
