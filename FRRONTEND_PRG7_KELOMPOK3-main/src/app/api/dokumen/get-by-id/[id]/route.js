import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";
import { decryptIdUrl } from "@/lib/encryptor";

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function GET(request, { params }) {
  try {
    const { token, errorResponse } = await validateJwt();
    if (errorResponse) return errorResponse;

    const id = decryptIdUrl(params.id);

    if (!id) {
      return NextResponse.json(
        { error: true, message: "ID dokumen tidak valid." },
        { status: 400 },
      );
    }

    const response = await fetch(`${BACKEND_URL}/Dokumen/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: data.message ?? "Data dokumen tidak ditemukan." },
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