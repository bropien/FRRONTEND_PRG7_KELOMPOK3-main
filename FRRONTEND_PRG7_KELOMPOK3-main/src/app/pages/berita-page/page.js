  "use client";

  import { useEffect, useState, useCallback, useMemo, useRef } from "react";
  import Paging from "@/components/common/Paging";
  import Toast from "@/components/common/Toast";
  import MainContent from "@/components/layout/MainContent";
  import Formsearch from "@/components/common/Formsearch";
  import DropDown from "@/components/common/Dropdown";
  import { useRouter } from "next/navigation";
  import fetchClient from "@/lib/fetchClient";
  import showAlert from "@/lib/alert";
  import { useUser } from "@/context/UserContext";
  import Table from "@/components/common/Table";
  import PermissionGuard from "@/components/PermissionGuard";


  const STATUS_OPTIONS = [
    { Value: "", Text: "Semua Status" },
    { Value: "Aktif", Text: "Aktif" },
    { Value: "Tidak Aktif", Text: "Tidak Aktif" },
    { Value: "Draft", Text: "Draft" },
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

  const renderPreview = (html) => {
    if (!html) return "-";

    const imageRegex = /<img[^>]+src=["']([^"']+)["']/i;
    const imgMatch = imageRegex.exec(html);
    const firstImage = imgMatch?.[1] ?? null;

    let textContent;

    if (typeof globalThis.window === "object")  {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      textContent = tempDiv.textContent || tempDiv.innerText || "";
    } else {
      textContent = html.replace(/<[^>]*>/g, "");
    }

    if (textContent.length > 50) {
      textContent = textContent.substring(0, 50) + "...";
    }

    if (!firstImage) {
      return textContent;
    }

    return (
      <div className="d-flex align-items-center gap-2">
        <img
          src={firstImage}
          alt="thumbnail"
          style={{
            width: "40px",
            height: "40px",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
        <span>{textContent}</span>
      </div>
    );
  };

  export default function MasterBeritaPage() {
    const { ssoData } = useUser();
    const router = useRouter();

    const [dataBerita, setDataBerita] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasCreateAccess, setHasCreateAccess] = useState(false);
    const [hasEditAccess, setHasEditAccess] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalData, setTotalData] = useState(0);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterMonth, setFilterMonth] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [filterJenis, setFilterJenis] = useState("");

    const [dataLogBerita, setDataLogBerita] = useState([]);
    const [totalLogData, setTotalLogData] = useState(0);

    const [currentLogPage, setCurrentLogPage] = useState(1);
    const [logPageSize] = useState(10);

    const [searchLog, setSearchLog] = useState("");
    const [filterLogMonth, setFilterLogMonth] = useState("");
    const [filterLogYear, setFilterLogYear] = useState("");

    const statusRef = useRef();
    const monthRef = useRef();
    const yearRef = useRef();
    const jenisRef = useRef();
    const logMonthRef = useRef();
    const logYearRef = useRef();

    const currentYear = new Date().getFullYear();

    

    const YEAR_OPTIONS = [
      { Value: "", Text: "Semua Tahun" },
      ...Array.from({ length: 6 }, (_, i) => ({
        Value: (currentYear - 2 + i).toString(),
        Text: (currentYear - 2 + i).toString(),
      })),
    ];

    const handleDelete = async (id,realId) => {
      const isConfirmed = await showAlert({
        title: "Hapus Draft",
        text: "Yakin ingin menghapus berita draft ini?",
        icon: "warning",
        confirmText: "Ya, hapus!",
      });

      if (!isConfirmed) return;

      try {
        setLoading(true);

        const response = await fetchClient(
          "/api/berita/delete",
          {
              id
          },
          "DELETE"
      );

        if (response.error)
          throw new Error(response.message);

        Toast.success(
          response.message ||
          "Berita berhasil dihapus"
        );

        await loadData(currentPage);

      } catch (err) {
        Toast.error(
          err.message ||
          "Gagal menghapus berita"
        );
      } finally {
        setLoading(false);
      }
    };

    const loadLogData = useCallback(
      async (page = 1) => {
        try {
          const params = {
            PageNumber: page,
            PageSize: logPageSize,
          };

          if (searchLog?.trim()) {
            params.SearchKeyword = searchLog;
          }

          if (filterLogMonth) {
            params.Month = Number.parseInt(filterLogMonth);
          }

          if (filterLogYear) {
            params.Year = Number.parseInt(filterLogYear);
          }

          const response = await fetchClient(
            "/api/berita-log/get-all",
            params,
            "GET"
          );

          if (response.error) {
            throw new Error(response.message);
          }

          const rawData = response.data || response.Data || [];

          let filteredData = rawData;


          const mapped = filteredData.map((item, index) => ({
            no: (page - 1) * logPageSize + index + 1,
            bclId: item.encryptedId,     
            realId: item.bclId || item.BclId,
            brtId: item.brtId || item.BrtId ,
            brtJudul: item.brtJudul || item.BrtJudul,
            keterangan: item.bclKeterangan || item.BclKeterangan,
            pengirim: item.bclUserPengirim || item.BclUserPengirim,
            penerima: item.bclUserPenerima || item.BclUserPenerima,
            tanggal: item.bclTanggalKirim || item.BclTanggalKirim,
          }));

          setDataLogBerita(mapped);
          setTotalLogData(
            response.totalData || response.TotalData || 0
          );

          setCurrentLogPage(page);
        } catch (err) {
          Toast.error(err.message);
          setDataLogBerita([]);
          setTotalLogData(0);
        }
      },
      [
        searchLog,
        filterLogMonth,
        filterLogYear,
        logPageSize,
      ]
    );

    const handleLogNavigation = (page) => {
      loadLogData(page);
    };

    const handleLogDetail = (id) => {
      router.push(`/pages/log-berita-page/detail/${id}`);
    };

    const handleApprove = async (id) => {
      const isConfirmed = await showAlert({
        title: "Approve Berita",
        text: "Yakin ingin menyetujui berita ini?",
        icon: "warning",
        confirmText: "Ya, approve!",
      });

      if (!isConfirmed) return;

      try {
        setLoading(true);

        const response = await fetchClient(
          `/api/berita/approve`,
          { id },
          "POST"
        );

        if (response.error) throw new Error(response.message);

        Toast.success(response.message || "Berita berhasil disetujui");

        await loadData(currentPage);
      } catch (err) {
        Toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    const loadData = useCallback(async (page) => {
      try {
        setLoading(true);

        const params = {
          PageNumber: page,
          PageSize: pageSize,
        };

        if (search?.trim()) {
          params.SearchKeyword = search;
        }

        if (filterStatus) {
          params.Status = filterStatus;
        }

        if (filterMonth) {
          params.Month = Number.parseInt(filterMonth);
        }

        if (filterYear) {
          params.Year = Number.parseInt(filterYear);
        }

        if (filterJenis) {
          params.Jenis = filterJenis;
        }

        console.log("Request params:", params);

        const response = await fetchClient(
          "/api/berita/get-all",
          params,
          "GET"
        );

        console.log("API RESPONSE :", response);

        if (response.error) {
          throw new Error(response.message);
        }

        const rawData = response.data || response.Data || [];

        const mapped = rawData.map((item, index) => ({
          no: (page - 1) * pageSize + index + 1,
          id: item.encryptedId,
          realId: item.id || item.Id,
          judul: item.judul || item.Judul,
          banner: item.banner || item.Banner,
          konten: item.konten || item.Konten,
          tanggal: item.tanggal || item.Tanggal,
          status: item.status || item.Status,
          jenis: item.jenis || item.Jenis,
          image: "/images/news-default.jpg",
          rowClassName:
          (item.status || item.Status) === "Draft"
            ? "row-draft"
            : "",
        }));

        const sortedData = [...mapped].sort((a, b) => {
          const priority = {
            Draft: 1,
            Aktif: 2,
            "Tidak Aktif": 3,
          };

          const statusCompare =
            priority[a.status] - priority[b.status];

          if (statusCompare !== 0) {
            return statusCompare;
          }

          return new Date(b.tanggal) - new Date(a.tanggal);
        });

        const finalData = sortedData.map((item, idx) => ({
          ...item,
          no: (page - 1) * pageSize + idx + 1,
        }));

        console.log("MAPPED & SORTED:", finalData);
        setDataBerita(finalData);

        setTotalData(response.totalData || response.TotalData || 0);
        setCurrentPage(page);
      } catch (err) {
        console.error(err);
        Toast.error(err.message);
        setDataBerita([]);
        setTotalData(0);
      } finally {
        setLoading(false);
      }
    }, [pageSize, search, filterStatus, filterMonth, filterYear, filterJenis]);

    useEffect(() => {
      if (ssoData === undefined) return;
      if (!ssoData) {
        router.push("/auth/login");
        return;
      }
      loadData(1);
      loadLogData();
    }, [ssoData, search, filterStatus, filterMonth, filterYear, filterJenis]);

    const handleNavigation = (page) => {
      loadData(page);
    };

    const handleDetail = (id) => {
      router.push(
        `/pages/berita-page/detail/${id}`
      );
    };

    const handleEdit = (id) => {
      router.push(`/pages/berita-page/edit/${id}`);
    };

    const handleToggle = async (id) => {
      const berita = dataBerita.find((item) => item.id === id);

      const currentStatus = berita?.status;

      console.log("ID:", id);
      console.log("STATUS:", currentStatus);

      const isActive = currentStatus === "Aktif";

      const isConfirmed = await showAlert({
        title: isActive
          ? "Nonaktifkan Berita"
          : "Aktifkan Berita",

        text: isActive
          ? "Apakah Anda yakin ingin menonaktifkan berita ini?"
          : "Apakah Anda yakin ingin mengaktifkan berita ini?",

        icon: "warning",
        confirmText: "Ya, saya yakin!",
      });

      if (!isConfirmed) return;

      try {
        setLoading(true);

        const response = await fetchClient(
          "/api/berita/set-status",
          { id: id },
          "POST"
        );

        if (response.error) {
          throw new Error(response.message);
        }

        Toast.success(
          response.message || "Status berhasil diubah"
        );

        await loadData(currentPage);

      } catch (err) {
        console.error(err);
        Toast.error(
          err.message || "Gagal mengubah status"
        );
      } finally {
        setLoading(false);
      }
    };

    // Handle filter apply (dipanggil saat tombol filter diklik)
    const handleFilterApply = () => {
      const newStatus = statusRef.current?.value || "";
      const newMonth = monthRef.current?.value || "";
      const newYear = yearRef.current?.value || "";
      const newJenis = jenisRef.current?.value || "";
      
      setFilterStatus(newStatus);
      setFilterMonth(newMonth);
      setFilterYear(newYear);
      setCurrentPage(1);
      setFilterJenis(newJenis);
    };

    // Buat filter content untuk Formsearch
    const filterContent = useMemo(
      () => (
        <div className="d-flex gap-2 align-items-end">
          <DropDown
            ref={statusRef}
            arrData={STATUS_OPTIONS}
            type="pilih"
            label="Status"
            forInput="filterStatus"
            defaultValue={filterStatus}
          />

          <DropDown
            ref={monthRef}
            arrData={MONTH_OPTIONS}
            type="pilih"
            label="Bulan"
            forInput="filterMonth"
            defaultValue={filterMonth}
          />

          <DropDown
            ref={yearRef}
            arrData={YEAR_OPTIONS}
            type="pilih"
            label="Tahun"
            forInput="filterYear"
            defaultValue={filterYear}
          />

          <DropDown
            ref={jenisRef}
            arrData={JENIS_OPTIONS}
            type="pilih"
            label="Jenis"
            forInput="filterJenis"
            defaultValue={filterJenis}
          />
        </div>
      ),
      [filterStatus, filterMonth, filterYear, filterJenis]
    );

    const handleLogFilterApply = () => {
      setFilterLogMonth(
        logMonthRef.current?.value || ""
      );

      setFilterLogYear(
        logYearRef.current?.value || ""
      );

      setCurrentLogPage(1);
    };

    useEffect(() => {
      if (!ssoData) return;

      loadLogData(1);
    }, [
      ssoData,
      searchLog,
      filterLogMonth,
      filterLogYear
    ]);

    const filterLogContent = useMemo(
      () => (
        <div className="d-flex gap-2 align-items-end">
          <DropDown
            ref={logMonthRef}
            arrData={MONTH_OPTIONS}
            type="pilih"
            label="Bulan"
            forInput="filterLogMonth"
            defaultValue={filterLogMonth}
          />

          <DropDown
            ref={logYearRef}
            arrData={YEAR_OPTIONS}
            type="pilih"
            label="Tahun"
            forInput="filterLogYear"
            defaultValue={filterLogYear}
          />
        </div>
      ),
      [filterLogMonth, filterLogYear]
    );

    useEffect(() => {
      if (!ssoData) {
        globalThis.location.href = "/auth/login";
        return;
      }

      const permsStr = localStorage.getItem("permissionData");
      if (permsStr) {
        try {
          const permsArray = JSON.parse(permsStr);
          setHasCreateAccess(permsArray.includes("berita.create"));
          setHasEditAccess(permsArray.includes("berita.edit"));
        } catch {
          Toast.error("Gagal mendapatkan hak akses.");
        }
      }

      loadData(1);
      loadLogData();
    }, [ssoData]);

    const handleAdd = () => {
      router.push("/pages/berita-page/add");
    };

    const handleAddLog = () => {
      router.push("/pages/log-berita-page/add");
    };

    const buildAksi = useCallback(
      (status) => {
        if (status === "Draft") {
          return [
            "Detail",
            ...(hasEditAccess ? ["Edit"] : []),
            "Approve",
            "Delete",
          ];
        }

        return [
          "Detail",
          ...(hasEditAccess
            ? ["Edit", "Toggle"]
            : []),
        ];
      },
      [hasEditAccess]
    );

    return (
      <PermissionGuard requiredModule="berita">
      <MainContent
        layout="Admin"
        loading={loading}
        title="Berita"
        breadcrumb={[
          { label: "Beranda", href: "/pages/beranda" },
          { label: "Berita" },
        ]}
      >
        <Formsearch
          onSearch={(q) => {
            setSearch(q);
          }}
          onAdd={handleAdd}
          onFilter={handleFilterApply}
          showAddButton={hasCreateAccess}
          showExportButton={false}
          searchPlaceholder="Cari berita..."
          addButtonText="Tambah"
          filterContent={filterContent}
        />

        {/* Tabel Data */}
        <div className="row align-items-center g-3 mt-2">
          <div className="col-12">
            <h5 className="mb-3">Data Berita</h5>
            <Table
              data={dataBerita.map((item) => {
                let statusText = "Tidak Aktif";

                if (item.status === "Draft") {
                  statusText = "Draft";
                } else if (item.status === "Aktif") {
                  statusText = "Aktif";
                }

                return {
                  No: item.no,
                  Judul: item.judul,
                  Banner:
                    item.banner === "1"
                      ? "Ya"
                      : "Tidak",

                  Konten: renderPreview(item.konten),

                  Jenis:
                    item.jenis?.length > 50
                      ? item.jenis.substring(0, 50) + "..."
                      : item.jenis,

                  Tanggal: item.tanggal
                    ? new Date(item.tanggal).toLocaleDateString("id-ID")
                    : "-",

                  Status: statusText,

                  Aksi: buildAksi(item.status),
                  id: item.id,

                  Alignment: [
                    "center",
                    "left",
                    "left",
                    "left",
                    "center",
                    "center",
                    "center",
                  ],
                };
              })}
              onDetail={handleDetail}
              onEdit={handleEdit}
              onToggle={handleToggle}
              onApprove={handleApprove}
              onDelete={handleDelete}
            />
          </div>  
        </div>

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

        {/* Tabel Transaksi Berita */}
        <div className="row align-items-center g-3 mt-5">
          <div className="col-12">
            <h5 className="mb-3">Riwayat Transaksi Berita</h5>

            <Formsearch
              onSearch={(q) => setSearchLog(q)}
              onFilter={handleLogFilterApply}
              showAddButton={true}
              onAdd={handleAddLog}
              showExportButton={false}
              searchPlaceholder="Cari transaksi..."
              addButtonText="Tambah Transaksi"
              filterContent={filterLogContent}
            />

            <Table
              data={dataLogBerita.map((item) => ({
                No: item.no,
                "Judul Berita": item.brtJudul || item.brtId,
                Keterangan: item.keterangan,
                Pengirim: item.pengirim,
                Penerima: item.penerima,
                Tanggal: item.tanggal
                  ? new Date(item.tanggal).toLocaleString("id-ID")
                  : "-",
                Aksi: ["Detail"],
                id: item.bclId,
                Alignment: [
                  "center",
                  "center",
                  "left",
                  "center",
                  "center",
                  "center",
                ],
              }))}
              onDetail={handleLogDetail}
            />
          </div>
        </div>
        {totalLogData > 0 && (
          <div className="mt-4">
            <Paging
              pageSize={logPageSize}
              pageCurrent={currentLogPage}
              totalData={totalLogData}
              navigation={handleLogNavigation}
            />
          </div>
        )}
      </MainContent>
      </PermissionGuard>
      
    );
  }
