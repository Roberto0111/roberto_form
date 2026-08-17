"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { estimatePrice, formatPrice, products, productSlug, type Category, type Product } from "@/lib/catalog";

const filters = ["全部", "燈具", "飾品", "酒具", "家居", "植栽", "收納", "廚房", "寵物", "辦公", "衛浴", "旅行", "戶外"] as const;

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const assetPath = (path: string) => `${basePath}${path}`;

const categoryNotes: Record<Category, { use: string; styling: string; custom: string }> = {
  燈具: { use: "作為床邊、閱讀角或餐桌旁的柔和輔助光，讓造型與光影一起成為焦點。", styling: "搭配木質、亞麻與低彩度牆面，能放大燈罩層次與列印紋理。", custom: "可依空間洽詢燈罩色彩、尺寸與底座搭配，並確認適用燈組。" },
  飾品: { use: "集中展示戒指、手環與項鍊，拿取方便，也讓每天的搭配一目了然。", styling: "放在梳妝台或玄關，以首飾金屬色對比霧面材質，形成精緻層次。", custom: "可洽詢高度、分枝配置、姓名字樣與適合首飾數量的尺寸。" },
  酒具: { use: "適合家庭聚會、吧台與野餐開瓶使用，兼具互動感與收納機能。", styling: "搭配木托盤、透明玻璃與深色桌面，營造輕鬆但有設計感的飲酒角落。", custom: "可洽詢握柄色彩、尺寸、文字與適合瓶蓋規格；製作前確認結構強度。" },
  家居: { use: "放置鑰匙、香氛與日常小物，或單獨作為空間中的雕塑擺件。", styling: "適合玄關、層架與茶几，搭配石材、木質與留白能凸顯輪廓。", custom: "可依擺放位置洽詢尺寸、表面質感與符合室內色票的配色。" },
  植栽: { use: "承接小型觀葉、多肉或香草植物，依款式提供排水、滴水或壁掛功能。", styling: "以同色系花器成組陳列，搭配木架與自然光，建立有節奏的綠意角落。", custom: "可依盆徑、根系與澆水方式洽詢尺寸、排水孔及托盤配置。" },
  收納: { use: "整理桌面、層板與櫃內零散物件，利用堆疊或模組結構提高空間效率。", styling: "以兩至三種低彩度色分區，搭配標籤與整齊留白，視覺更清爽。", custom: "可洽詢格數、抽屜高度、堆疊方式與現有空間的精準尺寸。" },
  廚房: { use: "用於料理備料、餐具暫放、冰箱分類或咖啡角落的日常整理。", styling: "搭配淺木、白色檯面與不鏽鋼器具，維持乾淨實用的料理視覺。", custom: "可依器具與櫃體尺寸調整；接觸食物或高溫前會先確認合適材料與用途。" },
  寵物: { use: "協助飲水、餵食、梳理、散步或趣味攝影，讓日常照護更順手。", styling: "以居家主色搭配寵物用品，讓碗架與收納配件自然融入空間。", custom: "可依寵物體型、用品規格與姓名洽詢高度、尺寸及配色。" },
  辦公: { use: "集中筆具、手機、文件與線材，減少桌面干擾並保留快速拿取動線。", styling: "用同色系模組搭配木桌與金屬文具，建立安靜、清楚的工作區。", custom: "可依桌深、用品數量、線材出口與企業色洽詢尺寸及模組組合。" },
  衛浴: { use: "整理盥洗用品、毛巾與備品，讓檯面保持乾燥並縮短早晚拿取時間。", styling: "搭配石紋檯面、霧面五金與柔和中性色，營造乾淨的飯店感。", custom: "可依瓶罐、壁面與抽屜尺寸洽詢配色、排水方式與安裝結構。" },
  旅行: { use: "在行李箱、盥洗包或隨身包中分類線材、衛生用品與小型必需品。", styling: "以一致色系區分用途，搭配布質收納袋，打開行李時依然整齊清楚。", custom: "可洽詢姓名、QR 資訊、容量、分隔與符合行李配色的客製版本。" },
  戶外: { use: "服務露營、健行、沙灘與野餐情境，讓飲品、椅具與小工具更好使用。", styling: "選擇高辨識度色彩搭配帆布、木質與金屬裝備，兼顧安全與風格。", custom: "可依裝備規格、固定方式與戶外環境洽詢尺寸、色彩及耐候材料。" },
};

