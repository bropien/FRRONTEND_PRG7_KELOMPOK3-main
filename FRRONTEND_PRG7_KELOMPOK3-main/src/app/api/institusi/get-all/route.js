import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";
import { encryptIdUrl } from "@/lib/encryptor";

export async function GET(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;
    const { searchParams } = new URL(request.url);
    const { token, errorResponse } = await validateJwt();
    if (errorResponse) return errorResponse;

    const backendEndpoint = new URL(`${backendUrl}/Institusi`);
    searchParams.forEach((value, key) => {
      backendEndpoint.searchParams.append(key, value);
    });

    const response = await fetch(backendEndpoint.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || (data.errorMessage && data.errorMessage !== "")) {
      return NextResponse.json(
        { error: true, message: "Gagal memuat data." },
        { status: Math.max(response.status, 400) },
      );
    }

    const securedData = data.data.map((item) => ({
      ...item,
      encryptedId: encryptIdUrl(item.id),
    }));

    return NextResponse.json({
      error: false,
      data: securedData,
      totalData: data.totalData,
    });
  } catch {
    return NextResponse.json(
      { error: true, message: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
