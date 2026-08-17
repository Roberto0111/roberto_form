import Link from "next/link";

export default function NotFound() {
  return (
    <main className="track-shell track-missing">
      <div className="track-brand"><Link href="/"><span className="brand-mark">RF</span><strong>ROBERT FORM</strong></Link></div>
      <section>
        <p className="eyebrow">ORDER NOT FOUND</p>
        <h1>找不到這筆訂單</h1>
        <p>這個連結可能不完整。請使用訂單編號與下單 Email 重新查詢，或聯絡店家協助。</p>
        <div><Link className="track-primary-link" href="/track">重新查詢訂單 →</Link><a href="mailto:loxa8858@gmail.com">聯絡店家</a></div>
      </section>
    </main>
  );
}