type CartItem = { productIndex: number; quantity: number };
type ShippingMethod = "cvs" | "home";
type CreatedOrder = {
  order: {
    id: string;
    subtotal: number;
    shippingFee: number;
    total: number;
    shippingMethod: ShippingMethod;
  };
  bank: { name: string; code: string; branch: string; account: string; holder: string };
  trackingPath: string;
  message: string;
};

const shippingFees: Record<ShippingMethod, number> = { cvs: 60, home: 100 };

export default function Home() {
  const [active, setActive] = useState<(typeof filters)[number]>("全部");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("cvs");
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [copiedProduct, setCopiedProduct] = useState("");
  const selectedPricing = selected ? estimatePrice(selected) : null;

  useEffect(() => {
    let savedCart: CartItem[] = [];
    try {
      const saved = window.localStorage.getItem("robert-form-cart");
      if (saved) savedCart = JSON.parse(saved) as CartItem[];
    } catch {
      window.localStorage.removeItem("robert-form-cart");
    }
    const timer = window.setTimeout(() => {
      setCart(savedCart);
      setCartReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (cartReady) window.localStorage.setItem("robert-form-cart", JSON.stringify(cart));
  }, [cart, cartReady]);

  useEffect(() => {
    const selectProductFromUrl = () => {
      const slug = new URLSearchParams(window.location.search).get("product");
      setSelected(slug ? products.find((product) => productSlug(product) === slug) ?? null : null);
    };

    selectProductFromUrl();
    window.addEventListener("popstate", selectProductFromUrl);
    return () => window.removeEventListener("popstate", selectProductFromUrl);
  }, []);

  const cartLines = useMemo(() => cart.flatMap((item) => {
    const product = products[item.productIndex];
    if (!product) return [];
    return [{ ...item, product, pricing: estimatePrice(product) }];
  }), [cart]);
  const cartCount = cartLines.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartLines.reduce((sum, item) => sum + item.pricing.price * item.quantity, 0);
  const checkoutTotal = cartSubtotal + shippingFees[shippingMethod];

  const openProduct = (product: Product) => {
    setSelected(product);
    const url = new URL(window.location.href);
    url.searchParams.set("product", productSlug(product));
    window.history.pushState({}, "", url);
  };

  const closeProduct = () => {
    setSelected(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("product");
    window.history.replaceState({}, "", url);
  };

  const copyProductLink = async (product: Product) => {
    const url = new URL(window.location.href);
    url.hash = "";
    url.search = "";
    url.searchParams.set("product", productSlug(product));

    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiedProduct(productSlug(product));
      window.setTimeout(() => setCopiedProduct(""), 2200);
    } catch {
      window.prompt("複製這個商品連結", url.toString());
    }
  };

  const addToCart = (product: Product) => {
    const productIndex = products.indexOf(product);
    setCart((current) => {
      const existing = current.find((item) => item.productIndex === productIndex);
      if (existing) return current.map((item) => item.productIndex === productIndex ? { ...item, quantity: Math.min(20, item.quantity + 1) } : item);
      return [...current, { productIndex, quantity: 1 }];
    });
    closeProduct();
    setCartOpen(true);
  };

  const updateQuantity = (productIndex: number, quantity: number) => {
    setCart((current) => quantity < 1
      ? current.filter((item) => item.productIndex !== productIndex)
      : current.map((item) => item.productIndex === productIndex ? { ...item, quantity: Math.min(20, quantity) } : item));
  };

  const openCheckout = () => {
    if (cart.length === 0) return;
    setCartOpen(false);
    setCheckoutError("");
    setCreatedOrder(null);
    setCheckoutOpen(true);
  };

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setCheckoutError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${basePath}/api/orders`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: cart,
          customerName: form.get("customerName"),
          phone: form.get("phone"),
          email: form.get("email"),
          shippingMethod,
          address: form.get("address"),
          storeChain: form.get("storeChain"),
          storeName: form.get("storeName"),
          storeCode: form.get("storeCode"),
          note: form.get("note"),
        }),
      });
      const result = await response.json() as CreatedOrder & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "訂單送出失敗，請稍後再試。");
      setCreatedOrder(result);
      setCart([]);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "訂單送出失敗，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        (active === "全部" || product.category === active) &&
        (!q ||
          `${product.name} ${product.zh} ${product.tag} ${product.category}`
            .toLowerCase()
            .includes(q)),
    );
  }, [active, query]);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ROBERT FORM 首頁">
          <span className="brand-mark">RF</span>
          <span>ROBERT <span className="brand-light">FORM</span></span>
        </a>
        <nav aria-label="主要導覽">
          <a href="#catalog">選品目錄</a>
          <a href="#pricing">定價方式</a>
          <a href="#payment">付款配送</a>
          <a href="#process">訂製流程</a>
          <a href="#about">關於作品</a>
          <Link href="/track">查詢訂單</Link>
        </nav>
        <div className="header-actions">
          <Link className="account-trigger" href="/account">登入／我的訂單</Link>
          <button className="cart-trigger" type="button" onClick={() => setCartOpen(true)} aria-label={`開啟購物車，目前 ${cartCount} 件商品`}>
            購物車 <strong>{cartCount}</strong>
          </button>
          <a className="header-cta" href="#custom-order"><span aria-hidden="true" />訂製洽詢 ↘</a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">3D PRINTED OBJECTS · CURATED DAILY</p>
          <h1>把想像，<br />印成生活的形狀。</h1>
          <p className="hero-intro">
            從燈光、飾品到派對酒具，探索適合空間與日常的 3D 列印設計。
            選一個喜歡的方向，我們再一起調整顏色、尺寸與細節。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#catalog">瀏覽 97 件選品 <span>↘</span></a>
            <a className="text-button" href="#process">了解訂製方式 →</a>
          </div>
          <div className="hero-stats" aria-label="目錄資訊">
            <div><strong>97</strong><span>精選設計</span></div>
            <div><strong>12</strong><span>生活系列</span></div>
            <div><strong>∞</strong><span>客製可能</span></div>
          </div>
        </div>
        <div className="hero-collage" aria-label="精選作品">
          <figure className="hero-main"><img src={assetPath("/products/lamp-03.webp")} alt="繁葉造型燈" /></figure>
          <figure className="hero-small top"><img src={assetPath("/products/jewelry-06.webp")} alt="首飾樹" /></figure>
          <figure className="hero-small bottom"><img src={assetPath("/products/bar-04.webp")} alt="啤酒計數開瓶器" /></figure>
          <span className="orbit-label">FORM · FUNCTION · PLAY ·</span>
        </div>
      </section>

      <section className="catalog-section" id="catalog">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE CATALOGUE / 01</p>
            <h2>尋找你的下一件作品</h2>
          </div>
          <p>挑選喜歡的商品，直接查看標準尺寸參考售價、預估耗材與列印時間，再洽詢顏色、尺寸與授權。</p>
        </div>

        <div className="catalog-tools">
          <div className="filters" role="group" aria-label="商品分類">
            {filters.map((filter) => (
              <button
                key={filter}
                className={active === filter ? "active" : ""}
                onClick={() => setActive(filter)}
                aria-pressed={active === filter}
              >
                {filter}
              </button>
            ))}
          </div>
          <label className="search">
            <span>搜尋</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="燈、收納、開瓶器…"
            />
          </label>
        </div>

        <div className="product-grid">
          {shown.map((product, index) => {
            const pricing = estimatePrice(product);
            const productIndex = products.indexOf(product);
            return (
            <article className="product-card" key={`${product.name}-${index}`}>
              <button
                type="button"
                className="product-image"
                onClick={() => openProduct(product)}
                aria-label={`查看 ${product.zh} 的使用情境`}
              >
                <img src={assetPath(product.image)} alt={product.zh} loading="lazy" />
                <span className="view-source">查看使用情境 ↗</span>
                <span className="index">{String(index + 1).padStart(2, "0")}</span>
              </button>
              <div className="product-meta">
                <div>
                  <p>{product.category} · {product.tag}</p>
                  <h3>{product.zh}</h3>
                  <span>{product.name}</span>
                  <div className="product-price">
                    <strong>{formatPrice(pricing.price)} 起</strong>
                    <small>約 {pricing.hours} 小時 · {pricing.material} {pricing.grams}g</small>
                  </div>
                  <div className="product-card-actions">
                    <button className="add-cart-button" type="button" onClick={() => addToCart(products[productIndex])}>加入購物車 ＋</button>
                    <button className="share-product-button" type="button" onClick={() => copyProductLink(product)}>
                      {copiedProduct === productSlug(product) ? "連結已複製 ✓" : "複製商品連結 ↗"}
                    </button>
                  </div>
                </div>
                <span className="custom-badge">標準尺寸估價</span>
              </div>
            </article>
          )})}
        </div>
        {shown.length === 0 && <p className="empty">找不到符合條件的作品，換個關鍵字試試看。</p>}
      </section>

      {selected && selectedPricing && (
        <div className="product-modal" role="dialog" aria-modal="true" aria-label={`${selected.zh} 商品介紹`}>
          <button className="modal-backdrop" onClick={closeProduct} aria-label="關閉商品介紹" />
          <article className="modal-panel">
            <button className="modal-close" onClick={closeProduct} aria-label="關閉">×</button>
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{selected.category} · {selected.tag}</p>
                <h2>{selected.zh}</h2>
                <span>{selected.name}</span>
              </div>
              <div className="modal-price">
                <span>標準尺寸參考售價</span>
                <strong>{formatPrice(selectedPricing.price)} 起</strong>
                <small>可洽詢顏色與尺寸</small>
              </div>
            </div>
            <div className="modal-gallery">
              <figure className="modal-main-image"><img src={assetPath(selected.image)} alt={`${selected.zh} 商品照`} /></figure>
              {selected.lifestyle ? (
                <figure className="modal-lifestyle">
                  <img src={assetPath(selected.lifestyle)} alt={`${selected.zh} 的三種使用與空間搭配情境`} />
                </figure>
              ) : (
                <div className="styling-placeholder">
                  <span>ROBERT FORM · STYLING NOTE</span>
                  <h3>把它放進你的生活</h3>
                  <p>適合玄關、書桌、餐廚或送禮情境。可依空間調整色彩、尺寸與表面質感。</p>
                  <div className="swatches" aria-label="建議配色">
                    <i className="swatch ivory" /><i className="swatch olive" /><i className="swatch clay" /><i className="swatch ink" />
                  </div>
                </div>
              )}
            </div>
            <div className="use-grid">
              <div><span>01</span><h3>怎麼使用</h3><p>{categoryNotes[selected.category].use}</p></div>
              <div><span>02</span><h3>怎麼搭配</h3><p>{categoryNotes[selected.category].styling}</p></div>
              <div><span>03</span><h3>怎麼訂製</h3><p>{categoryNotes[selected.category].custom} 正式製作前會先確認可用授權。</p></div>
            </div>
            <div className="estimate-panel" aria-label="製作與價格估算">
              <div><span>預估耗材</span><strong>{selectedPricing.material} {selectedPricing.grams}g</strong></div>
              <div><span>預估列印</span><strong>約 {selectedPricing.hours} 小時</strong></div>
              <div><span>價格包含</span><strong>{selectedPricing.partsNote}</strong></div>
              <p>以標準尺寸、單色與一般層高估算；實際售價會依切片結果、顏色、尺寸、支撐、多色換料、零件與原作商用授權調整。</p>
            </div>
            <div className="modal-actions">
              <button className="modal-cta add" type="button" onClick={() => addToCart(selected)}>
                加入購物車 ＋
              </button>
              <button className="modal-cta share" type="button" onClick={() => copyProductLink(selected)}>
                {copiedProduct === productSlug(selected) ? "商品連結已複製 ✓" : "複製商品連結 ↗"}
              </button>
              <a
                className="modal-cta instagram"
                href="https://www.instagram.com/radish_studio_/"
                target="_blank"
                rel="noreferrer"
                onClick={closeProduct}
              >
                Instagram 私訊這件商品 ↗
              </a>
              <a
                className="modal-cta email"
                href={`mailto:loxa8858@gmail.com?subject=${encodeURIComponent(`ROBERT FORM 訂製洽詢｜${selected.zh}`)}&body=${encodeURIComponent(`商品：${selected.zh}\n參考售價：${formatPrice(selectedPricing.price)} 起\n預估製作：${selectedPricing.material} ${selectedPricing.grams}g／約 ${selectedPricing.hours} 小時\n\n我想詢問的顏色、尺寸與數量：`)}`}
                onClick={closeProduct}
              >
                Email 詢問 →
              </a>
            </div>
          </article>
        </div>
      )}

      <section className="pricing-section" id="pricing">
        <div>
          <p className="eyebrow">FAIR PRICE / 02</p>
          <h2>不是只算一捲線材，<br />而是算完整製作。</h2>
        </div>
        <div className="pricing-explainer">
          <p>每件售價以標準尺寸的切片需求推估，並參考台灣 3D 列印代工與同類生活選品的公開價帶。目錄價格是接單前的透明起點，正式製作仍會重新切片確認。</p>
          <ol>
            <li><span>01</span><strong>材料與耗損</strong><p>PLA／PETG 用量，加計支撐、換色與約 15% 試印耗損。</p></li>
            <li><span>02</span><strong>機台時間</strong><p>依預估列印時數計入耗電、噴嘴與設備折舊。</p></li>
            <li><span>03</span><strong>完成工序</strong><p>包含拆支撐、基本修整、品檢與一般包裝。</p></li>
            <li><span>04</span><strong>市場校正</strong><p>小物不低價傾銷，大件也不直接套用高額代印工時計價。</p></li>
          </ol>
          <small>價格不含運費、特殊建模與額外商用授權費；大量製作可依排版與耗材效率另行報價。</small>
        </div>
      </section>

      <section className="payment-section" id="payment">
        <div>
          <p className="eyebrow">PAYMENT & DELIVERY / 03</p>
          <h2>確認完成，<br />再安心付款。</h2>
        </div>
        <div className="payment-grid">
          <article className="payment-card active">
            <span>目前開放</span>
            <h3>銀行轉帳</h3>
            <p>送出訂單後，ROBERT FORM 會先確認尺寸、顏色、製作授權與交期；收到確認通知後再轉帳。</p>
            <strong>中國信託 · 人工核帳</strong>
          </article>
          <article className="payment-card pending">
            <span>申請中</span>
            <h3>綠界線上付款</h3>
            <p>信用卡、Apple Pay、ATM 與超商代碼會在綠界商店審核及安全串接完成後開放。</p>
            <strong>尚未向買家收取線上款項</strong>
          </article>
          <article className="delivery-card">
            <span>配送方式</span>
            <h3>超商取貨／宅配</h3>
            <p>7‑ELEVEN、全家門市取貨 NT$60；台灣本島常溫宅配 NT$100。大型或超材商品另行確認。</p>
          </article>
        </div>
      </section>

      <section className="process" id="process">
        <div>
          <p className="eyebrow">MADE FOR YOU / 04</p>
          <h2>從喜歡，走到專屬。</h2>
        </div>
        <ol>
          <li><span>01</span><h3>挑選方向</h3><p>從目錄找到喜歡的風格、用途或結構。</p></li>
          <li><span>02</span><h3>確認授權</h3><p>先確認原作授權，再討論顏色、尺寸與調整範圍。</p></li>
          <li><span>03</span><h3>打樣製作</h3><p>確認材料與細節，完成試印後再進入正式製作。</p></li>
        </ol>
      </section>

      <section className="order-contact" id="custom-order">
        <div className="order-contact-copy">
          <p className="eyebrow">CUSTOM SERVICES / 05</p>
          <h2>想做自己的版本？<br />請洽詢。</h2>
          <p>
            可從你的照片、文字或圖案開始，再一起評估造型、尺寸、顏色與適合的製作方式。
          </p>
        </div>
        <div className="custom-services">
          <div className="custom-services-heading">
            <span>可提供的訂製服務</span>
            <strong>ROBERT FORM · MADE FOR YOU</strong>
          </div>
          <div className="service-grid">
            <article>
              <span>01</span>
              <h3>照片轉立體作品</h3>
              <p>提供清晰照片，可評估轉成浮雕、燈片、輪廓擺件或紀念品。</p>
            </article>
            <article>
              <span>02</span>
              <h3>印上姓名與文字</h3>
              <p>姓名、日期、祝福語、編號或專屬短句，可討論字體與位置。</p>
            </article>
            <article>
              <span>03</span>
              <h3>Logo、圖案與 QR Code</h3>
              <p>可提供有使用權的 Logo、圖案或 QR Code，評估浮雕、鏤空或多色呈現。</p>
            </article>
            <article>
              <span>04</span>
              <h3>顏色、尺寸與用途調整</h3>
              <p>依空間、物件或使用情境，討論配色、比例、孔位與安裝方式。</p>
            </article>
            <article>
              <span>05</span>
              <h3>送禮、婚禮與活動小物</h3>
              <p>可評估少量多款或批量製作，適合送禮、店家、活動與企業客製。</p>
            </article>
            <article>
              <span>06</span>
              <h3>改圖與打樣評估</h3>
              <p>有現成檔案或參考圖也可提供，製作前會先確認結構、材料與授權。</p>
            </article>
          </div>
          <div className="inquiry-brief">
            <strong>洽詢時請提供</strong>
            <p>參考照片或檔案 · 想印的文字／圖案 · 預期尺寸 · 數量 · 用途 · 希望完成時間</p>
            <small>照片品質、產品結構與圖樣授權會影響可製作範圍，以實際評估為準。</small>
          </div>
          <div className="order-contact-options">
            <a
              className="contact-card instagram"
              href="https://www.instagram.com/radish_studio_/"
              target="_blank"
              rel="noreferrer"
            >
              <span>回覆最快</span>
              <strong>Instagram 私訊</strong>
              <small>@radish_studio_ ↗</small>
            </a>
            <a
              className="contact-card email"
              href="mailto:loxa8858@gmail.com?subject=ROBERT%20FORM%20訂製洽詢"
            >
              <span>適合完整需求</span>
              <strong>Email 訂製洽詢</strong>
              <small>loxa8858@gmail.com ↗</small>
            </a>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <p className="eyebrow">A RESPONSIBLE CATALOGUE</p>
        <h2>尊重每一個<br />被創造的形狀。</h2>
        <p>
          本站圖片整理自 MakerWorld 公開作品頁，作為選品靈感與訂製討論使用；
          各作品權利屬於原創作者。商業製作前，我們會逐件確認授權，不直接轉售未獲許可的模型。
        </p>
      </section>

      <footer id="contact">
        <div><span className="brand-mark">RF</span><strong>ROBERT FORM</strong></div>
        <p>你的想法，值得被做出來。</p>
        <div className="footer-links">
          <a href="https://www.instagram.com/radish_studio_/" target="_blank" rel="noreferrer">Instagram 私訊 ↗</a>
          <a href="mailto:loxa8858@gmail.com?subject=ROBERT%20FORM%20訂製洽詢">loxa8858@gmail.com ↗</a>
          <Link href="/account">登入／我的訂單 ↗</Link>
          <Link href="/track">買家訂單查詢 ↗</Link>
          <a href="/orders">店家訂單管理 ↗</a>
        </div>
        <small>Curated 3D design inspiration · Licensing checked before production</small>
      </footer>

      {cartOpen && (
        <div className="cart-layer" role="dialog" aria-modal="true" aria-label="購物車">
          <button className="cart-backdrop" type="button" onClick={() => setCartOpen(false)} aria-label="關閉購物車" />
          <aside className="cart-panel">
            <div className="cart-heading">
              <div><p className="eyebrow">YOUR SELECTION</p><h2>購物車</h2></div>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="關閉">×</button>
            </div>
            <div className="cart-content">
              {cartLines.length === 0 ? (
                <div className="cart-empty"><strong>購物車還是空的</strong><p>從目錄挑一件喜歡的作品開始。</p><button type="button" onClick={() => setCartOpen(false)}>繼續逛逛</button></div>
              ) : cartLines.map(({ productIndex, quantity, product, pricing }) => (
                <article className="cart-line" key={productIndex}>
                  <img src={assetPath(product.image)} alt={product.zh} />
                  <div><strong>{product.zh}</strong><span>{formatPrice(pricing.price)}／件</span></div>
                  <div className="quantity-control" aria-label={`${product.zh} 數量`}>
                    <button type="button" onClick={() => updateQuantity(productIndex, quantity - 1)}>−</button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => updateQuantity(productIndex, quantity + 1)}>＋</button>
                  </div>
                  <strong>{formatPrice(pricing.price * quantity)}</strong>
                </article>
              ))}
            </div>
            {cartLines.length > 0 && <div className="cart-footer"><div><span>商品小計</span><strong>{formatPrice(cartSubtotal)}</strong></div><small>運費於結帳時依配送方式計算；價格為標準尺寸與單色估價。</small><button type="button" onClick={openCheckout}>前往結帳 →</button></div>}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="checkout-layer" role="dialog" aria-modal="true" aria-label="結帳">
          <button className="checkout-backdrop" type="button" onClick={() => setCheckoutOpen(false)} aria-label="關閉結帳" />
          <section className="checkout-panel">
            <button className="checkout-close" type="button" onClick={() => setCheckoutOpen(false)} aria-label="關閉">×</button>
            {createdOrder ? (
              <div className="order-success">
                <span className="success-mark">✓</span>
                <p className="eyebrow">ORDER RECEIVED</p>
                <h2>訂單已送出</h2>
                <p>{createdOrder.message}</p>
                <div className="order-number"><span>訂單編號</span><strong>{createdOrder.order.id}</strong></div>
                <div className="order-status-entry">
                  <span>接下來請從專屬頁面操作</span>
                  <strong>店家確認後，頁面會顯示轉帳資料；轉帳完成也直接在頁面回報。</strong>
                  <Link href={createdOrder.trackingPath}>查看訂單進度與付款 →</Link>
                </div>
                <p className="payment-reminder">請保存訂單編號與專屬連結。若連結遺失，可使用訂單編號與下單 Email 重新查詢。</p>
                <div className="success-actions"><button type="button" onClick={() => navigator.clipboard?.writeText(new URL(createdOrder.trackingPath, window.location.origin).toString())}>複製進度連結</button><a href="https://www.instagram.com/radish_studio_/" target="_blank" rel="noreferrer">需要協助？IG 私訊 ↗</a></div>
              </div>
            ) : (
              <form className="checkout-form" onSubmit={submitOrder}>
                <div className="checkout-title"><p className="eyebrow">CHECKOUT</p><h2>結帳資料</h2><p>目前採銀行轉帳。送出後先由店家確認規格、授權與交期，再通知付款。</p></div>
                <fieldset>
                  <legend>01 · 聯絡資料</legend>
                  <div className="form-grid">
                    <label><span>收件人姓名</span><input name="customerName" required autoComplete="name" /></label>
                    <label><span>手機號碼</span><input name="phone" required inputMode="tel" autoComplete="tel" placeholder="0912345678" /></label>
                    <label className="full"><span>Email</span><input name="email" type="email" required autoComplete="email" /></label>
                  </div>
                </fieldset>
                <fieldset>
                  <legend>02 · 配送方式</legend>
                  <div className="shipping-options">
                    <label className={shippingMethod === "cvs" ? "selected" : ""}><input type="radio" name="shippingMethod" checked={shippingMethod === "cvs"} onChange={() => setShippingMethod("cvs")} /><span><strong>超商門市取貨</strong><small>7‑ELEVEN／全家 · NT$60</small></span></label>
                    <label className={shippingMethod === "home" ? "selected" : ""}><input type="radio" name="shippingMethod" checked={shippingMethod === "home"} onChange={() => setShippingMethod("home")} /><span><strong>台灣本島宅配</strong><small>常溫宅配 · NT$100</small></span></label>
                  </div>
                  {shippingMethod === "cvs" ? <div className="form-grid store-fields"><label><span>超商</span><select name="storeChain" required defaultValue=""><option value="" disabled>請選擇</option><option value="7-ELEVEN">7‑ELEVEN</option><option value="全家">全家</option></select></label><label><span>門市名稱</span><input name="storeName" required placeholder="例如：景美門市" /></label><label className="full"><span>門市店號</span><input name="storeCode" required placeholder="請填門市店號" /></label></div> : <div className="form-grid store-fields"><label className="full"><span>完整收件地址</span><input name="address" required autoComplete="street-address" placeholder="縣市、區、路名、門牌與樓層" /></label></div>}
                </fieldset>
                <fieldset>
                  <legend>03 · 付款與備註</legend>
                  <div className="payment-choice selected"><span className="radio-dot" /><div><strong>中國信託銀行轉帳</strong><small>店家確認訂單後再付款；人工核帳</small></div></div>
                  <div className="payment-choice disabled"><span>即將開放</span><div><strong>綠界線上付款</strong><small>信用卡、Apple Pay、ATM、超商代碼</small></div></div>
                  <label className="checkout-note"><span>顏色、尺寸或其他需求</span><textarea name="note" rows={4} placeholder="若需客製，請寫下希望的顏色、尺寸、文字與數量。" /></label>
                </fieldset>
                <div className="checkout-summary"><div><span>商品小計</span><strong>{formatPrice(cartSubtotal)}</strong></div><div><span>配送費</span><strong>{formatPrice(shippingFees[shippingMethod])}</strong></div><div className="total"><span>預估總額</span><strong>{formatPrice(checkoutTotal)}</strong></div></div>
                <label className="checkout-consent"><input type="checkbox" required /><span>我了解 3D 列印商品會先確認原作授權、規格與交期，收到店家確認前不先轉帳。</span></label>
                {checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}
                <button className="submit-order" type="submit" disabled={submitting}>{submitting ? "正在建立訂單…" : "送出訂單，等待確認 →"}</button>
              </form>
            )}
          </section>
        </div>
      )}

      <aside className="contact-dock" aria-label="快速聯絡訂製">
        <span className="dock-label">有想法？現在就問</span>
        <a
          className="dock-action instagram"
          href="https://www.instagram.com/radish_studio_/"
          target="_blank"
          rel="noreferrer"
        >
          IG 私訊
        </a>
        <a
          className="dock-action email"
          href="mailto:loxa8858@gmail.com?subject=ROBERT%20FORM%20訂製洽詢"
        >
          Email
        </a>
        <button className="dock-action cart" type="button" onClick={() => setCartOpen(true)}>購物車 {cartCount}</button>
      </aside>
    </main>
  );
}
