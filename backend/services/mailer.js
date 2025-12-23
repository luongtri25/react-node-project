// backend/services/mailer.js
const nodemailer = require('nodemailer');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  SMTP_SECURE
} = process.env;

let transporter = null;
let isEthereal = false;

async function createTransporter() {
  // If env is present, use it
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: String(SMTP_SECURE).toLowerCase() === 'true' || Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }

  // Fallback for dev: create Ethereal account (preview only)
  try {
    const testAccount = await nodemailer.createTestAccount();
    const etherealTransport = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    isEthereal = true;
    console.warn('[mailer] SMTP not configured, using Ethereal test account. Messages will not deliver to real inbox.');
    console.warn(`[mailer] Ethereal user: ${testAccount.user}`);
    return etherealTransport;
  } catch (err) {
    console.warn('[mailer] SMTP not configured and failed to create test account:', err.message);
    return null;
  }
}

async function sendMail({ to, subject, html }) {
  if (!transporter) {
    transporter = await createTransporter();
  }
  if (!transporter) {
    console.warn('SMTP not configured; skipped sending email to', to);
    return;
  }
  const from = SMTP_FROM || SMTP_USER || 'no-reply@example.com';
  const info = await transporter.sendMail({ from, to, subject, html });

  if (isEthereal) {
    const url = nodemailer.getTestMessageUrl(info);
    if (url) console.log('[mailer] Preview URL:', url);
  }
}

async function sendOrderStatusEmail({ to, name, orderId, status }) {
  const safeName = name || 'Bạn';
  const subject = `Cập nhật đơn hàng ${orderId}: ${status}`;
  const html = `
    <p>Chào ${safeName},</p>
    <p>Trạng thái đơn hàng <strong>${orderId}</strong> đã được cập nhật: <strong>${status}</strong>.</p>
    <p>Nếu bạn không thực hiện, vui lòng liên hệ hỗ trợ.</p>
    <p>-- PokeShop3D</p>
  `;
  await sendMail({ to, subject, html });
}

module.exports = {
  sendMail,
  sendOrderStatusEmail
};
