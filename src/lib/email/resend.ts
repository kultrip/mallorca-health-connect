type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type ResendSendResponse = {
  id?: string;
  message?: string;
  name?: string;
};

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error("Missing RESEND_API_KEY or RESEND_FROM_EMAIL");
  }

  return { apiKey, from };
}

export async function sendEmail(message: EmailMessage) {
  const { apiKey, from } = getEmailConfig();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as ResendSendResponse;

  if (!response.ok) {
    throw new Error(payload.message || `Resend email failed with status ${response.status}`);
  }

  return payload;
}
