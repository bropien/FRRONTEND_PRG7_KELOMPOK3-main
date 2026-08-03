import { NextResponse } from "next/server";
import { encryptIdUrl } from "@/lib/encryptor";

export async function GET(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    const { searchParams } = new URL(request.url);

    const backendEndpoint = new URL(
      `${backendUrl}/Berita/landing-by-status`
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

    const result = await response.json();

    console.log("Landing by status response:", result);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: true,
          message:
            result.message || "Gagal mengambil data berita.",
        },
        {
          status: response.status,
        }
      );
    }

    const rawData =
      result.data ||
      result.Data ||
      [];

    const securedData = rawData.map((item) => ({
      ...item,
      encryptedId: encryptIdUrl(item.id || item.Id),
    }));

    return NextResponse.json({
      error: false,
      data: securedData,
      totalData:
        result.totalData ??
        result.TotalData ??
        securedData.length,
      totalHalaman:
        result.totalHalaman ??
        result.TotalHalaman ??
        1,
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