type EmailOrder = {
  id: string;
  customerName: string;
  email: string;
  shippingMethod: string;
  address: string | null;
  storeChain: string | null;
  storeName: string | null;
  storeCode: string | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  itemsJson: string;
};

type EmailItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

const money = (value: number) => `NT$${value.toLocaleString("zh-TW")}`;
const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

export const isOrderEmailConfigured = () =>
  Boolean((process.env.BREVO_API_KEY || process.env.RESEND_API_KEY) && process.env.ORDER_FROM_EMAIL);

export async function sendOrderConfirmationEmail(order: EmailOrder, attempt: number, statusUrl: string) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ORDER_FROM_EMAIL;
  const fromName = process.env.ORDER_FROM_NAME ?? "ROBERT FORM";
  if ((!brevoApiKey && !resendApiKey) || !fromEmail) {
    throw new Error("寄件服務尚未設定，請先設定寄信金鑰與寄件地址。");
  }

  let items: EmailItem[] = [];
  try { items = JSON.parse(order.itemsJson) as EmailItem[]; } catch { items = []; }

  const destination = order.shippingMethod === "cvs"
    ? `${order.storeChain ?? ""} ${order.storeName ?? ""}（${order.storeCode ?? ""}）`
    : order.address ?? "";
  const itemText = items.map((item) => `・${item.name} × ${item.quantity}　${money(item.lineTotal)}`).join("\n");
  const itemHtml = items.map((item) => `<li style="padding:8px 0;border-bottom:1px solid #e5e1d8"><span>${escapeHtml(item.name)} × ${item.quantity}</span><strong style="float:right">${money(item.lineTotal)}</strong></li>`).join("");
  const bankName = process.env.BANK_NAME ?? "";
  const bankCode = process.env.BANK_CODE ?? "";
  const bankBranch = process.env.BANK_BRANCH ?? "";
  const bankAccount = process.env.BANK_ACCOUNT ?? "";
  const bankHolder = process.env.BANK_HOLDER ?? "";
  const replyTo = process.env.ORDER_REPLY_TO ?? process.env.ORDER_ADMIN_EMAIL;

  const text = `${order.customerName} 您好：

您的 ROBERT FORM 訂單已由店家確認，請核對以下內容。

訂單編號：${order.id}
${itemText}
商品小計：${money(order.subtotal)}
運費：${money(order.shippingFee)}
訂單總額：${money(order.total)}
配送：${destination}

付款方式：銀行轉帳
銀行：${bankName}（${bankCode}）${bankBranch}
帳號：${bankAccount}
戶名：${bankHolder}

請於轉帳後前往專屬訂單頁填寫帳號末五碼。確認入帳後，我們會安排製作。

查看進度與回報轉帳：${statusUrl}

ROBERT FORM
聯絡信箱：${process.env.ORDER_ADMIN_EMAIL ?? "loxa8858@gmail.com"}`;

  const html = `<!doctype html><html lang="zh-Hant"><body style="margin:0;background:#f2efe7;color:#1e1e1c;font-family:Arial,'Noto Sans TC',sans-serif"><div style="max-width:640px;margin:0 auto;padding:40px 22px"><div style="background:#171717;color:#d9ff43;padding:18px 22px;font-weight:800;letter-spacing:.08em">ROBERT FORM</div><div style="background:#fff;padding:30px 24px"><p>${escapeHtml(order.customerName)} 您好：</p><h1 style="font-size:28px;margin:16px 0 8px">訂單已確認</h1><p style="color:#666;line-height:1.7">請核對商品、配送與金額，確認無誤後再完成銀行轉帳。</p><div style="margin:24px 0;padding:14px;background:#f2efe7"><small>訂單編號</small><br><strong style="font-size:20px">${escapeHtml(order.id)}</strong></div><ul style="list-style:none;margin:0;padding:0">${itemHtml}</ul><table style="width:100%;margin:20px 0;border-collapse:collapse"><tr><td style="padding:5px 0">商品小計</td><td style="text-align:right">${money(order.subtotal)}</td></tr><tr><td style="padding:5px 0">運費</td><td style="text-align:right">${money(order.shippingFee)}</td></tr><tr><td style="padding:10px 0;font-weight:800">訂單總額</td><td style="text-align:right;font-size:22px;font-weight:800">${money(order.total)}</td></tr></table><p><strong>配送：</strong>${escapeHtml(destination)}</p><div style="margin-top:24px;padding:20px;background:#d9ff43"><strong>銀行轉帳資料</strong><p style="line-height:1.8;margin-bottom:0">${escapeHtml(bankName)}（${escapeHtml(bankCode)}）${escapeHtml(bankBranch)}<br>帳號：${escapeHtml(bankAccount)}<br>戶名：${escapeHtml(bankHolder)}</p></div><p style="margin:24px 0;color:#666;line-height:1.7">轉帳完成後，請到專屬訂單頁填寫帳號末五碼；確認入帳後，我們會安排製作。</p><a href="${escapeHtml(statusUrl)}" style="display:block;padding:15px 18px;background:#171717;color:#d9ff43;text-align:center;text-decoration:none;font-weight:800">查看訂單進度與回報轉帳 →</a></div></div></body></html>`;

  if (brevoApiKey) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "ROBERT-FORM-Order-Desk/1.0",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: order.email, name: order.customerName }],
        ...(replyTo ? { replyTo: { email: replyTo, name: "ROBERT FORM" } } : {}),
        subject: `ROBERT FORM 訂單已確認｜${order.id}`,
        htmlContent: html,
        textContent: text,
        tags: ["order-confirmation"],
        headers: { "X-Robert-Form-Attempt": String(attempt) },
      }),
    });
    const result = await response.json().catch(() => ({})) as { messageId?: string; message?: string; code?: string };
    if (!response.ok || !result.messageId) {
      throw new Error(result.message ?? result.code ?? "確認信寄送失敗，訂單狀態尚未變更。");
    }
    return result.messageId;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `robert-form-${order.id}-confirmation-${attempt}`,
      "User-Agent": "ROBERT-FORM-Order-Desk/1.0",
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [order.email],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject: `ROBERT FORM 訂單已確認｜${order.id}`,
      html,
      text,
    }),
  });
  const result = await response.json().catch(() => ({})) as { id?: string; message?: string; error?: { message?: string } };
  if (!response.ok || !result.id) throw new Error(result.message ?? result.error?.message ?? "確認信寄送失敗，訂單狀態尚未變更。");
  return result.id;
}
