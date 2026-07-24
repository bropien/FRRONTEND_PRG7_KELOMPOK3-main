import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";

export async function PUT(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    const { token, errorResponse } = await validateJwt();
    if (errorResponse) return errorResponse;

    const body = await request.json();

    const response = await fetch(`${backendUrl}/Berita`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("BERITA UPDATE ERROR:", error);

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