import { NextResponse } from "next/server";

const LOGIN_PATH = "/auth/login";
const SSO_PATH = "/auth/sso";
const PROTECTED_PAGES_PATH = "/pages";
const ROOT_PATH = "/";

const COOKIE_JWT = "jwtToken";
const COOKIE_SSO = "ssoData";
const COOKIE_USER_DATA = "userData";

// =========================================
// PUBLIC PAGE
// =========================================
const PUBLIC_PAGES = [
  "/pages/landing-page",
  
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const loginUrl = new URL(LOGIN_PATH, request.url);
  const ssoUrl = new URL(SSO_PATH, request.url);

  const hasJwt = request.cookies.has(COOKIE_JWT);
  const hasSso = request.cookies.has(COOKIE_SSO);
  const hasUser = request.cookies.has(COOKIE_USER_DATA);

  const isAuthenticated = hasJwt && hasSso;
  const isFullyAuthenticated = isAuthenticated && hasUser;

  // =========================================
  // ROOT REDIRECT KE LANDING PAGE
  // =========================================
  if (pathname === ROOT_PATH) {
    return NextResponse.redirect(
      new URL("/pages/landing-page", request.url)
    );
  }

  // =========================================
  // PUBLIC PAGE
  // =========================================

  //perubahan supaa landing full public
  if (
    PUBLIC_PAGES.some((page) =>
      pathname.startsWith(page)
    )
  ) {
    return NextResponse.next();
  }

  // =========================================
  // LOGIN
  // =========================================
  if (pathname.startsWith(LOGIN_PATH)) {
    return isAuthenticated
      ? NextResponse.redirect(ssoUrl)
      : NextResponse.next();
  }

  // =========================================
  // SSO
  // =========================================
  if (pathname.startsWith(SSO_PATH)) {
    return isAuthenticated
      ? NextResponse.next()
      : NextResponse.redirect(loginUrl);
  }

  // =========================================
  // PROTECTED ADMIN PAGE
  // =========================================
  if (pathname.startsWith(PROTECTED_PAGES_PATH)) {
    if (!isFullyAuthenticated) {
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api).*)"],
};