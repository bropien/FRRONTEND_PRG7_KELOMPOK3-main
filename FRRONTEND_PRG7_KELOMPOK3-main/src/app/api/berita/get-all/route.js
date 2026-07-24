import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";
import { encryptIdUrl } from "@/lib/encryptor";

export async function GET(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("Month") || "";
    const year = searchParams.get("Year") || "";

    const { token, errorResponse } = await validateJwt();

    if (errorResponse) {
      return errorResponse;
    }

    const backendEndpoint = new URL(
      `${backendUrl}/Berita`
    );

    searchParams.forEach((value, key) => {
      backendEndpoint.searchParams.append(key, value);
    });

    if (month) backendEndpoint.searchParams.append("Month", month);
    if (year) backendEndpoint.searchParams.append("Year", year);

    const response = await fetch(
      backendEndpoint.toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("BERITA RESPONSE :", data);

    if (
      !response.ok ||
      (data.errorMessage && data.errorMessage !== "")
    ) {
      return NextResponse.json(
        {
          error: true,
          message: "Gagal memuat data berita.",
        },
        {
          status: Math.max(response.status, 400),
        }
      );
    }

    const rawData = data.data || data.Data || [];

    const securedData = rawData.map((item) => ({
      ...item,
      encryptedId: encryptIdUrl(item.id || item.Id),
    }));

    return NextResponse.json({
      error: false,
      data: securedData,
      totalData: data.totalData || data.TotalData || 0,
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