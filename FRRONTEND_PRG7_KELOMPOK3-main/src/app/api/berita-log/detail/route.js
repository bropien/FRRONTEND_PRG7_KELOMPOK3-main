import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";
import { decryptIdUrl } from "@/lib/encryptor";

export async function GET(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    const { searchParams } = new URL(request.url);
    const encryptedId = searchParams.get("id");

    const { token, errorResponse } = await validateJwt();

    if (errorResponse) {
      return errorResponse;
    }

    const id = decryptIdUrl(encryptedId);

    if (!id) {
      return NextResponse.json(
        {
          error: true,
          message: "ID Log Berita tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${backendUrl}/TransaksiBeritaLog/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: true,
          message:
            data.message ||
            data.errorMessage ||
            "Gagal mengambil detail log berita.",
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
  } catch (error) {
    console.error("DETAIL LOG BERITA ERROR:", error);

    return NextResponse.json(
      {
        error: true,
        message: "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  }
}