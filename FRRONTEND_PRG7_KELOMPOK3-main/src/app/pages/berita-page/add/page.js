"use client";

import { useState, useCallback } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import MainContent from "@/components/layout/MainContent";
import Calendar from "@/components/common/Calendar";
import Toast from "@/components/common/Toast";
import DateFormatter from "@/lib/dateFormater";
import { useRouter } from "next/navigation";
import PermissionGuard from "@/components/PermissionGuard";
import Editor from "@/components/common/Editor";
import DropDown from "@/components/common/Dropdown";

const JENIS_OPTIONS = [
   { Value: "Informasi", Text: "Informasi" },
  { Value: "Panduan", Text: "Panduan" },
  { Value: "Penelitian", Text: "Penelitian" },
  { Value: "Publikasi Ilmiah", Text: "Publikasi Ilmiah" },
  { Value: "Sneemo", Text: "Sneemo" },
  { Value: "Technologic", Text: "Technologic" },
  { Value: "Astratech Conference", Text: "Astratech Conference" },
];



const maxLengthRules = {
  judul: 50,
  deskripsi: 100,
};

export default function AddBeritaPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    konten: null,
    tanggal: "",
    jenis: "",
    banner: "0",
    penerima: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,

        ...(name === "jenis" && value !== "Informasi"
          ? { penerima: "" }
          : {}),
      }));

      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [],
  );

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        konten: reader.result, // base64
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleBannerChange = useCallback((e) => {
    const { checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      banner: checked ? "1" : "0",
    }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.judul?.trim()) {
      newErrors.judul = "Judul wajib diisi";
    }

    if (!formData.deskripsi?.trim()) {
      newErrors.deskripsi = "Deskripsi wajib diisi";
    }

    if (!formData.konten) {
      newErrors.konten = "Konten wajib diisi";
    }

    if (!formData.tanggal) {
      newErrors.tanggal = "Tanggal wajib diisi";
    }

    if (!formData.jenis) {
      newErrors.jenis = "Jenis wajib dipilih";
    }

    if (formData.jenis === "Informasi" && !formData.penerima?.trim()) {
      newErrors.penerima = "Penerima wajib diisi untuk jenis Informasi";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        Toast.error("Mohon lengkapi semua field yang wajib diisi.");
        return;
      }

      try {
        setLoading(true);

        const response = await fetch("/api/berita/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            judul: formData.judul,
            deskripsi: stripHtml(formData.deskripsi),
            tanggal: formData.tanggal,
            jenis: formData.jenis,
            penerima: formData.penerima,
            banner: formData.banner,
            konten: formData.konten,
            
          }),
        });

        const result = await response.json();

        if (result?.error) throw new Error(result.message);

        Toast.success("Data berita berhasil ditambahkan.");
        router.push("/pages/berita-page");
      } catch (error) {
        Toast.error(error.message);
      } finally {
        setLoading(false);
      }
    },
    [formData, router, validateForm],
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <PermissionGuard requiredModule="berita">
      <MainContent
        layout="Admin"
        loading={loading}
        title="Berita"
        breadcrumb={[
          { label: "Beranda", href: "/" },
          {
            label: "Berita",
            href: "/pages/menu-berita/berita-page",
          },
          { label: "Tambah" },
        ]}
      >
        <div className="card border-0 shadow-lg">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-lg-5">
                  <Input
                    label="Judul Berita"
                    name="judul"
                    id="judul"
                    value={formData.judul}
                    onChange={handleChange}
                    error={errors.judul}
                    maxLength={maxLengthRules.judul}
                    required
                  />
                </div>

                <div className="col-lg-3">
                  <Calendar
                    label="Tanggal Berita"
                    type="single"
                    value={
                      formData.tanggal
                        ? new Date(formData.tanggal)
                        : null
                    }
                    onChange={(date) => {
                      handleChange({
                        target: {
                          name: "tanggal",
                          value: date
                            ? DateFormatter.formatDateForInput(date)
                            : "",
                        },
                      });
                    }}
                    onKeyDown={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onFocus={(e) => e.target.readOnly = true}
                    error={errors.tanggal}
                    required
                  />
                </div>
                
                <div className="col-lg-2">
                  <DropDown
                    label="Jenis Berita"
                    forInput="jenis"
                    name="jenis"
                    arrData={JENIS_OPTIONS}
                    value={formData.jenis}
                    onChange={handleChange}
                    type="pilih"
                    isRequired
                    errorMessage={errors.jenis}
                  />
                </div>

                <div className="col-lg-3">
                  <Input
                    label="Penerima"
                    name="penerima"
                    id="penerima"
                    value={formData.penerima}
                    onChange={handleChange}
                    error={errors.penerima}
                    disabled={formData.jenis !== "Informasi"}
                    required={formData.jenis === "Informasi"}
                  />
                </div>

                <div className="col-lg-2 d-flex align-items-end">
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="banner"
                      name="banner"
                      checked={formData.banner === "1"}
                      onChange={handleBannerChange}
                    />
                    <label className="form-check-label" htmlFor="banner">
                      Jadikan Banner / tidak
                    </label>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <Editor
                    label="Deskripsi  "
                    name="deskripsi"
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleChange}
                    error={errors.deskripsi}
                   
                    required
                  />
                </div>
              </div>

              <div className="row mt-3">
                <div className="mb-3">
      
                  <Input
                    type="file"
                    name="Konten"
                    label="Konten / gambar"
                    
                    className={`form-control ${
                      errors.konten ? "is-invalid" : ""
                    }`}
                    accept="image/*"
                    onChange={handleImageChange}
                    required  
                  />

                  {errors.konten && (
                    <div className="invalid-feedback">
                      {errors.konten}
                    </div>
                  )}
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-12">
                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      classType="secondary"
                      label="Batal"
                      type="button"
                      onClick={handleCancel}
                      isDisabled={loading}
                    />

                    <Button
                      classType="primary"
                      iconName={loading ? "" : "save"}
                      label={loading ? "Menyimpan..." : "Simpan"}
                      type="submit"
                      isDisabled={loading}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </MainContent>
    </PermissionGuard>
  );
}

