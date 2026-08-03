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

      totalPengabdianSkema:
        data.totalPengabdianSkema ??
        data.TotalPengabdianSkema ??
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

      chartPengabdian:
        data.chartPengabdian ??
        data.ChartPengabdian ??
        [],
      chartDataPkm:
        data.chartDataPkm ??
        data.ChartDataPkm ??
        [],
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