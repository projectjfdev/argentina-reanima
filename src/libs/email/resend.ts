import { Resend } from "resend";
import {
  confirmEmailHtml,
  confirmEmailSubject,
  confirmEmailText,
} from "@/libs/email/templates/confirmEmail";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail =
  process.env.RESEND_FROM_EMAIL || "noreply@argentinareanima.org.ar";

function getAppUrl() {
  return process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
}

function getResendClient() {
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is required to send verification emails");
  }

  return new Resend(resendApiKey);
}

export async function sendConfirmEmail({
  email,
  name,
  token,
}: {
  email: string;
  name: string;
  token: string;
}) {
  const confirmUrl = new URL("/auth/verify-email", getAppUrl());
  confirmUrl.searchParams.set("token", token);

  const resend = getResendClient();

  await resend.emails.send({
    from: resendFromEmail,
    to: email,
    subject: confirmEmailSubject(),
    html: confirmEmailHtml({ name, confirmUrl: confirmUrl.toString() }),
    text: confirmEmailText({ name, confirmUrl: confirmUrl.toString() }),
  });
}

