import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encryptId } from "@/lib/encryptor";

export async function POST(request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;
    const body = await request.json();
    const { username, appId, roleId, namaAplikasi, namaRole, namaUser } = body;
    const cookieStore = await cookies();
    const token = cookieStore.get("jwtToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: true, message: "Sesi tidak valid, silakan login kembali." },
        { status: 401 },
      );
    }

    const response = await fetch(`${backendUrl}/auth/getpermission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, appId, roleId }),
    });

    const data = await response.json();

    if (!response.ok || (data.errorMessage && data.errorMessage !== "")) {
      return NextResponse.json(
        { error: true, message: data.message || data.errorMessage },
        { status: 400 },
      );
    }

    const isProd = process.env.NODE_ENV === "production";

    if (data.token) {
      cookieStore.set("jwtToken", data.token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    const userDataObj = {
      nama: namaUser,
      role: namaRole,
      aplikasi: namaAplikasi,
      appId: appId,
      roleId: roleId,
    };
    const encryptedUserData = encryptId(JSON.stringify(userDataObj));

    cookieStore.set("userData", encodeURIComponent(encryptedUserData), {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({
      error: false,
      message: "Success",
      listPermission: data.listPermission,
    });
  } catch {
    return NextResponse.json(
      { error: true, message: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
