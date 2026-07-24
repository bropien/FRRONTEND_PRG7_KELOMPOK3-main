import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";

export async function POST(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;
    const body = await request.json();
    const { token, errorResponse } = await validateJwt();
    if (errorResponse) return errorResponse;

    const response = await fetch(`${backendUrl}/Institusi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || (data.errorMessage && data.errorMessage !== "")) {
      return NextResponse.json(
        { error: true, message: "Gagal menyimpan data." },
        { status: Math.max(response.status, 400) },
      );
    }

    return NextResponse.json({
      error: false,
      message: "SUCCESS",
    });
  } catch {
    return NextResponse.json(
      { error: true, message: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
