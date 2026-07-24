import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function POST(request) {
  try {
    const body = await request.json();
    const { DokumenId } = body;

    const id = Number.parseInt(DokumenId, 10);

    if (!DokumenId || Number.isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: true, message: "ID dokumen tidak valid." },
        { status: 400 },
      );
    }

    const payload = { DokumenId: id };

    const response = await fetch(`${BACKEND_URL}/LogDownloadDokumen/public`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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