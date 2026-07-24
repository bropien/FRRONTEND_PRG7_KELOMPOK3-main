import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";
import { encryptIdUrl } from "@/lib/encryptor";

export async function GET(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    const { searchParams } = new URL(request.url);

    const { token, errorResponse } = await validateJwt();

    if (errorResponse) {
      return errorResponse;
    }

    const backendEndpoint = new URL(
      `${backendUrl}/TransaksiBeritaLog`
    );

    searchParams.forEach((value, key) => {
      backendEndpoint.searchParams.append(key, value);
    });

    console.log(
      "TRANSAKSI BERITA LOG URL:",
      backendEndpoint.toString()
    );

    console.log(
      "SEARCH PARAMS:",
      Object.fromEntries(searchParams.entries())
    );

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

    console.log(
      "TRANSAKSI BERITA LOG STATUS:",
      response.status
    );

    const data = await response.json();

    console.log(
      "TRANSAKSI BERITA LOG RESPONSE:",
      data
    );

    if (
      !response.ok ||
      (data.errorMessage &&
        data.errorMessage !== "")
    ) {
      return NextResponse.json(
        {
          error: true,
          message:
            data.errorMessage ||
            "Gagal memuat data transaksi berita.",
        },
        {
          status: Math.max(
            response.status,
            400
          ),
        }
      );
    }

    const rawData =
      data.data ||
      data.Data ||
      [];

    const securedData = rawData.map((item) => ({
      ...item,
      encryptedId: encryptIdUrl(item.bclId || item.BclId),
    }));
    return NextResponse.json({
      error: false,
      data: securedData,
      totalData:
        data.totalData ||
        data.TotalData ||
        0,
      totalHalaman:
        data.totalHalaman ||
        data.TotalHalaman ||
        0,
    });

  } catch (error) {
    console.error(
      "TRANSAKSI BERITA LOG ERROR:",
      error
    );

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