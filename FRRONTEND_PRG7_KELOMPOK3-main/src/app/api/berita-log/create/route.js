import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";

export async function POST(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    const body = await request.json();

    const { token, errorResponse } = await validateJwt();

    if (errorResponse) return errorResponse;

    const payload = {
      BeritaId: Number(body.beritaId),
      Keterangan: body.keterangan,
      UserPenerima: body.userPenerima,
    };

    console.log("PAYLOAD BERITA LOG:", payload);

    const response = await fetch(
      `${backendUrl}/TransaksiBeritaLog`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log("RESPONSE BACKEND:", data);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: true,
          message:
            data.message ||
            data.errorMessage ||
            "Gagal menyimpan data.",
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      error: false,
      message:
        data.message ||
        "Data log berita berhasil disimpan.",
      id: data.id,
    });
  } catch (error) {
    console.error("CREATE BERITA LOG ERROR:", error);

    return NextResponse.json(
      {
        error: true,
        message: error.message || "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );
  }
}