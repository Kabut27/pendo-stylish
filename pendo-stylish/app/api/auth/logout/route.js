import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, getCurrentUser } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";

export async function POST(req) {
  const user = await getCurrentUser();
  cookies().set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  if (user) {
    await logAudit({ user, action: "LOGOUT", ip: getClientIp(req) });
  }
  return NextResponse.json({ ok: true });
}
