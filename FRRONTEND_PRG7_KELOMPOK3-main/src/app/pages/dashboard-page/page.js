"use client";

import { useState, useEffect, useMemo } from "react";
import MainContent from "@/components/layout/MainContent";
import Card from "@/components/common/Card";
import DropDown from "@/components/common/Dropdown";
import PermissionGuard from "@/components/PermissionGuard";

// CHART JS
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [tahun, setTahun] = useState("");
  const [bulan, setBulan] = useState("");

  const [dashboard, setDashboard] = useState({
      totalKaryawan: 0,
       totalAnggota: 0,
        totalMahasiswa: 0,
  totalProposalAnggota: 0,
  totalProposalMahasiswa: 0,
  totalDataPkm: 0,
  totalDataProposal: 0,
  });

  const tahunOptions = [
    { Value: "", Text: "Pilih Semua" },
    { Value: "2022", Text: "2022" },
    { Value: "2023", Text: "2023" },
    { Value: "2024", Text: "2024" },
    { Value: "2025", Text: "2025" },
  ];

  const bulanOptions = [
    { Value: "", Text: "Pilih Semua" },
    { Value: "1", Text: "Januari" },
    { Value: "2", Text: "Februari" },
    { Value: "3", Text: "Maret" },
    { Value: "4", Text: "April" },
    { Value: "5", Text: "Mei" },
    { Value: "6", Text: "Juni" },
    { Value: "7", Text: "Juli" },
    { Value: "8", Text: "Agustus" },
    { Value: "9", Text: "September" },
    { Value: "10", Text: "Oktober" },
    { Value: "11", Text: "November" },
    { Value: "12", Text: "Desember" },
  ];

  // ===============================
  // OPTIONS CHART
  // ===============================
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  }), []);

  const pengabdianChart = useMemo(() => ({
    labels: ["Karyawan", "Anggota", "Mahasiswa"],
    datasets: [
      {
        label: "Total",
        data: [
          dashboard.totalKaryawan || 0,
          dashboard.totalAnggota || 0,
          dashboard.totalMahasiswa || 0,
        ],
        backgroundColor: [
          "#6f42c1",
          "#6610f2",
          "#20c997",
        ],
        borderRadius: 6,
      },
    ],
  }), [dashboard]);

  const proposalChart = useMemo(() => ({
    labels: ["Proposal Anggota", "Proposal Mahasiswa"],
    datasets: [
      {
        label: "Total",
        data: [
          dashboard.totalProposalAnggota || 0,
          dashboard.totalProposalMahasiswa || 0,
        ],
        backgroundColor: [
          "#fd7e14",
          "#0dcaf0",
        ],
        borderRadius: 6,
      },
    ],
  }), [dashboard]);

  const dataPkmChart = useMemo(() => ({
    labels: ["Data PKM"],
    datasets: [
      {
        label: "Total",
        data: [
          dashboard.totalDataPkm || 0,
        ],
        backgroundColor: [
          "#198754",
        ],
        borderRadius: 6,
      },
    ],
  }), [dashboard]);

  const dataProposalChart = useMemo(() => ({
    labels: ["Data Proposal"],
    datasets: [
      {
        label: "Total",
        data: [
          dashboard.totalDataProposal || 0,
        ],
        backgroundColor: [
          "#0d6efd",
        ],
        borderRadius: 6,
      },
    ],
  }), [dashboard]);

  // ===============================
  // FETCH DATA
  // ===============================
  useEffect(() => {
    getDashboard();
  }, [tahun, bulan]);

  const getDashboard = async () => {
    try {
      let dashboardUrl = "/api/dashboard/get-dashbord";

      const params = new URLSearchParams();

      if (bulan) {
        params.append("month", bulan);
      }

      if (tahun) {
        params.append("year", tahun);
      }

      if (params.toString()) {
        dashboardUrl += `?${params.toString()}`;
      }

      const res = await fetch(dashboardUrl);
      const data = await res.json();

      if (!data.error) {
        setDashboard(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PermissionGuard requiredModule="dashboard">
      <MainContent
        layout="Admin"
        title="Dashboard Admin"
        breadcrumb={[{ label: "Dashboard" }]}
      >
      {/* HEADER */}
      <div className="mb-4">
        <h5 className="fw-bold mb-3">
          Dashboard Admin
        </h5>

        <div className="row">

          <div className="col-md-3">
            <DropDown
              forInput="bulan"
              type="pilih"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              arrData={bulanOptions}
            />
          </div>
          <div className="col-md-3">
            <DropDown
              forInput="tahun"
              type="pilih"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              arrData={tahunOptions}
            />
          </div>
        </div>
      </div>

      {/* CARDS */}
      <Card className="mb-4">
        <div className="p-3">
          <div className="row g-3">

          </div>

          {/* ===============================
              CHART PURE CHART.JS
          =============================== */}
          <div className="row mt-4">

          <div className="col-md-6 mt-4">
            <Card>
              <div className="p-3">
                <h6 className="mb-3">
                  Statistik Pengabdian
                </h6>

                <div style={{ height: "350px" }}>
                  <Bar
                    data={pengabdianChart}
                    options={chartOptions}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="col-md-6 mt-4">
            <Card>
              <div className="p-3">
                <h6 className="mb-3">
                  Statistik Proposal
                </h6>

                <div style={{ height: "350px" }}>
                  <Bar
                    data={proposalChart}
                    options={chartOptions}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="col-md-6 mt-4">
            <Card>
              <div className="p-3">
                <h6 className="mb-3">
                  Statistik Data PKM
                </h6>

                <div style={{ height: "350px" }}>
                  <Bar
                    data={dataPkmChart}
                    options={chartOptions}
                  />
                </div>
              </div>
            </Card>
          </div>
          <div className="col-md-6 mt-4">
            <Card>
              <div className="p-3">
                <h6 className="mb-3">
                  Statistik Data Proposal
                </h6>

                <div style={{ height: "350px" }}>
                  <Bar
                    data={dataProposalChart}
                    options={chartOptions}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
        </div>
      </Card>
    </MainContent>
    </PermissionGuard>
  );
} 