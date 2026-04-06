import nodemailer from 'nodemailer';

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!isSmtpConfigured()) return null;
  if (!transporter) {
    const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

const fromName = process.env.MAIL_FROM_NAME ?? 'Class Konnect';
const fromAddress = process.env.MAIL_FROM ?? process.env.SMTP_USER ?? 'noreply@localhost';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendTransactionalEmail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const tx = getTransporter();
  if (!tx) {
    console.info('[email] SMTP not configured — would send:', options.to, options.subject);
    return;
  }
  const safeFromName = fromName.replace(/"/g, "'").slice(0, 200);
  await tx.sendMail({
    from: `"${safeFromName}" <${fromAddress}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    headers: {
      'X-Mailer': 'ClassTracker-Backend',
    },
  });
}

/** Welcome / account-created email (professional plain + HTML). */
export async function sendWelcomeEmail(to: string, displayName: string): Promise<void> {
  const safeName = displayName.trim() || 'there';
  const subject = `Welcome to Class Konnect — ${safeName}`;
  const text = [
    `Hi ${safeName},`,
    '',
    'Your Class Konnect account is ready. You can sign in anytime with the app.',
    '',
    'If you did not create this account, you can ignore this email.',
    '',
    `— ${fromName}`,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f9fafb;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px 24px;border:1px solid #e5e7eb;">
    <tr><td>
      <p style="margin:0 0 8px;font-size:18px;font-weight:700;">Welcome to Class Konnect</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Hi <strong>${escapeHtml(safeName)}</strong>,</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Your account is ready. Open the Class Konnect app and sign in to continue.</p>
      <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7280;">If you didn&apos;t create this account, you can ignore this message.</p>
      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">— ${escapeHtml(fromName)}</p>
    </td></tr>
  </table>
</body>
</html>`;

  await sendTransactionalEmail({ to, subject, text, html });
}
