import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";
import { decryptIdUrl } from "@/lib/encryptor";

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function POST(request) {
  try {
    const { token, errorResponse } = await validateJwt();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { DokumenId, ...restOfData } = body;

    if (!DokumenId) {
      return NextResponse.json(
        { error: true, message: "ID dokumen tidak ditemukan." },
        { status: 400 },
      );
    }

    const id = decryptIdUrl(DokumenId);

    if (!id) {
      return NextResponse.json(
        { error: true, message: "ID dokumen tidak valid." },
        { status: 400 },
      );
    }

    const payload = {
      ...restOfData,
      DokumenId: Number.parseInt(id, 10),
    };

    const response = await fetch(`${BACKEND_URL}/LogDownloadDokumen`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: data.message ?? "Gagal mencatat log download." },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: true, message: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}