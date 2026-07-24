import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function validateJwt() {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwtToken")?.value;

  if (!token) {
    return {
      token: null,
      errorResponse: NextResponse.json(
        { error: true, message: "Sesi tidak valid, silakan login kembali." },
        { status: 401 },
      ),
    };
  }

  return { token, errorResponse: null };
}
