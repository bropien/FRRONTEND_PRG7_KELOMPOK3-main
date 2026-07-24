import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";

export async function POST(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    const { token, errorResponse } = await validateJwt();
    if (errorResponse) return errorResponse;

    const body = await request.json();

    const response = await fetch(`${backendUrl}/Berita`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    
    if (!response.ok) {
      return NextResponse.json(
        {
          error: true,
          message: data.message ?? "Gagal menyimpan data.",
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("BERITA CREATE ERROR:", err);

    return NextResponse.json(
      {
        error: true,
        message: "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );
  }
}