import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl =
      process.env.BACKEND_API_URL;

    const response = await fetch(
      `${backendUrl}/Berita/landing`
    );

    const data =
      await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: true,
          message:
            data.message || "Gagal mengambil data berita.",
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
      },
      {
        status: 500,
      }
    );
  }
}