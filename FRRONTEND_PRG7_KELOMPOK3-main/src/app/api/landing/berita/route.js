import { NextResponse } from "next/server";
import { encryptIdUrl } from "@/lib/encryptor";

export async function GET() {
  try {
    const backendUrl =
      process.env.BACKEND_API_URL;

    const response = await fetch(
      `${backendUrl}/Berita/landing`
    );

    const data =
      await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: true,
          message:
            data.message || "Gagal mengambil data berita.",
        },
        {
          status: response.status,
        }
      );
    }

    const rawData = Array.isArray(data)
    ? data
    : data.data || data.Data || [];
    
        const securedData = rawData.map((item) => ({
          ...item,
          encryptedId: encryptIdUrl(item.id || item.Id),
        }));
    
        return NextResponse.json({
          error: false,
          data: securedData,
        });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: true,
      },
      {
        status: 500,
      }
    );
  }
}