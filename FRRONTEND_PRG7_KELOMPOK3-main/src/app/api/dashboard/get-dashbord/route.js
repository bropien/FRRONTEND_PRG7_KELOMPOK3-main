import { NextResponse } from "next/server";
import { validateJwt } from "@/lib/validateJwt";

export async function GET(request) {
  try {
    const backendUrl =
      process.env.BACKEND_API_URL;

    const { token, errorResponse } =
      await validateJwt();

    if (errorResponse) {
      return errorResponse;
    }

    const { searchParams } =
      new URL(request.url);

    const month =
      searchParams.get("month");

    const year =
      searchParams.get("year");

    let backendEndpoint =
      `${backendUrl}/Dashboard`;

    const params =
      new URLSearchParams();

    if (month)
      params.append("month", month);

    if (year)
      params.append("year", year);

    if (params.toString()) {
      backendEndpoint +=
        `?${params.toString()}`;
    }

    const response = await fetch(
      backendEndpoint,
      {
        method: "GET",
        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: true,
          message:
            "Gagal memuat dashboard",
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      error: false,
      totalBerita:
        data.totalBerita ?? data.TotalBerita ?? 0,

      totalDokumen:
        data.totalDokumen ?? data.TotalDokumen ?? 0,

      totalTransaksiBerita:
        data.totalTransaksiBerita ??
        data.TotalTransaksiBerita ??
        0,

      totalDownloadDokumen:
        data.totalDownloadDokumen ??
        data.TotalDownloadDokumen ??
        0,

      totalKaryawan:
        data.totalKaryawan ??
        data.TotalKaryawan ??
        0,

      totalAnggota:
        data.totalAnggota ??
        data.TotalAnggota ??
        0,

      totalMahasiswa:
        data.totalMahasiswa ??
        data.TotalMahasiswa ??
        0,

      totalProposalAnggota:
        data.totalProposalAnggota ??
        data.TotalProposalAnggota ??
        0,

      totalProposalMahasiswa:
        data.totalProposalMahasiswa ??
        data.TotalProposalMahasiswa ??
        0,

        totalDataPkm:
          data.totalDataPkm ??
          data.TotalDataPkm ??
          0,

        totalDataProposal:
          data.totalDataProposal ??
          data.TotalDataProposal ??
          0,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: true,
        message:
          "Terjadi kesalahan server",
      },
      {
        status: 500,
      }
    );
  }
}