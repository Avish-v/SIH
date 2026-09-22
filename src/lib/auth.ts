import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

export type AuthRole = "ADMIN" | "LOGISTICS_OPERATOR" | "EMERGENCY_OFFICER" | "FIELD_OFFICER";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  passwordHash: string;
}

interface SessionPayload {
  userId: string;
  expiresAt: number;
}

const scrypt = promisify(scryptCallback);
const users = new Map<string, AuthUser>();
const SESSION_COOKIE = "ner_session";

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  return value;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string) {
  if (password.length < 10) throw new Error("Password must be at least 10 characters.");
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, encoded] = storedHash.split(":");
  if (!salt || !encoded) return false;
  const expected = Buffer.from(encoded, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function ensureSeedUser() {
  const email = process.env.AUTH_ADMIN_EMAIL;
  const password = process.env.AUTH_ADMIN_PASSWORD;
  if (!email || !password) return;
  const key = normalizeEmail(email);
  if (!users.has(key)) {
    users.set(key, {
      id: "admin",
      email: key,
      name: process.env.AUTH_ADMIN_NAME || "NER-LOGIX Administrator",
      role: "ADMIN",
      passwordHash: await hashPassword(password),
    });
  }
}

export async function registerUser(input: { email: string; password: string; name: string; role?: AuthRole }) {
  await ensureSeedUser();
  const email = normalizeEmail(input.email);
  if (!email || !email.includes("@")) throw new Error("A valid email address is required.");
  if (!input.name.trim()) throw new Error("Name is required.");
  if (users.has(email)) throw new Error("An account with this email already exists.");
  const user: AuthUser = {
    id: randomBytes(12).toString("hex"),
    email,
    name: input.name.trim(),
    role: input.role ?? "FIELD_OFFICER",
    passwordHash: await hashPassword(input.password),
  };
  users.set(email, user);
  return publicUser(user);
}

export async function authenticate(input: { email: string; password: string }) {
  await ensureSeedUser();
  const user = users.get(normalizeEmail(input.email));
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new Error("Invalid email or password.");
  }
  return publicUser(user);
}

export function publicUser(user: AuthUser) {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function createSession(userId: string) {
  const payload: SessionPayload = { userId, expiresAt: Date.now() + 8 * 60 * 60 * 1000 };
  const encoded = encode(JSON.stringify(payload));
  const signature = createHmac("sha256", secret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function getUserFromSession(session: string | undefined) {
  if (!session) return null;
  const [encoded, signature] = session.split(".");
  if (!encoded || !signature) return null;
  const expected = createHmac("sha256", secret()).update(encoded).digest();
  const actual = Buffer.from(signature, "base64url");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(decode(encoded)) as SessionPayload;
    if (payload.expiresAt < Date.now()) return null;
    return [...users.values()].find((user) => user.id === payload.userId) ?? null;
  } catch {
    return null;
  }
}

export function sessionCookieName() {
  return SESSION_COOKIE;
}
