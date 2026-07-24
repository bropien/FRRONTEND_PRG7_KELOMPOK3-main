import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";
import { decryptIdUrl } from "@/lib/encryptor";

export async function POST(request) {

  try {

    const backendUrl = process.env.BACKEND_API_URL;

    const body = await request.json();
    const { id } = body;

    const { token, errorResponse } = await validateJwt();

    if (errorResponse) return errorResponse;

    if (!id) {

      return NextResponse.json(
        {
          error: true,
          message: "ID tidak ditemukan.",
        },
        {
          status: 400,
        }
      );

    }

    // ==========================
    // DECRYPT
    // ==========================

    const realId = decryptIdUrl(id);

    const response = await fetch(
      `${backendUrl}/Berita/${realId}/status`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {

      return NextResponse.json(
        {
          error: true,
          message: data.message,
        },
        {
          status: response.status,
        }
      );

    }

    return NextResponse.json({
      error: false,
      message: data.message,
    });

  } catch (error) {

    return NextResponse.json(
      {
        error: true,
        message: error.message,
      },
      {
        status: 500,
      }
    );

  }

}