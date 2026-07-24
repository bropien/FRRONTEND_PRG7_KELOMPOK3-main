"use client";

import { useState, useCallback } from "react";
import MainContent from "@/components/layout/MainContent";
import Label from "@/components/common/Label";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Toast from "@/components/common/Toast";
import fetchClient from "@/lib/fetchClient";
import { useRouter } from "next/navigation";
import PermissionGuard from "@/components/PermissionGuard";
import DropDown from "@/components/common/Dropdown";

export default function TambahTemplateDokumenPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    NamaDokumen: "",
    Bagian: "",
    Jenis: "",  
    File: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const BAGIAN_OPTIONS = [
  { Value: "HKI", Text: "HKI" },
  { Value: "INOVASI", Text: "INOVASI" },
  { Value: "PENELITIAN", Text: "PENELITIAN" },
  { Value: "PENGABDIAN", Text: "PENGABDIAN" },
  ];

  const JENIS_OPTIONS = [
  { Value: "Template", Text: "Template" },
  { Value: "Panduan", Text: "Panduan" },
];

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, File: file }));
      setErrors((prev) => ({ ...prev, File: "" }));
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.NamaDokumen)
      newErrors.NamaDokumen = "Nama template dokumen wajib diisi.";
    if (!form.Jenis)
      newErrors.Jenis = "Jenis dokumen wajib diisi.";
    if (!form.Bagian)
      newErrors.Bagian = "Bagian wajib diisi.";
    if (!form.File)
      newErrors.File = "Template dokumen wajib diunggah.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("File", form.File);
      formData.append("Modul", "Dokumen");

      const uploadRes = await fetch("/api/dokumen/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (uploadData.error) throw new Error(uploadData.message);

      const saveData = await fetchClient(
        "/api/dokumen/create",
        {
          NamaDokumen: form.NamaDokumen,
          Deskripsi: "",
          PathLink: "",
          PathDokumen: uploadData.fileName,
          Status: "Aktif",
          Jenis: form.Jenis,
          Bagian: form.Bagian || null,
        },
        "POST",
      );

      if (saveData.error) throw new Error(saveData.message);

      Toast.success("Data template dokumen berhasil disimpan.");
      router.push("/pages/dokumen");
    } catch (err) {
      Toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [form, router]);

  const handleBack = useCallback(() => {
    router.push("/pages/dokumen");
  }, [router]);

  return (
    <PermissionGuard requiredModule="dokumen">
      <MainContent
        layout="Admin"
        loading={loading}
        title="Template Dokumen"
        breadcrumb={[
          { label: "Beranda", href: "/pages/beranda" },
          { label: "Data" },
          { label: "Template Dokumen", href: "/pages/dokumen" },
          { label: "Tambah" },
        ]}
      >
        <Card title="Tambah Data Template Dokumen">
          <div className="row">
            <div className="col-12 col-md-6">
              <Input
                label="Nama Template Dokumen"
                name="NamaDokumen"
                value={form.NamaDokumen}
                onChange={handleChange}
                placeholder="Masukkan nama dokumen"
                required
                error={errors.NamaDokumen}
                maxLength={30}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-12 col-md-6">
              <DropDown
                label="Jenis"
                forInput="Jenis"
                name="Jenis"
                arrData={JENIS_OPTIONS}
                value={form.Jenis}
                onChange={handleChange}
                type="pilih"
                isRequired
                errorMessage={errors.Jenis}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-12 col-md-6">
              <DropDown
                label="Bagian"
                forInput="Bagian"
                name="Bagian"
                arrData={BAGIAN_OPTIONS}
                value={form.Bagian}
                onChange={handleChange}
                type="pilih"
                isRequired
                errorMessage={errors.Bagian}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-12 col-md-6">
              <div className="mb-2">
                <Label
                  text="Template Dokumen"
                  htmlFor="FileDokumen"
                  required
                />
                <input
                  type="file"
                  id="FileDokumen"
                  name="FileDokumen"
                  className={`form-control rounded-5 ${errors.File ? "is-invalid" : ""}`}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.xlsx"
                />
                {form.File && (
                  <div className="mt-1 small text-muted">
                    Unggah ulang jika ingin mengganti berkas yang sudah ada
                  </div>
                )}
                {errors.File && (
                  <div className="invalid-feedback d-block">
                    {errors.File}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="d-flex gap-2 mt-3">
          <Button
            classType="secondary"
            iconName="arrow-left"
            label="Kembali"
            onClick={handleBack}
            isDisabled={loading}
          />
          <Button
            classType="primary"
            iconName="save"
            label="Simpan"
            onClick={handleSubmit}
            isDisabled={loading}
          />
        </div>
      </MainContent>
    </PermissionGuard>
  );
}