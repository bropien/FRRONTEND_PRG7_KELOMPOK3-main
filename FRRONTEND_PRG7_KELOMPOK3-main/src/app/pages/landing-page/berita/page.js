"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LandingLayout from "@/components/layout/Landing";
import Img from "@/components/common/Img";
import Button from "@/components/common/Button";
import Formsearch from "@/components/common/Formsearch";
import DropDown from "@/components/common/Dropdown";

import Paging from "@/components/common/Paging";


// Opsi filter jenis berita
const JENIS_OPTIONS = [
  { Value: "", Text: "Semua Jenis" },
  { Value: "Beranda", Text: "Beranda" },
  { Value: "Panduan", Text: "Panduan" },
  { Value: "Penelitian", Text: "Penelitian" },
  { Value: "Publikasi Ilmiah", Text: "Publikasi Ilmiah" },
  { Value: "Sneemo", Text: "Sneemo" },
  { Value: "Technologic", Text: "Technologic" },
  { Value: "Astratech Conference", Text: "Astratech Conference" },
];

export default function LandingBeritaPage() {
  const router = useRouter();

  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("terbaru");
  const [yearFilter, setYearFilter] = useState("");
  const [filterJenis, setFilterJenis] = useState(""); // State untuk filter jenis

  const [totalData, setTotalData] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getBerita(currentPage);
  }, [currentPage, searchTerm, filterJenis]); // Tambahkan filterJenis ke dependency

  const getBerita = async (page = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.append("PageNumber", page);
      params.append("PageSize", 9);

      if (searchTerm)
        params.append("Search", searchTerm);

      if (filterJenis) // Kirim filter jenis ke API
        params.append("Jenis", filterJenis);

      const response = await fetch(
        `/api/landing/landing-by-status?${params.toString()}`
      );

      const result = await response.json();

      setBerita(result.data || []);
      setTotalData(result.totalData || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching berita:", error);
      setBerita([]);
      setTotalData(0);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleDetail = (encryptedId) => {
    router.push(`/pages/landing-page/detail-berita/${encryptedId}`);
  };

  const handleSearch = (value) => {
    setSearchTerm(value.toLowerCase());
    setCurrentPage(1);
  };


  const handleFilterApply = () => {
    // Trigger re-fetch dengan filter yang sudah di state
    getBerita(1);
  };

  // Handler untuk perubahan jenis
  const handleJenisChange = (e) => {
    setFilterJenis(e.target.value);
    setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
  };

  const displayedBerita = useMemo(() => {
    let list = [...berita];

    // Filter tahun (client-side)
    if (yearFilter?.length === 4) {
      list = list.filter((item) => {
        if (!item.tanggal) return false;
        return new Date(item.tanggal).getFullYear().toString() === yearFilter;
      });
    }

    // Sortir
    list.sort((a, b) => {
      const dateA = new Date(a.tanggal);
      const dateB = new Date(b.tanggal);
      return sortOrder === "terbaru" ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [berita, sortOrder, yearFilter]);

  const recentBerita = useMemo(() => {
    return [...berita]
      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
      .slice(0, 5);
  }, [berita]);

  const renderBeritaCard = (item) => {
    const detailHref = `/pages/landing-page/detail-berita/${item.encryptedId}`;

    return (
      <div className="col-12 col-md-6 col-lg-4" key={item.id}>
        <div className="bg-white rounded-5 shadow-sm overflow-hidden h-100 d-flex flex-column berita-card">
          <Link href={detailHref}>
            <div className="berita-image-wrapper">
              {item.konten ? (
                <Img
                  src={item.konten}
                  alt={item.judul}
                  height={220}
                  objectFit="cover"
                  className="w-100 berita-image"
                />
              ) : (
                <div className="berita-placeholder">
                  <span>Tidak ada gambar</span>
                </div>
              )}
            </div>
          </Link>

          <div className="p-3 d-flex flex-column flex-grow-1">
            <Link href={detailHref} className="text-decoration-none">
              <h5
                className="fw-bold mb-2"
                style={{
                  color: "#1a1a1a",
                  fontSize: "17px",
                  lineHeight: "1.4",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.judul}
              </h5>
            </Link>

            {(item.penulis || item.tanggal) && (
              <div
                className="mb-2"
                style={{ fontSize: "13px", color: "#0B5AA7" }}
              >
                {item.penulis && <span>Oleh {item.penulis} | </span>}
                <span>{formatDate(item.tanggal)}</span>
              </div>
            )}

            <p
              className="text-muted mb-3"
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.deskripsi}
            </p>

            <div className="mt-auto">
              <Button
                classType="primary"
                label="Selengkapnya"
                onClick={() => handleDetail(item.encryptedId)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" aria-label="Loading">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    if (displayedBerita.length === 0) {
      return (
        <div className="text-center py-5 text-muted">
          Belum ada berita yang tersedia.
        </div>
      );
    }

    return (
      <div className="row g-4">
        {displayedBerita.map((item) => renderBeritaCard(item))}
      </div>
    );
  };

  return (
    <LandingLayout>
      <div className="container py-5">
        <div className="row g-4">
          {/* KONTEN UTAMA */}
          <div className="col-lg-9">
            <Formsearch
              showAddButton={false}
              showExportButton={false}
              searchPlaceholder="Cari Berita..."
              onSearch={handleSearch}
              onFilter={handleFilterApply}
              filterContent={
                
                  <DropDown
                    label="Jenis Berita"
                    forInput="filterJenis"
                    arrData={JENIS_OPTIONS}
                    value={filterJenis}
                    onChange={handleJenisChange}
                    type="pilih"
                  />
                
              }
            />

            {renderMainContent()}
            <div className="mt-4 d-flex justify-content-center">
              <Paging
                pageSize={9}
                pageCurrent={currentPage}
                totalData={totalData}
                navigation={(page) => {
                  setCurrentPage(page);
                  getBerita(page);
                }}
              />
            </div>
          </div>

          {/* SIDEBAR BERITA TERKINI */}
          <div className="col-lg-3">
            <div className="bg-white rounded-5 shadow-sm p-4">
              <h5 className="fw-bold mb-3" style={{ color: "#0B5AA7" }}>
                5 Berita Terkini
              </h5>

              {recentBerita.length === 0 && !loading && (
                <div className="text-muted small">Belum ada berita.</div>
              )}

              <div className="d-flex flex-column gap-3">
                {recentBerita.map((item) => (
                  <Link
                    key={item.id}
                    href={`/pages/landing-page/detail-berita/${item.encryptedId}`}
                    className="d-flex gap-2 text-decoration-none"
                  >
                    <Img
                      src={item.konten}
                      alt={item.judul}
                      width={70}
                      height={60}
                      objectFit="cover"
                      className="rounded-3 flex-shrink-0"
                    />
                    <div>
                      <div
                        className="fw-semibold"
                        style={{
                          fontSize: "13px",
                          color: "#1a1a1a",
                          lineHeight: "1.35",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.judul}
                      </div>
                      <small style={{ color: "#0B5AA7" }}>
                        {item.penulis && <>Oleh {item.penulis} | </>}
                        {formatDate(item.tanggal)}
                      </small>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .berita-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .berita-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
        }

        .berita-image-wrapper {
          width: 100%;
          height: 220px;
          overflow: hidden;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .berita-image {
          width: 100%;
          height: 220px;
          object-fit: cover;
        }

        .berita-placeholder {
          width: 100%;
          height: 100%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          font-size: 14px;
          font-weight: 500;
        }
      `}</style>
    </LandingLayout>
  );
}