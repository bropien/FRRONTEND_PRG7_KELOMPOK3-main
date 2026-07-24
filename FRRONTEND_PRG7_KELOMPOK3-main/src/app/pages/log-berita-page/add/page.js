"use client";

import { useState, useCallback, useEffect } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import MainContent from "@/components/layout/MainContent";
import Toast from "@/components/common/Toast";
import fetchClient from "@/lib/fetchClient";
import { useRouter } from "next/navigation";
import PermissionGuard from "@/components/PermissionGuard";
import DropDown from "@/components/common/Dropdown";

export default function AddTransaksiBeritaPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [listBerita, setListBerita] = useState([]);
  const beritaOptions = listBerita.map((item) => ({
    Value: item.brtId,
    Text: item.brtJudul,
  }));

  const [formData, setFormData] = useState({
    beritaId: "",
    keterangan: "",
    penerima: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.beritaId) {
      newErrors.brtId = "Judul Berita wajib diisi";
    }

    if (!formData.keterangan.trim()) {
      newErrors.keterangan = "Keterangan wajib diisi";
    }

    if (!formData.penerima.trim()) {
      newErrors.penerima = "User Penerima wajib diisi";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Toast.error("Mohon lengkapi seluruh data.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        beritaId: parseInt(formData.beritaId),
        keterangan: formData.keterangan,
        userPenerima: formData.penerima,
      };

      const response = await fetchClient(
        "/api/berita-log/create",
        payload,
        "POST"
      );

      if (response.error) {
        throw new Error(response.message);
      }

      Toast.success("Transaksi berita berhasil ditambahkan.");

      router.push("/pages/berita-page");
    } catch (error) {
      Toast.error(
        error.message ||
        "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  useEffect(() => {
    loadBerita();
  }, []);

  const loadBerita = async () => {
    try {
      const response = await fetchClient(
        "/api/berita/get-all",
        {
          PageNumber: 1,
          PageSize: 1000,
        },
        "GET"
      );

      console.log("DATA BERITA:", response);

      if (response.error) {
        throw new Error(response.message);
      }

      const rawData =
        response.data || response.Data || [];

      console.log("RAW DATA:", rawData);

      const mapped = rawData.map((item) => ({
        brtId: item.id || item.Id,
        brtJudul: item.judul || item.Judul,
      }));

      setListBerita(mapped);
    } catch (error) {
      console.error(error);
      Toast.error("Gagal memuat data berita");
    }
  };


  return (
    <PermissionGuard requiredModule="berita">
      <MainContent
        layout="Admin"
        loading={loading}
        title="Tambah Transaksi Berita"
        breadcrumb={[
          { label: "Beranda", href: "/" },
          {
            label: "Berita",
            href: "/pages/berita-page",
          },
          { label: "Tambah Transaksi" },
        ]}
      >
        <div className="card border-0 shadow-lg">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row">

                <div className="col-lg-4">
                  <DropDown
                    label="Judul Berita"
                    name="beritaId"
                    value={formData.beritaId}
                    onChange={handleChange}
                    arrData={beritaOptions}
                    error={errors.beritaId}
                    isRequired
                  />
                </div>

                <div className="col-lg-9">
                  <Input
                    label="Keterangan"
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    error={errors.keterangan}
                    required
                  />
                </div>

              </div>

              <div className="row mt-3">

                <div className="col-lg-12">
                  <Input
                    label="User Penerima"
                    name="penerima"
                    value={formData.penerima}
                    onChange={handleChange}
                    error={errors.penerima}
                    required
                  />
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
                    />

                    <Button
                      classType="primary"
                      label={
                        loading
                          ? "Menyimpan..."
                          : "Simpan"
                      }
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