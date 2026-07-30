"use client";

import { useMemo, useState } from "react";

type Product = {
  name: string;
  zh: string;
  category: "燈具" | "飾品" | "酒具" | "家居" | "植栽" | "收納";
  image: string;
  lifestyle?: string;
  source: string;
  tag: string;
};

const products: Product[] = [
  { name: "Large Illuminated Lunar Wall Lamp", zh: "月球發光壁燈", category: "燈具", image: "/products/lamp-01.webp", source: "https://makerworld.com/zh/models/2320985-large-illuminated-lunar-wall-lamp-version-2", tag: "氛圍照明" },
  { name: "Moon Lamp with Wavy Stand", zh: "波浪底座月球燈", category: "燈具", image: "/products/lamp-02.webp", source: "https://makerworld.com/zh/models/1266343-moon-lamp-with-wavy-stand-fuzzy-skin", tag: "桌上燈" },
  { name: "Lush Leaf Lamp", zh: "繁葉造型燈", category: "燈具", image: "/products/lamp-03.webp", lifestyle: "/lifestyle/lamp-leaf-scenes.png", source: "https://makerworld.com/zh/models/1913623-lush-leaf-lamp-pendant-or-standing", tag: "吊燈／立燈" },
  { name: "Wavy Lamp E27", zh: "波浪 E27 燈", category: "燈具", image: "/products/lamp-04.webp", source: "https://makerworld.com/zh/models/965182-wavy-lamp-e27-e26-base-petg", tag: "現代風格" },
  { name: "Super Fast Print Lamp", zh: "極速列印桌燈", category: "燈具", image: "/products/lamp-05.webp", source: "https://makerworld.com/zh/models/2175648-led-kit-001-super-fast-print-lamp-55-mins-30g", tag: "輕量設計" },
  { name: "Wavy Ambient Lamp", zh: "流線氛圍燈", category: "燈具", image: "/products/lamp-06.webp", source: "https://makerworld.com/zh/models/965182-wavy-lamp-e27-e26-base-petg", tag: "空間佈置" },
  { name: "Jewelry Organizer Stand", zh: "首飾展示收納架", category: "飾品", image: "/products/jewelry-01.webp", source: "https://makerworld.com/zh/models/757412-jewelry-organizer-necklace-bracelet-ring-stand", tag: "項鍊／戒指" },
  { name: "Sculptural Jewelry Organizer", zh: "雕塑感首飾架", category: "飾品", image: "/products/jewelry-02.webp", source: "https://makerworld.com/zh/models/1092762-jewelry-organizer", tag: "桌面收納" },
  { name: "Big Letter Beads", zh: "大型字母串珠", category: "飾品", image: "/products/jewelry-03.webp", source: "https://makerworld.com/zh/models/2504346-big-letter-beads-5-inches", tag: "個人化" },
  { name: "Kumihimo Bracelet", zh: "組紐編織手環", category: "飾品", image: "/products/jewelry-04.webp", source: "https://makerworld.com/zh/models/1391285-kumihimo-bracelet-8-strings", tag: "手環" },
  { name: "Custom Letter Beads", zh: "自訂字母珠", category: "飾品", image: "/products/jewelry-05.webp", source: "https://makerworld.com/zh/models/2587491-customizable-letter-beads-letter-beads", tag: "客製禮物" },
  { name: "Arboréa Jewelry Tree", zh: "Arboréa 首飾樹", category: "飾品", image: "/products/jewelry-06.webp", lifestyle: "/lifestyle/jewelry-tree-scenes.png", source: "https://makerworld.com/zh/models/1391601-arborea-modern-jewelry-tree", tag: "展示設計" },
  { name: "Single-Hand Cap Shooter", zh: "單手瓶蓋發射開瓶器", category: "酒具", image: "/products/bar-01.webp", source: "https://makerworld.com/zh/models/2777068-single-hand-bottle-cap-shooter", tag: "派對小物" },
  { name: "Glass Beer Bottle Opener", zh: "玻璃瓶啤酒開瓶器", category: "酒具", image: "/products/bar-02.webp", source: "https://makerworld.com/zh/models/2764241-glass-beer-bottle-opener", tag: "開瓶器" },
  { name: "Bottle Opener & Cap Gun", zh: "開瓶器與瓶蓋槍", category: "酒具", image: "/products/bar-03.webp", source: "https://makerworld.com/zh/models/2128043-bottle-opener-and-cap-gun", tag: "趣味設計" },
  { name: "BeerCounter V5", zh: "啤酒計數開瓶器", category: "酒具", image: "/products/bar-04.webp", lifestyle: "/lifestyle/beer-counter-scenes.png", source: "https://makerworld.com/zh/models/89566-beercounter-v5-bottle-opener", tag: "聚會神器" },
  { name: "2-in-1 Opener Keychain", zh: "二合一開瓶鑰匙圈", category: "酒具", image: "/products/bar-05.webp", source: "https://makerworld.com/zh/models/1246368-2-in-1-bottle-and-can-opener-keychain-gadget", tag: "隨身工具" },
  { name: "Beer Cap Launcher", zh: "啤酒瓶蓋發射器", category: "酒具", image: "/products/bar-06.webp", source: "https://makerworld.com/zh/models/2822922-beer-cap-launcher", tag: "派對玩具" },
  { name: "Entryway Organizer", zh: "玄關置物與鑰匙架", category: "家居", image: "/products/decor-01.webp", source: "https://makerworld.com/zh/models/2699152-modern-entryway-organizer-shelf-with-key-hooks-q_c", tag: "玄關收納" },
  { name: "The High Voyager", zh: "太空旅人香座", category: "家居", image: "/products/decor-02.webp", source: "https://makerworld.com/zh/models/2771297-the-high-voyager-incense-holder", tag: "香氛擺件" },
  { name: "Decorative HOME Tray", zh: "HOME 裝飾托盤", category: "家居", image: "/products/decor-03.webp", source: "https://makerworld.com/zh/models/2350771-decorative-tray-home", tag: "桌面選物" },
  { name: "Melting Wall Shelf", zh: "融化感造型壁架", category: "家居", image: "/products/decor-04.webp", source: "https://makerworld.com/zh/models/2211015-melting-wall-shelf-dripping-modern-shelf", tag: "牆面收納" },
  { name: "Hexagon Twisty Object", zh: "六角扭轉桌面擺件", category: "家居", image: "/products/decor-05.webp", source: "https://makerworld.com/zh/models/2738294-hexagon-twisty-fidget-toy", tag: "互動擺件" },
  { name: "Minimal Decorative Tray", zh: "極簡居家托盤", category: "家居", image: "/products/decor-06.webp", source: "https://makerworld.com/zh/models/2350771-decorative-tray-home", tag: "日常收納" },
  { name: "Modern Japandi Ribbed Plant Pot", zh: "日系侘寂條紋植栽盆", category: "植栽", image: "/products/planter-01.webp", lifestyle: "/lifestyle/planter-scenes.png", source: "https://makerworld.com/zh/models/2414690-modern-japandi-ribbed-plant-pot-with-drainage", tag: "排水花盆" },
  { name: "The Claudia Planter", zh: "Claudia 雕塑植栽盆", category: "植栽", image: "/products/planter-02.webp", source: "https://makerworld.com/zh/models/1399976-the-claudia-planter-a-botany-chic-creation-decor", tag: "造型花器" },
  { name: "Mid Century Planter", zh: "世紀中期植栽盆", category: "植栽", image: "/products/planter-03.webp", source: "https://makerworld.com/zh/models/1616690-mid-century-planter-with-built-in-drip-tray", tag: "內建滴水盤" },
  { name: "HydroSquare Rain Planter", zh: "水循環方形植栽燈", category: "植栽", image: "/products/planter-04.webp", source: "https://makerworld.com/zh/models/2421936-led-kit-001-hydrosquare-rain-planter", tag: "植栽照明" },
  { name: "Japandi Self-Watering Pot", zh: "日系自動澆水花盆", category: "植栽", image: "/products/planter-05.webp", source: "https://makerworld.com/zh/models/1339226-japandi-plant-pot-3-versions-automatic-watering", tag: "自動澆水" },
  { name: "Modern Ribbed Planter", zh: "現代條紋花盆", category: "植栽", image: "/products/planter-06.webp", source: "https://makerworld.com/zh/models/2593518-modern-ribbed-planter-vase", tag: "花盆／花器" },
  { name: "Japandi Planter with Stand", zh: "日系腳架植栽盆", category: "植栽", image: "/products/planter-07.webp", source: "https://makerworld.com/zh/models/2534523-japandi-planter-hidden-drip-tray-stand", tag: "隱藏滴水盤" },
  { name: "Wall-Mounted Ball Plant Pot", zh: "壁掛球形植栽盆", category: "植栽", image: "/products/planter-08.webp", source: "https://makerworld.com/zh/models/1272196-wall-mounted-ball-plant-pot", tag: "牆面綠意" },
  { name: "Infinity Spool Tower", zh: "無限延伸線材收納塔", category: "收納", image: "/products/storage-01.webp", source: "https://makerworld.com/zh/models/2172346-infinity-spool-tower-the-ultimate-storage-solution", tag: "模組系統" },
  { name: "Modular Desk Organizer", zh: "模組桌面收納系統", category: "收納", image: "/products/storage-02.webp", source: "https://makerworld.com/zh/models/2087511-modular-desk-organizer-system-magsafe-phone-stand", tag: "手機架" },
  { name: "Stackable Organizer Drawers", zh: "可堆疊桌面抽屜", category: "收納", image: "/products/storage-03.webp", source: "https://makerworld.com/zh/models/1889262-stackable-desktop-organizer-with-drawers", tag: "抽屜收納" },
  { name: "Ribbed Sliding-Lid Box", zh: "條紋滑蓋收納盒", category: "收納", image: "/products/storage-04.webp", source: "https://makerworld.com/zh/models/2115383-sliding-lid-storage-box-organizer-ribbed-design", tag: "滑蓋設計" },
  { name: "Clean Modular Organizer", zh: "極簡模組桌面收納", category: "收納", image: "/products/storage-05.webp", source: "https://makerworld.com/zh/models/2734467-stackable-desktop-organizer-clean-modular", tag: "可堆疊" },
  { name: "Hollow Storage Basket", zh: "鏤空堆疊收納籃", category: "收納", image: "/products/storage-06.webp", source: "https://makerworld.com/zh/models/2583249-exquisite-and-high-end-sturdy-and-practical-stacka", tag: "居家收納" },
  { name: "Post-It Note Holder", zh: "便利貼與模板收納座", category: "收納", image: "/products/storage-07.webp", source: "https://makerworld.com/zh/models/931302-holder-for-post-it-notes-stencils-included", tag: "文具收納" },
  { name: "Under-Shelf Organizer", zh: "層板下方小型收納盒", category: "收納", image: "/products/storage-08.webp", source: "https://makerworld.com/zh/models/1962101-under-shelf-organizer-small-version", tag: "空間利用" },
];

