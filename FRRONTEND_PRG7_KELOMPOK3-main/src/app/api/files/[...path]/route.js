import { NextResponse } from "next/server";
const BACKEND_URL = process.env.BACKEND_API_URL; 

export async function GET(request, { params }) {
  try {
    const filePath = params.path.join("/");
    const response = await fetch(`${BACKEND_URL}/files/SIA/${filePath}`, {
      method: "GET",
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: "File tidak ditemukan." },
        { status: response.status },
      );
    }
    const blob = await response.blob();
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const fileName = filePath.split("/").pop();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: true, message: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}