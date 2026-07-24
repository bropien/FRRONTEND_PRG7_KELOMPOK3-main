"use client";

// ==============================================================================
// 1. IMPORT REACT & NEXT
// ==============================================================================
import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

// ==============================================================================
// 2. IMPORT LAYOUT & UTILITIES
// ==============================================================================
import MainContent from "@/components/layout/MainContent";
import Card from "@/components/common/Card";
import Toast from "@/components/common/Toast";
import showAlert from "@/lib/alert";
import DateFormatter from "@/lib/dateFormater";
import { useUser } from "@/context/UserContext";

// ==============================================================================
// 3. IMPORT UI COMPONENTS
// ==============================================================================
import Table from "@/components/common/Table";
import Paging from "@/components/common/Paging";
import Formsearch from "@/components/common/Formsearch";
import Badge from "@/components/common/Badge";
import { Avatar } from "@/components/common/Img";
import Input from "@/components/common/Input";
import DropDown from "@/components/common/Dropdown";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import Icon from "@/components/common/Icon";
import Modal from "@/components/common/Modal";

// ==============================================================================
// 4. DYNAMIC IMPORTS (Komponen Berat / Tidak Support SSR)
// ==============================================================================
const Editor = dynamic(() => import("@/components/common/Editor"), {
  ssr: false,
  loading: () => (
    <div className="p-3 border rounded text-muted">Loading Editor...</div>
  ),
});

const Calendar = dynamic(() => import("@/components/common/Calendar"), {
  ssr: false,
  loading: () => (
    <div className="p-1 border rounded text-muted">Loading Kalender...</div>
  ),
});

