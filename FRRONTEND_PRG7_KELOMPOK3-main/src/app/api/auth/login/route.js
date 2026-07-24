import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encryptId } from "@/lib/encryptor";

export async function POST(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;
    const body = await request.json();
    const { username, password, jenisAplikasi } = body;

    const res = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, jenisAplikasi }),
    });

    const data = await res.json();

    if (!res.ok || (data.errorMessage && data.errorMessage !== "")) {
      return NextResponse.json(
        {
          error: true,
          message:
            data.message ||
            data.errorMessage ||
            "Username atau password tidak valid.",
        },
        { status: res.status === 200 ? 401 : res.status },
      );
    }

    const dataUser = {
      listAplikasi: data.listAplikasi,
      username: username,
      nama: data.nama,
    };

    const encryptedSsoData = encryptId(JSON.stringify(dataUser));
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    cookieStore.set("jwtToken", data.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    cookieStore.set("ssoData", encodeURIComponent(encryptedSsoData), {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ error: false, message: "Login Berhasil." });
  } catch {
    return NextResponse.json(
      { error: true, message: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
