import { NextResponse } from "next/server";
import { encryptIdUrl } from "@/lib/encryptor";

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword") || "";
    const jenis = searchParams.get("jenis") || "";
    const pageNumber = searchParams.get("pageNumber") || "1";
    const pageSize = searchParams.get("pageSize") || "100";

    const query = new URLSearchParams({
      ...(keyword && { Keyword: keyword }),
      ...(jenis && { Jenis: jenis }),
      PageNumber: pageNumber,
      PageSize: pageSize,
    });

    const response = await fetch(`${BACKEND_URL}/Dokumen/public?${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: "Gagal mendapatkan data dokumen." },
        { status: response.status },
      );
    }

    const encryptedData = data.data.map((item) => ({
      ...item,
      id: encryptIdUrl(item.id),
    }));

    return NextResponse.json({ ...data, data: encryptedData });
  } catch {
    return NextResponse.json(
      { error: true, message: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}