export default function SamplePage() {
  // ----------------------------------------------------------------------
  // A. CONTEXT & GLOBAL STATE
  // ----------------------------------------------------------------------
  const { ssoData } = useUser();
  const [pageLoading, setPageLoading] = useState(true);
  const [manualLoading] = useState(false);

  // ----------------------------------------------------------------------
  // B. STATE FORM & INPUT
  // ----------------------------------------------------------------------
  const [textInput, setTextInput] = useState("Nilai Teks");
  const [dropdownValue, setDropdownValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("<p>Tulis sesuatu...</p>");
  const [singleDate, setSingleDate] = useState(new Date());

  // ----------------------------------------------------------------------
  // C. STATE TABLE & PAGING
  // ----------------------------------------------------------------------
  const [pageSize] = useState(5);
  const [pageCurrent, setPageCurrent] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  // ----------------------------------------------------------------------
  // D. HANDLERS (Gunakan useCallback agar tidak memicu Infinite Loop!)
  // ----------------------------------------------------------------------

  const handleSelectionChange = useCallback((ids) => setSelectedIds(ids), []);
  const handleNavigation = useCallback((page) => setPageCurrent(page), []);

  const handleDetail = useCallback(
    (id) => Toast.success(`Lihat detail data ID: ${id}`),
    [],
  );
  const handleEdit = useCallback(
    (id) => Toast.success(`Ubah data ID: ${id}`),
    [],
  );

  const handleDelete = useCallback(async (id) => {
    const isConfirmed = await showAlert({
      title: "Konfirmasi Hapus",
      text: `Apakah Anda yakin ingin menghapus data ID: ${id}?`,
      icon: "warning",
      confirmText: "Ya, Hapus!",
    });

    if (isConfirmed) {
      Toast.success(`Data ID: ${id} berhasil dihapus`);
    }
  }, []);

  const handleClickCustomInput = useCallback((message) => {
    Toast.success(`Anda mengklik: ${message}`);
  }, []);

  // ----------------------------------------------------------------------
  // E. KONFIGURASI TABLE (Gunakan useMemo agar tidak re-render terus)
  // ----------------------------------------------------------------------
  const tableConfig = useMemo(
    () => ({
      widths: { Jabatan: "15%", Status: "10%" },
      isWrap: { Keterangan: true },
    }),
    [],
  );

  const rowColorConfig = useCallback((row) => {
    if (row.Status === "Tidak Aktif") return "table-danger";
    if (row.Jabatan === "Programmer") return "table-success";
    return "";
  }, []);

  const checkIsSelectable = useCallback((row) => row.No % 2 === 0, []);

  const sampleData = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      Key: i + 1,
      No: i + 1,
      Nama: `Mahasiswa ${i + 1}`,
      Jabatan: i % 2 === 0 ? "Programmer" : "Designer",
      Keterangan:
        "Contoh teks panjang untuk mengetes fitur word-wrap pada tabel.",
      Status: i % 3 === 0 ? "Aktif" : "Tidak Aktif",
      ["Custom Toggle"]:
        i % 3 === 0 ? (
          <Icon
            name="toggle-on"
            cssClass="btn px-1 py-0 text-primary fs-5"
            onClick={() => handleClickCustomInput("Toggle On")}
          />
        ) : (
          <Icon
            name="toggle-off"
            cssClass="btn px-1 py-0 text-secondary fs-5"
            onClick={() => handleClickCustomInput("Toggle Off")}
          />
        ),
      Aksi: ["Detail", "Edit", "Delete"],
      Alignment: [
        "center",
        "center",
        "left",
        "center",
        "center",
        "center",
        "center",
      ],
      id: i + 1,
    }));
  }, [handleClickCustomInput]);

  const totalData = sampleData.length;
  const pagedData = useMemo(() => {
    return sampleData.slice(
      (pageCurrent - 1) * pageSize,
      pageCurrent * pageSize,
    );
  }, [sampleData, pageCurrent, pageSize]);

  // ----------------------------------------------------------------------
  // G. EFFECTS
  // ----------------------------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MainContent
      layout="Admin"
      loading={pageLoading}
      title="Contoh Komponen"
      breadcrumb={[
        { label: "Beranda", href: "/" },
        { label: "Contoh Komponen" },
      ]}
    >
      <div className="alert alert-info rounded-4 border-0 shadow-sm mb-4">
        <Icon name="info-circle" cssClass="me-2" />
        Anda login sebagai: <strong>{ssoData?.nama || "Guest"}</strong>. Data
        ini diambil dengan aman dari <code>useUser()</code> Context.
      </div>

      <Loading loading={manualLoading} message="Memuat aksi Anda..." />

      <div className="row g-3">
        <div className="col-lg-8">
          <Card title="1. Formsearch & Filter">
            <Formsearch
              onAdd={() => setIsModalOpen(true)} // Buka modal saat tambah
              onSearch={(q) => Toast.success(`Pencarian: ${q}`)}
              onFilter={() => Toast.success("Filter diterapkan")}
              addButtonText="Buka Modal Tambah"
              filterContent={
                <DropDown
                  forInput="ddStatus"
                  label="Status"
                  type="semua"
                  arrData={[
                    { Value: "Aktif", Text: "Aktif" },
                    { Value: "Tidak Aktif", Text: "Tidak Aktif" },
                  ]}
                />
              }
            />
          </Card>

          <Card title="2. Table Enterprise & Pagination" className="mt-3">
            <Table
              data={pagedData}
              onDetail={handleDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
              enableCheckbox={true}
              isRowSelectable={checkIsSelectable}
              onSelectionChange={handleSelectionChange}
              config={tableConfig}
              rowClassName={rowColorConfig}
            />
            {totalData > 0 && (
              <Paging
                pageSize={pageSize}
                pageCurrent={pageCurrent}
                totalData={totalData}
                navigation={handleNavigation}
              />
            )}
            <div className="mt-3 bg-light p-2 rounded text-muted small">
              <Icon name="check2-square" cssClass="me-2" />
              Data Terpilih (ID): {selectedIds.join(", ") || "Tidak ada"}
            </div>
          </Card>

          <Card title="3. Form Inputs & Editor" className="mt-3">
            <div className="row g-3">
              <div className="col-md-6">
                <Input
                  label="Input Standar"
                  name="text_input"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ketik sesuatu..."
                  tooltip="Disini panduan untuk user jika ada"
                  required
                />
              </div>
              <div className="col-md-6">
                <DropDown
                  label="Dropdown Pilihan"
                  forInput="ddContoh"
                  type="pilih"
                  value={dropdownValue}
                  onChange={(e) => setDropdownValue(e.target.value)}
                  arrData={[
                    { Value: "1", Text: "Pilihan Satu" },
                    { Value: "2", Text: "Pilihan Dua" },
                  ]}
                />
              </div>
              <div className="col-md-6">
                <Calendar
                  type="single"
                  label="Kalender (Date Picker)"
                  value={singleDate}
                  onChange={(date) => setSingleDate(date)}
                />
                <small className="text-primary d-block mt-1">
                  Format API:{" "}
                  <strong>
                    {DateFormatter.formatDateForInput(singleDate)}
                  </strong>
                </small>
              </div>
              <div className="col-12">
                <Editor
                  label="Rich Text Editor (CKEditor)"
                  name="content"
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="col-lg-4">
          <Card title="4. Variasi Tombol">
            <div className="d-flex flex-wrap gap-2">
              <Button classType="primary" label="Simpan" iconName="save" />
              <Button classType="outline-primary" label="Outline" />
              <Button classType="danger" label="Hapus" iconName="trash" />
              <Button
                classType="success"
                label="Setuju"
                iconName="check-circle"
              />
              <Button classType="secondary" label="Disabled" isDisabled />
              <Button
                classType="primary"
                iconName="search"
                iconOnly
                title="Cari"
              />
            </div>
          </Card>

          <Card title="5. Badges & Avatar" className="mt-3">
            <div className="d-flex flex-wrap gap-2 mb-3">
              <Badge status="Aktif" />
              <Badge status="Tidak Aktif" />
              <Badge status="Diproses" />
              <Badge status="Ditolak" />
            </div>
            <div className="d-flex align-items-center gap-3 border-top pt-3">
              <Avatar name="Budi Santoso" size={45} />
              <span className="fw-semibold">Avatar Otomatis</span>
            </div>
          </Card>

          <Card title="6. Feedback Utilities" className="mt-3">
            <p className="fw-bold small text-muted mb-2">Toast Notifications</p>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <Button
                onClick={() => Toast.success("Sukses!")}
                classType="success"
                size="sm"
                label="Toast Sukses"
              />
              <Button
                onClick={() => Toast.error("Gagal!")}
                classType="danger"
                size="sm"
                label="Toast Error"
              />
            </div>

            <p className="fw-bold small text-muted mb-2">
              Sweet Alerts (Async)
            </p>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <Button
                onClick={async () => {
                  await showAlert({
                    title: "Oops!",
                    text: "Sesi habis.",
                    icon: "error",
                  });
                }}
                classType="warning"
                size="sm"
                label="Alert Alert"
              />
              <Button
                onClick={async () => {
                  const input = await showAlert({
                    title: "Alasan Penolakan",
                    text: "Ketik alasan:",
                    icon: "info",
                    confirmText: "Kirim",
                    inputType: "text",
                  });
                  if (input) Toast.success(`Alasan: ${input}`);
                }}
                classType="info"
                size="sm"
                label="Alert Input"
              />
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Form Tambah Mahasiswa"
        size="md"
        footer={
          <>
            <Button
              classType="secondary"
              label="Batal"
              onClick={() => setIsModalOpen(false)}
            />
            <Button
              classType="primary"
              label="Simpan Data"
              iconName="save"
              onClick={() => {
                Toast.success("Data di modal disimpan!");
                setIsModalOpen(false);
              }}
            />
          </>
        }
      >
        <p className="text-muted small">
          Modal ini menggunakan tag <code>&lt;dialog&gt;</code> HTML5 sehingga
          aman dari blokir Linter SonarQube.
        </p>
        <Input
          label="Nama Lengkap"
          name="modalNama"
          value=""
          onChange={() => {}}
          placeholder="Masukkan nama..."
        />
        <Input
          label="NIM"
          name="modalNim"
          value=""
          onChange={() => {}}
          placeholder="Contoh: 0320..."
        />
      </Modal>
    </MainContent>
  );
}
