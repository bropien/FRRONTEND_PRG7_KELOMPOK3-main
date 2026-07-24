import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function POST(request) {
  try {
    const { token, errorResponse } = await validateJwt();
    if (errorResponse) return errorResponse;

    const formData = await request.formData();

    const response = await fetch(`${BACKEND_URL}/Upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: data.message ?? "Gagal mengunggah berkas." },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: true, message: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}