import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    const { searchParams } = new URL(request.url);

    const keyword = searchParams.get("keyword") || "";
    const jenis = searchParams.get("jenis") || "";

    const query = new URLSearchParams({
      ...(keyword && { Keyword: keyword }),
      ...(jenis && { Jenis: jenis }),
    });

    const response = await fetch(
      `${backendUrl}/Dokumen/landing?${query}`
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: true,
          message: data.message || "Gagal mengambil data dokumen.",
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