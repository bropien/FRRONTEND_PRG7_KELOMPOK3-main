import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";
import { decryptIdUrl } from "@/lib/encryptor";

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function PUT(request) {
  try {
    const { token, errorResponse } = await validateJwt();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { EncryptedId, ...restOfData } = body;

    if (!EncryptedId) {
      return NextResponse.json(
        { error: true, message: "ID dokumen tidak ditemukan." },
        { status: 400 },
      );
    }

    const id = decryptIdUrl(EncryptedId);

    if (!id) {
      return NextResponse.json(
        { error: true, message: "ID dokumen tidak valid." },
        { status: 400 },
      );
    }

    const payload = {
      ...restOfData,
      Id: Number.parseInt(id, 10),
    };

    const response = await fetch(`${BACKEND_URL}/Dokumen`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: data.message ?? "Gagal menyimpan data dokumen." },
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