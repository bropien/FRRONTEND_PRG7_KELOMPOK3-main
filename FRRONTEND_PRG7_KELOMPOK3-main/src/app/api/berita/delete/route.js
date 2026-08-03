import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";
import { decryptIdUrl } from "@/lib/encryptor";

export async function DELETE(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    const { token, errorResponse } = await validateJwt();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          error: true,
          message: "ID berita tidak ditemukan."
        },
        { status: 400 }
      );
    }

    // Decrypt ID
    const realId = decryptIdUrl(id);

    console.log("Encrypted ID:", id);
    console.log("Real ID:", realId);

    if (!realId) {
      return NextResponse.json(
        {
          error: true,
          message: "ID berita tidak valid."
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${backendUrl}/Berita/${realId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const text = await response.text();
    console.log("DELETE BE RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: true,
          message: data.message || "Gagal menghapus berita"
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        error: false,
        message: data.message || "Berita berhasil dihapus"
      }
    );
  } catch (error) {
    console.error("DELETE BERITA ERROR:", error);
    return NextResponse.json(
      {
        error: true,
        message: error.message
      },
      { status: 500 }
    );
  }
}