"use client";

import { useEffect, useState, useCallback } from "react";
import LandingLayout from "@/components/layout/Landing";
import Toast from "@/components/common/Toast";
import Table from "@/components/common/Table";
import Paging from "@/components/common/Paging";
import Formsearch from "@/components/common/Formsearch";

const PAGE_SIZE = 10;

export default function DokumenPanduanPage() {
  const [dataDokumen, setDataDokumen] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [pageSize] = useState(PAGE_SIZE);
  const [search, setSearch] = useState("");


  const handleDownload = useCallback(
    async (id, namaDokumen, pathDokumen, pathLink) => {
      const url = pathDokumen || pathLink;

      if (!url) {
        Toast.error("Tidak ada file yang tersedia untuk diunduh.");
        return;
      }

      try {
        await fetch("/api/landing/logdownloaddokumen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ DokumenId: id }),
        });

        setDataDokumen((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, jumlahDownload: (item.jumlahDownload ?? 0) + 1 }
              : item
          )
        );
      } catch {}

      try {
        const res = await fetch(`/api/files/${url}`);

        if (!res.ok) {
          throw new Error("File tidak dapat diunduh.");
        }

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        const ext = url.split(".").pop();
        const fileName = `${namaDokumen}.${ext}`;

        const link = document.createElement("a");

        link.href = blobUrl;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();

        link.remove();
        URL.revokeObjectURL(blobUrl);

      } catch (err) {
        console.error(err);
        Toast.error("Gagal mengunduh file.");
      }
    },
    []
  );


  const loadData = useCallback(async (page, keyword) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        jenis: "Panduan",
        page: String(page),
        pageSize: String(PAGE_SIZE),
        ...(keyword && { keyword }),
      });

      const response = await fetch(
        `/api/landing/dokumen?${params}`
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.message);
      }

      setDataDokumen(
        Array.isArray(result.data.data)
          ? result.data.data
          : []
      );
      setTotalData(result.data.totalData ?? 0);
      setCurrentPage(page);

    } catch (err) {
      Toast.error(err.message);
      setDataDokumen([]);
      setTotalData(0);

    } finally {
      setLoading(false);
    }

  }, []);


  useEffect(() => {
    loadData(1, "");
  }, [loadData]);


  const handleSearch = useCallback(
    (keyword) => {
      setSearch(keyword);
      loadData(1, keyword);
    },
    [loadData]
  );

  const handleNavigation = useCallback(
    (page) => {
      loadData(page, search);
    },
    [search, loadData]
  );


  const transformedData = dataDokumen.map((item, index) => ({
  Key: item.id,
  id: item.id,

  No: (currentPage - 1) * PAGE_SIZE + index + 1,

  "Nama Panduan Dokumen": item.namaDokumen,

  Bagian: item.bagian ?? "-",

  "Jumlah Download": item.jumlahDownload ?? 0,

  Aksi: [
    {
      IconName: "download",
      Title: "Unduh Dokumen",
      Function: () =>
        handleDownload(
          item.id,
          item.namaDokumen,
          item.pathDokumen,
          item.pathLink
        ),
    },
  ],

  Alignment: [
    "center",
    "center",
    "center",
    "center",
    "center",
  ],
  }));


  return (
    <LandingLayout>

      <div className="container py-5">

        <h1
          className="mb-4"
          style={{
            color:"#0B5AA7",
            fontWeight:"700"
          }}
        >
          Panduan Dokumen
        </h1>

        <Formsearch
          onSearch={handleSearch}
          showAddButton={false}
          showFilterButton={false}
          showExportButton={false}
          searchPlaceholder="Cari nama panduan dokumen"
        />

        {
          loading ? (

            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                aria-label="Loading"
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>
            </div>

          ) 
          :
          (
            <>
              <Table
                data={transformedData}
                size="Normal"
                enableCheckbox={false}
                config={{
                  widths:{
                    No:"5%",
                    "Nama Panduan Dokumen":"50%",
                    Bagian:"20%",
                    "Jumlah Download":"15%",
                    Aksi:"10%"
                  },

                  isWrap:{
                    "Nama Panduan Dokumen":true
                  }
                }}
              />

              {totalData > 0 && (
                <Paging
                  pageSize={pageSize}
                  pageCurrent={currentPage}
                  totalData={totalData}
                  navigation={handleNavigation}
                />
              )}
            </>
          )
        }

      </div>

    </LandingLayout>
  );
}