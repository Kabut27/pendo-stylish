// lib/auth.js
// Usimamizi wa "login session" kwa kutumia signed JWT ndani ya httpOnly cookie.
// MUHIMU: Ruhusa (roles) zote zinathibitishwa hapa upande wa SERVER - si frontend tu.

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const COOKIE_NAME = "pendo_session";
const SESSION_DURATION = "12h";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET haijawekwa vizuri kwenye .env (angalau herufi 16)."
    );
  }
  return new TextEncoder().encode(secret);
}

// ---------- Password hashing ----------
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainPassword, salt);
}

export async function verifyPassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Angalia password ni imara vya kutosha (angalau herufi 8, herufi kubwa+ndogo+namba).
 */
export function isStrongPassword(pw) {
  if (typeof pw !== "string" || pw.length < 8) return false;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  return hasLower && hasUpper && hasNumber;
}

// ---------- JWT session tokens ----------
export async function createSessionToken(user) {
  return new SignJWT({
    sub: user.id,
    username: user.username,
    role: user.role,
    full_name: user.full_name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload; // { sub, username, role, full_name, iat, exp }
  } catch {
    return null;
  }
}

/**
 * Weka cookie ya session baada ya login kufaulu (imetumika kwenye API route handler).
 */
export function sessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // masaa 12
  };
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

/**
 * Soma mtumiaji wa sasa kutoka kwa cookie (kwa Server Components / Route Handlers).
 * Rudisha null kama hajaingia au token si sahihi.
 */
export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  return {
    id: payload.sub,
    username: payload.username,
    role: payload.role,
    full_name: payload.full_name,
  };
}

/**
 * Helper ya Route Handlers: hakikisha mtumiaji ameingia, na (hiari) ana role fulani.
 * Rudisha { user } au { error, status } - route inapaswa kuangalia error kabla ya kuendelea.
 */
export async function requireUser(allowedRoles = null) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Huna ruhusa. Tafadhali ingia (login) kwanza.", status: 401 };
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { error: "Huruhusiwi kufanya kitendo hiki.", status: 403 };
  }
  return { user };
}
