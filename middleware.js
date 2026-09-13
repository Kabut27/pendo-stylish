// middleware.js
// Ulinzi wa kwanza wa njia (routes) za Dashibodi - hii inakimbia KABLA ya ukurasa wowote
// kupakiwa, hivyo mfanyakazi hawezi kuona ukurasa wa admin hata kwa "kubahatisha" URL.
// KUMBUKA: Hii haitoshi peke yake - kila API route pia inathibitisha ruhusa yake (defense in depth).

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "pendo_session";

async function verify(token) {
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "");
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith("/dashibodi");
  if (!isDashboard) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verify(token) : null;

  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/dashibodi/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/dashibodi/mfanyakazi", request.url));
  }

  if (pathname.startsWith("/dashibodi/mfanyakazi") && payload.role !== "staff" && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashibodi/:path*"],
};
