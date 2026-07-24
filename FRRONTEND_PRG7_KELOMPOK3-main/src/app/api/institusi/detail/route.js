import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";
import { decryptIdUrl } from "@/lib/encryptor";

export async function GET(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;
    const { searchParams } = new URL(request.url);
    const encryptedId = searchParams.get("id");
    const { token, errorResponse } = await validateJwt();
    if (errorResponse) return errorResponse;

    if (!encryptedId) {
      return NextResponse.json(
        { error: true, message: "ID Institusi tidak ditemukan." },
        { status: 400 },
      );
    }

    const id = decryptIdUrl(encryptedId);

    if (!id) {
      return NextResponse.json(
        { error: true, message: "ID Institusi tidak valid." },
        { status: 400 },
      );
    }

    const response = await fetch(`${backendUrl}/Institusi/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || (data.errorMessage && data.errorMessage !== "")) {
      return NextResponse.json(
        { error: true, message: "Gagal mengambil data." },
        { status: Math.max(response.status, 400) },
      );
    }

    return NextResponse.json({ error: false, data: data });
  } catch {
    return NextResponse.json(
      { error: true, message: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
