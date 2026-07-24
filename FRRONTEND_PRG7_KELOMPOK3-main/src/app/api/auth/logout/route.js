import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete("jwtToken");
  cookieStore.delete("ssoData");
  cookieStore.delete("userData");

  return NextResponse.json({
    error: false,
    message: "Logout berhasil.",
  });
}
