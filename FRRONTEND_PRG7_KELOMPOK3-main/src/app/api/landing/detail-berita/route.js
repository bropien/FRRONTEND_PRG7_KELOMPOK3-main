import { NextResponse } from "next/server";
import { decryptIdUrl } from "@/lib/encryptor";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const encryptedId = searchParams.get("id");

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
          message: "ID berita tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    const backendUrl = process.env.BACKEND_API_URL;

    const response = await fetch(
      `${backendUrl}/Berita/landing-detail?id=${id}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: true,
          message:
            data.message || "Gagal mengambil detail berita.",
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      error: false,
      data,
    });
  } catch (err) {
    console.error(err);

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