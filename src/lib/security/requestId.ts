import { randomBytes } from "crypto";

export function generateRequestId(): string {
  return randomBytes(16).toString("hex");
}

export function getRequestId(request: Request): string {
  const headerId = request.headers.get("x-request-id");
  if (headerId) {
    return headerId;
  }
  return generateRequestId();
}

