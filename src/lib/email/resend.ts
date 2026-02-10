import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient() {
  if (resendClient) {
    return resendClient;
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM || "Kacper Leads <noreply@example.com>";
}

export function getAppBaseUrl(): string {
  return process.env.APP_BASE_URL || "http://localhost:3000";
}