const filters = ["全部", "燈具", "飾品", "酒具", "家居", "植栽", "收納"] as const;

export default function Home() {
  const [active, setActive] = useState<(typeof filters)[number]>("全部");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

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
          <a href="#process">訂製流程</a>
          <a href="#about">關於作品</a>
        </nav>
        <a className="header-cta" href="#contact">洽詢訂製</a>
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
            <a className="primary-button" href="#catalog">瀏覽 40 件選品 <span>↘</span></a>
            <a className="text-button" href="#process">了解訂製方式 →</a>
          </div>
          <div className="hero-stats" aria-label="目錄資訊">
            <div><strong>40</strong><span>精選設計</span></div>
            <div><strong>6</strong><span>生活系列</span></div>
            <div><strong>∞</strong><span>客製可能</span></div>
          </div>
        </div>
        <div className="hero-collage" aria-label="精選作品">
          <figure className="hero-main"><img src="/products/lamp-03.webp" alt="繁葉造型燈" /></figure>
          <figure className="hero-small top"><img src="/products/jewelry-06.webp" alt="首飾樹" /></figure>
          <figure className="hero-small bottom"><img src="/products/bar-04.webp" alt="啤酒計數開瓶器" /></figure>
          <span className="orbit-label">FORM · FUNCTION · PLAY ·</span>
        </div>
      </section>

      <section className="catalog-section" id="catalog">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE CATALOGUE / 01</p>
            <h2>尋找你的下一件作品</h2>
          </div>
          <p>挑選喜歡的商品，點開即可查看使用方式、空間搭配與可訂製方向，全程留在站內瀏覽。</p>
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
          {shown.map((product, index) => (
            <article className="product-card" key={`${product.name}-${index}`}>
              <button
                type="button"
                className="product-image"
                onClick={() => setSelected(product)}
                aria-label={`查看 ${product.zh} 的使用情境`}
              >
                <img src={product.image} alt={product.zh} loading="lazy" />
                <span className="view-source">查看使用情境 ↗</span>
                <span className="index">{String(index + 1).padStart(2, "0")}</span>
              </button>
              <div className="product-meta">
                <div>
                  <p>{product.category} · {product.tag}</p>
                  <h3>{product.zh}</h3>
                  <span>{product.name}</span>
                </div>
                <span className="custom-badge">可洽詢訂製</span>
              </div>
            </article>
          ))}
        </div>
        {shown.length === 0 && <p className="empty">找不到符合條件的作品，換個關鍵字試試看。</p>}
      </section>

      {selected && (
        <div className="product-modal" role="dialog" aria-modal="true" aria-label={`${selected.zh} 商品介紹`}>
          <button className="modal-backdrop" onClick={() => setSelected(null)} aria-label="關閉商品介紹" />
          <article className="modal-panel">
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="關閉">×</button>
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{selected.category} · {selected.tag}</p>
                <h2>{selected.zh}</h2>
                <span>{selected.name}</span>
              </div>
              <span className="custom-badge">可洽詢顏色與尺寸</span>
            </div>
            <div className="modal-gallery">
              <figure className="modal-main-image"><img src={selected.image} alt={`${selected.zh} 商品照`} /></figure>
              {selected.lifestyle ? (
                <figure className="modal-lifestyle">
                  <img src={selected.lifestyle} alt={`${selected.zh} 的三種使用與空間搭配情境`} />
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
              <div><span>01</span><h3>怎麼使用</h3><p>作為日常實用品，也能成為空間中的視覺焦點。</p></div>
              <div><span>02</span><h3>怎麼搭配</h3><p>搭配木質、石材與低彩度家具，能凸顯 3D 列印紋理。</p></div>
              <div><span>03</span><h3>怎麼訂製</h3><p>可洽詢色彩、尺寸與局部細節；正式製作前會先確認可用授權。</p></div>
            </div>
            <a className="modal-cta" href="#contact" onClick={() => setSelected(null)}>詢問這件商品 →</a>
          </article>
        </div>
      )}

      <section className="process" id="process">
        <div>
          <p className="eyebrow">MADE FOR YOU / 02</p>
          <h2>從喜歡，走到專屬。</h2>
        </div>
        <ol>
          <li><span>01</span><h3>挑選方向</h3><p>從目錄找到喜歡的風格、用途或結構。</p></li>
          <li><span>02</span><h3>確認授權</h3><p>先確認原作授權，再討論顏色、尺寸與調整範圍。</p></li>
          <li><span>03</span><h3>打樣製作</h3><p>確認材料與細節，完成試印後再進入正式製作。</p></li>
        </ol>
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
        <a href="mailto:hello@example.com">hello@example.com ↗</a>
        <small>Curated 3D design inspiration · Licensing checked before production</small>
      </footer>
    </main>
  );
}
