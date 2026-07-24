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
        {
          error: true,
          message: "ID Berita tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    const id = decryptIdUrl(encryptedId);

    if (!id) {
      return NextResponse.json(
        {
          error: true,
          message: "ID Berita tidak valid.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${backendUrl}/berita/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: true,
          message: data.errorMessage || "Gagal mengambil data berita.",
        },
        {
          status: response.status || 400,
        }
      );
    }

    return NextResponse.json({
      error: false,
      data,
    });
  } catch (error) {
    console.error("DETAIL BERITA ERROR:", error);

    return NextResponse.json(
      {
        error: true,
        message: "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  }
}