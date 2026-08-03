import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    const { searchParams } = new URL(request.url);
    
    const backendEndpoint = new URL(
      `${backendUrl}/LandingPage/landing/data-pkm`
    );

    searchParams.forEach((value, key) => {
      if (value !== "") {
        backendEndpoint.searchParams.append(key, value);
      }
    });

    const response = await fetch(
      backendEndpoint.toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: true,
          message:
            data.message || "Gagal mengambil data pengabdian.",
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      error: false,
      data: data,
      totalData: data.length,
    });
  } catch (error) {
    console.error(error);

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