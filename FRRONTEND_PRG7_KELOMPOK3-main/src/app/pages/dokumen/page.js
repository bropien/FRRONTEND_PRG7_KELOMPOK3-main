"use client";

import { useEffect, useState, useCallback } from "react";
import Paging from "@/components/common/Paging";
import Table from "@/components/common/Table";
import Toast from "@/components/common/Toast";
import MainContent from "@/components/layout/MainContent";
import Formsearch from "@/components/common/Formsearch";
import fetchClient from "@/lib/fetchClient";
import showAlert from "@/lib/alert";
import PermissionGuard from "@/components/PermissionGuard";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

const PAGE_SIZE = 10;

export default function TemplateDokumenPage() {
  const { ssoData } = useUser();
  const router = useRouter();

  const [dataDokumen, setDataDokumen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [pageSize] = useState(PAGE_SIZE);
  const [search, setSearch] = useState("");

  const [hasCreateAccess, setHasCreateAccess] = useState(false);
  const [hasEditAccess, setHasEditAccess] = useState(false);
  const [hasDeleteAccess, setHasDeleteAccess] = useState(false);

  const handleDownload = useCallback(async (id, namaDokumen, pathDokumen, pathLink) => {
    const url = pathDokumen || pathLink;

    if (!url) {
      Toast.error("Tidak ada file yang tersedia untuk diunduh.");
      return;
    }

    try {
      await fetchClient(
        "/api/logdownloaddokumen/create",
        { DokumenId: id, Keterangan: "" },
        "POST",
      );

      setDataDokumen((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, "Jumlah Download": (item["Jumlah Download"] ?? 0) + 1 }
            : item,
        ),
      );
    } catch {}

    try {
      const res = await fetch(`/api/files/${url}`);

      if (!res.ok) throw new Error("File tidak dapat diunduh.");

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
    } catch {
      Toast.error("Gagal mengunduh file.");
    }
  }, []);

  const buildTableRow = useCallback(
    (item, index, page, editAccess, deleteAccess) => {
      const aksi = [
        {
          IconName: "download",
          Title: "Unduh Dokumen",
          Function: () => handleDownload(item.id, item.namaDokumen, item.pathDokumen, item.pathLink),
        },
        ...(editAccess ? ["Edit"] : []),
        ...(deleteAccess ? ["Delete"] : []),
      ];

      return {
        Key: item.id,
        id: item.id,
        No: (page - 1) * PAGE_SIZE + index + 1,
        "Nama Template Dokumen": item.namaDokumen,
        Jenis: item.jenis ?? "-",
        Bagian: item.bagian ?? "-",
        Status: item.status,
        "Jumlah Download": item.jumlahDownload ?? 0,
        Aksi: aksi,
        Alignment: ["center", "center", "center", "center", "center", "center", "center"],
      };
    },
    [handleDownload],
  );

  const loadData = useCallback(
    async (page, keyword, editAccess, deleteAccess) => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          pageNumber: page,
          pageSize: PAGE_SIZE,
          ...(keyword && { keyword }),
        });

        const response = await fetchClient(
          `/api/dokumen/get-all?${params}`,
          {},
          "GET",
        );

        if (response.error) throw new Error(response.message);

        const pagedData = response.data.map((item, index) =>
          buildTableRow(
            item,
            index,
            page,
            editAccess ?? hasEditAccess,
            deleteAccess ?? hasDeleteAccess,
          ),
        );

        setDataDokumen(pagedData);
        setTotalData(response.totalData);
        setCurrentPage(page);
      } catch (err) {
        Toast.error(err.message);
        setDataDokumen([]);
        setTotalData(0);
      } finally {
        setLoading(false);
      }
    },
    [hasEditAccess, hasDeleteAccess, buildTableRow],
  );

  const handleSearch = useCallback(
    (keyword) => {
      setSearch(keyword);
      setCurrentPage(1);
      loadData(1, keyword);
    },
    [loadData],
  );

  const handleNavigation = useCallback(
    (page) => {
      loadData(page, search);
    },
    [search, loadData],
  );

  const handleAdd = useCallback(() => {
    router.push("/pages/dokumen/add");
  }, [router]);

const handleEdit = useCallback(
  (id) => {
    router.push(`/pages/dokumen/edit/${id}`);
  },
  [router],
);

  const handleDelete = useCallback(
  async (id) => {
    const isConfirmed = await showAlert({
      title: "Hapus Template Dokumen",
      text: "Apakah Anda yakin ingin menghapus data dokumen ini?",
      icon: "warning",
      confirmText: "Ya, hapus!",
    });

    if (!isConfirmed) return;

    try {
      setLoading(true);

    const response = await fetchClient(
      `/api/dokumen/set-status/${id}`,
      {},
      "PATCH",
    );
    
      if (response.error) throw new Error(response.message);

      Toast.success("Data dokumen berhasil dihapus.");
      loadData(currentPage, search);
    } catch (err) {
      Toast.error(err.message);
    } finally {
      setLoading(false);
    }
  },
  [currentPage, search, loadData],
);

  useEffect(() => {
    if (!ssoData) {
      globalThis.location.href = "/auth/login";
      return;
    }

    let editAccess = false;
    let deleteAccess = false;

    const permsStr = localStorage.getItem("permissionData");

    if (permsStr) {
      try {
        const permsArray = JSON.parse(permsStr);

        editAccess = permsArray.includes("dokumen.edit");
        deleteAccess = permsArray.includes("dokumen.delete");

        setHasCreateAccess(permsArray.includes("dokumen.create"));
        setHasEditAccess(editAccess);
        setHasDeleteAccess(deleteAccess);
      } catch {
        Toast.error("Gagal mendapatkan hak akses.");
      }
    }

    loadData(1, "", editAccess, deleteAccess);
  }, [ssoData]);

  return (
    <PermissionGuard requiredModule="dokumen">
      <MainContent
        layout="Admin"
        loading={loading}
        title="Template Dokumen"
        breadcrumb={[
          { label: "Beranda", href: "/pages/beranda" },
          { label: "Data" },
          { label: "Template Dokumen" },
        ]}
      >
        <Formsearch
          onSearch={handleSearch}
          onAdd={handleAdd}
          showAddButton={hasCreateAccess}
          showFilterButton={false}
          showExportButton={false}
          searchPlaceholder="Cari nama template dokumen"
          addButtonText="Tambah"
        />

        <div className="row align-items-center g-3">
          <div className="col-12">
            <Table
              data={dataDokumen}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {totalData > 0 && (
              <Paging
                pageSize={pageSize}
                pageCurrent={currentPage}
                totalData={totalData}
                navigation={handleNavigation}
              />
            )}
          </div>
        </div>
      </MainContent>
    </PermissionGuard>
  );
}