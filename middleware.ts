import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/console")) return NextResponse.next();
  if (request.cookies.has("ner_session")) return NextResponse.next();
  const login = new URL("/", request.url);
  login.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/console/:path*"] };
