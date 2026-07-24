import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";
import { decryptIdUrl } from "@/lib/encryptor";

export async function PUT(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;
    const body = await request.json();
    const { encryptedId, ...restOfData } = body;
    const { token, errorResponse } = await validateJwt();
    if (errorResponse) return errorResponse;

    if (!encryptedId) {
      return NextResponse.json(
        { error: true, message: "ID Institusi tidak ditemukan." },
        { status: 400 },
      );
    }

    const id = decryptIdUrl(encryptedId);

    if (!id) {
      return NextResponse.json(
        { error: true, message: "ID Institusi tidak valid." },
        { status: 400 },
      );
    }

    const payload = {
      ...restOfData,
      id: Number.parseInt(id, 10),
    };

    const response = await fetch(`${backendUrl}/Institusi`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || (data.errorMessage && data.errorMessage !== "")) {
      return NextResponse.json(
        { error: true, message: "Gagal menyimpan data." },
        { status: Math.max(response.status, 400) },
      );
    }

    return NextResponse.json({
      error: false,
      message: "SUCCESS",
    });
  } catch {
    return NextResponse.json(
      { error: true, message: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
