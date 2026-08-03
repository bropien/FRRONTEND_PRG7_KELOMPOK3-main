"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import LandingLayout from "@/components/layout/Landing";
import Toast from "@/components/common/Toast";
import Table from "@/components/common/Table";
import DropDown from "@/components/common/Dropdown";
import Paging from "@/components/common/Paging";
import Formsearch from "@/components/common/Formsearch";

const YEAR_OPTIONS = [
  { Value: "", Text: "Semua Tahun" },
  { Value: "2024", Text: "2024" },
  { Value: "2025", Text: "2025" },
  { Value: "2026", Text: "2026" },
  { Value: "2027", Text: "2027" },
];

const KATEGORI_OPTIONS = [
  {
    Value: "",
    Text: "Semua Kategori",
  },
  {
    Value: "1",
    Text: "Internal",
  },
  {
    Value: "2",
    Text: "Eksternal",
  },
];

const MONTH_OPTIONS = [
  { Value: "", Text: "Semua Bulan" },
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

export default function PengabdianPage() {
  const [dataPengabdian, setDataPengabdian] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [kategori, setKategori] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const pageSize = 10;

  // Refs untuk filter
  const searchRef = useRef();
  const kategoriRef = useRef();
  const yearRef = useRef();
  const monthRef = useRef();

  const loadData = useCallback(async (page = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("PageNumber", page.toString());
      params.append("PageSize", pageSize.toString());
      
      if (year) params.append("year", year);
      if (month) params.append("month", month);
      if (kategori) params.append("kategori", kategori);
      if (search) params.append("search", search);

      const response = await fetch(
        `/api/landing/pengabdian?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.message || "Terjadi kesalahan");
      }

      setDataPengabdian(result.data || []);
      setTotalData(result.totalData || result.data?.length || 0);
      setCurrentPage(page);
    } catch (err) {
      Toast.error(err.message || "Gagal memuat data");
      setDataPengabdian([]);
      setTotalData(0);
    } finally {
      setLoading(false);
    }
  }, [year, month, kategori, search, pageSize]);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const handleSearch = (keyword) => {
        setSearch(keyword);
        setCurrentPage(1);
    };

  const transformedData = dataPengabdian.map((item, index) => ({
    Key: index,
    No: (currentPage - 1) * pageSize + index + 1,
    Kegiatan: item.kegiatan ?? "-",
    Kategori: item.kategori ?? "-",
    Skema: item.skema ?? "-",
    "Waktu Pelaksanaan": item.waktuPelaksanaan
      ? new Date(item.waktuPelaksanaan).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-",
    "Personil Karyawan": item.personilKaryawan ?? "-",
    "Personil Mahasiswa": item.personilMahasiswa ?? "-",
    "Jumlah Penerima": item.jumlahAsalPenerima ?? "-",
    "Jumlah Biaya": item.jumlahBiaya != null
      ? Number(item.jumlahBiaya).toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        })
      : "-",
    "Asal Penerima Manfaat": item.asalPenerimaManfaat ?? "-",
    Alignment: [
      "center",
      "left",
      "left",
      "left",
      "left",
      "left",
      "left",
      "center",
      "right",
      "left",
    ],
  }));

  const handleFilterApply = () => {
    const newKategori = kategoriRef.current?.value || "";
    const newYear = yearRef.current?.value || "";
    const newMonth = monthRef.current?.value || "";

    setKategori(newKategori);
    setYear(newYear);
    setMonth(newMonth);
    setCurrentPage(1);
};

  // Handler untuk reset filter
  const handleResetFilter = () => {
    if (searchRef.current) searchRef.current.value = "";
    if (kategoriRef.current) kategoriRef.current.value = "";
    if (yearRef.current) yearRef.current.value = "";
    if (monthRef.current) monthRef.current.value = "";
    
    setSearch("");
    setKategori("");
    setYear("");
    setMonth("");
    setCurrentPage(1);
  };

  // Filter content untuk Formsearch
  const filterContent = useMemo(
    () => (
      <div className="d-flex gap-2 align-items-end flex-wrap">
        <DropDown
          ref={kategoriRef}
          arrData={KATEGORI_OPTIONS}
          type="pilih"
          label="Kategori"
          forInput="filterKategori"
          defaultValue={kategori}
        />
        <DropDown
          ref={yearRef}
          arrData={YEAR_OPTIONS}
          type="pilih"
          label="Tahun"
          forInput="filterYear"
          defaultValue={year}
        />
        <DropDown
          ref={monthRef}
          arrData={MONTH_OPTIONS}
          type="pilih"
          label="Bulan"
          forInput="filterMonth"
          defaultValue={month}
        />
      </div>
    ),
    [kategori, year, month]
  );

  const handleNavigation = (page) => {
    loadData(page);
  };

  return (
    <LandingLayout>
      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <h1
              className="mb-4"
              style={{
                color: "#0B5AA7",
                fontWeight: "700",
              }}
            >
              Data Pengabdian
            </h1>

            <Formsearch
              
              onSearch={handleSearch}
              onFilter={handleFilterApply}
              onReset={handleResetFilter}
              showAddButton={false}
              showExportButton={false}
              searchPlaceholder="Cari kegiatan pengabdian..."
              filterContent={filterContent}
            />

            {/* Tabel */}
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  aria-label="Loading"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-3">
                  <Table
                    data={transformedData}
                    size="Normal"
                    enableCheckbox={false}
                    config={{
                      widths: {
                        No: "5%",
                        Kegiatan: "15%",
                        Kategori: "8%",
                        Skema: "8%",
                        
                        "Waktu Pelaksanaan": "10%",
                        "Personil Karyawan": "10%",
                        "Personil Mahasiswa": "10%",
                        "Jumlah Penerima": "8%",
                        "Jumlah Biaya": "10%",
                        "Asal Penerima Manfaat": "16%",
                      },
                      isWrap: {
                        Kategori: true,
                        Skema: true,
                        Kegiatan: true,
                        "Personil Karyawan": true,
                        "Personil Mahasiswa": true,
                        "Asal Penerima Manfaat": true,
                      },
                    }}
                  />
                </div>
                
                {/* Paging */}
                {totalData > 0 && (
                  <div className="mt-4">
                    <Paging
                      pageSize={pageSize}
                      pageCurrent={currentPage}
                      totalData={totalData}
                      navigation={handleNavigation}
                    />
                  </div>
                )}

                {totalData === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted">Tidak ada data pengabdian</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}