"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Calendar from "@/components/common/Calendar";
import MainContent from "@/components/layout/MainContent";
import Toast from "@/components/common/Toast";
import fetchClient from "@/lib/fetchClient";
import DateFormatter from "@/lib/dateFormater";
import PermissionGuard from "@/components/PermissionGuard";
import Editor from "@/components/common/Editor";
import Dropdown from "@/components/common/Dropdown";

const JENIS_OPTIONS = [
   {Value: "Informasi", Text: "Informasi" },
  { Value: "Panduan", Text: "Panduan" },
  { Value: "Penelitian", Text: "Penelitian" },
  { Value: "Publikasi Ilmiah", Text: "Publikasi Ilmiah" },
  { Value: "Sneemo", Text: "Sneemo" },
  { Value: "Technologic", Text: "Technologic" },
  { Value: "Astratech Conference", Text: "Astratech Conference" },
];

const initialFormData = {
  id: 0,
  judul: "",
  deskripsi: "",
  konten: "",
  pathKonten:"",
  tanggal: "",
  jenis:"",
  penerima:"",
  banner: "0",
};

export default function EditBeritaPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialFormData);
  const [previewImage, setPreviewImage] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetchClient(
        `/api/berita/detail?id=${id}`,
        {},
        "GET"
      );

      if (response.error) {
        throw new Error(response.message);
      }

      const data = response.data || response;

      const preview =
        data.konten || data.Konten;

      const path =
        data.pathKonten ||
        data.PathKonten ||
        "";

      setFormData({
        id: data.id || data.Id,
        judul: data.judul || data.Judul,
        deskripsi: data.deskripsi || data.Deskripsi,
        konten: null,
        pathKonten: path,
        tanggal: data.tanggal || data.Tanggal,
        jenis: data.jenis || data.Jenis,
        penerima: data.penerima || data.Penerima || "",
        banner: data.banner || data.Banner || "0",
      });

      setPreviewImage(preview);
    } catch (err) {
      Toast.error(err.message);
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const handleBannerChange = useCallback((e) => {
    const { checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      banner: checked ? "1" : "0",
    }));
  }, []);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

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
    [errors]
  );

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        konten: reader.result,
      }));

      setPreviewImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.judul?.trim()) {
      newErrors.judul = "Judul wajib diisi";
    }

    if (!formData.deskripsi?.trim()) {
      newErrors.deskripsi = "Deskripsi wajib diisi";
    }

    if (!formData.konten && !previewImage) {
      newErrors.konten = "Konten wajib diisi";
    }

    if (!formData.tanggal) {
      newErrors.tanggal = "Tanggal wajib diisi";
    }

    if (!formData.jenis?.trim()) {
      newErrors.jenis = "Jenis wajib diisi";
    }

    if (
      formData.jenis === "Informasi" &&
      !formData.penerima?.trim()
    ) {
      newErrors.penerima = "Penerima wajib diisi untuk jenis Informasi";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html || "", "text/html");
    return doc.body.textContent || "";
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        Toast.error("Mohon lengkapi seluruh data.");
        return;
      }

      try {
        setLoading(true);

        const form = new FormData();

        form.append("Id", formData.id);
        form.append("Judul", formData.judul);
        form.append("Deskripsi", formData.deskripsi);
        form.append("Tanggal", formData.tanggal);
        form.append("Jenis", formData.jenis);

        if (formData.konten instanceof File) {
          form.append("Konten", formData.konten);
        }

        const response = await fetch("/api/berita/edit", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: formData.id,
            judul: formData.judul,
            deskripsi: stripHtml(formData.deskripsi),
            tanggal: formData.tanggal,
            jenis: formData.jenis,
             penerima: formData.penerima,
            banner: formData.banner,
            konten: formData.konten || formData.pathKonten ,
          }),
        });


      const result = await response.json();

        if (!response.ok || result.error) {
          throw new Error(result.message || "Gagal memperbarui berita");
        }

        Toast.success(
          result.message || "Data berita berhasil diperbarui dan menjadi status draft yg memerlukan persetujuan ulang."
        );

        router.push("/pages/berita-page");
      } catch (err) {
        Toast.error(err.message);
      } finally {
        setLoading(false);
      }
    },
    [formData, validateForm, router]
  );

  const handleCancel = () => {
    router.back();
  };

  return (
    <PermissionGuard requiredModule="berita">
      <MainContent
        layout="Admin"
        loading={loading}
        title="Ubah Berita"
        breadcrumb={[
          { label: "Beranda", href: "/pages/beranda" },
          { label: "Berita", href: "/pages/berita-page" },
          { label: "Ubah" },
        ]}
      >
        <div className="card border-0 shadow">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-12">
                  <Input
                    label="Judul"
                    name="judul"
                    value={formData.judul}
                    onChange={handleChange}
                    error={errors.judul}
                    required
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="row">
                    <div className="col-md-6">
                      <Calendar
                        label="Tanggal"
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

                    <div className="col-md-6">
                      <Dropdown
                        label="Jenis Berita"
                        forInput="jenis"
                        value={formData.jenis}
                        onChange={handleChange}
                        arrData={JENIS_OPTIONS}
                        errorMessage={errors.jenis}
                        isRequired={true}
                      />
                    </div>

                    <div className="col-md-6 mt-3">
                      <Input
                        label="Penerima"
                        name="penerima"
                        value={formData.penerima}
                        onChange={handleChange}
                        error={errors.penerima}
                        disabled={formData.jenis !== "Informasi"}
                        required={formData.jenis === "Informasi"}
                        placeholder={
                          formData.jenis === "Informasi"
                            ? "Masukkan penerima informasi"
                            : "Tidak tersedia"
                        }
                      />
                    </div>

                    <div className="row mt-3">
                      <div className="col-md-12">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="banner"
                            name="banner"
                            checked={formData.banner === "1"}
                            onChange={handleBannerChange}
                          />
                          <label className="form-check-label" htmlFor="banner">
                            Jadikan Banner
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                
              </div>

              <div className="row">
                <div className="col-md-12">
                  <Editor
                    label="Deskripsi"
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleChange}
                    error={errors.deskripsi}
                    required
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-md-12">

                  <Input
                    type="file"
                    name="konten"
                    label="Konten / Gambar"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={`form-control ${
                      errors.konten ? "is-invalid" : ""
                    }`}
                  />

                  

                  {previewImage && (
                    <div className="mt-3">
                      <img
                        src={previewImage}
                        alt="Preview"
                        style={{
                          maxWidth: "300px",
                          maxHeight: "250px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                        }}
                      />
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
                      label={loading ? "Menyimpan..." : "Simpan"}
                      iconName={loading ? "" : "save"}
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