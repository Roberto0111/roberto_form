import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Robert Form catalog and order contacts", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>ROBERT FORM｜3D 列印生活選品<\/title>/i);
  assert.match(html, /把想像/);
  assert.match(html, /瀏覽 97 件選品/);
  assert.match(html, /loxa8858@gmail\.com/);
  assert.match(html, /instagram\.com\/radish_studio_/);
  assert.match(html, /立即詢問訂製/);
  assert.match(html, /Instagram 私訊/);
  assert.match(html, /Email 訂製洽詢/);
  assert.match(html, /照片轉立體作品/);
  assert.match(html, /印上姓名與文字/);
  assert.match(html, /Logo、圖案與 QR Code/);
  assert.match(html, /洽詢時請提供/);
  assert.doesNotMatch(html, /<a[^>]+href=["'][^"']*makerworld\.com/i);
});

test("ships 97 unique products and the scheduled Reel batch", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const productCount = (page.match(/\{ name:/g) ?? []).length;
  assert.equal(productCount, 97);

  const productSources = [...page.matchAll(/source: "([^"]+)"/g)].map(
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
  ];
  await Promise.all(
    reelNames.map((name) =>
      access(new URL(`../public/social/instagram/${name}`, import.meta.url)),
    ),
  );
});
