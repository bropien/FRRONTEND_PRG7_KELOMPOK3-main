"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Toast from "@/components/common/Toast";
import LandingLayout from "@/components/layout/Landing";
import Button from "@/components/common/Button";
import DateFormatter from "@/lib/dateFormater";
import PropTypes from "prop-types";

const InfoCard = ({ title, value }) => (
  <div className="border rounded-4 p-3 mb-3 bg-white shadow-sm">
    <small className="text-secondary d-block mb-1">
      {title}
    </small>

    <strong>{value || "-"}</strong>
  </div>
);

InfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.node,
};

export default function LandingDetailBeritaPage() {
  const { id } = useParams();

  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) {
      Toast.error("ID berita tidak valid");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/landing/detail-berita?id=${id}`,
        {
          cache: "no-store",
        }
      );

      const response = await res.json();

            const berita = {
        ...response.data,
        gambar: response.data.konten,
      };

      setData(berita);

      if (response.error) {
        throw new Error(
          response.message || "Gagal mengambil detail berita"
        );
      }

      setData(response.data);
    } catch (err) {
      console.error("Gagal memuat detail berita:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);


  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="container py-5">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-5">
        Berita tidak ditemukan.
      </div>
    );
  }
  
  let content;

  if (loading) {
    content = (
      <div className="text-center py-5">
        Loading...
      </div>
    );
  } else if (data === null) {
    content = (
      <div className="text-center py-5">
        Berita tidak ditemukan.
      </div>
    );
  } else {
    content = (
      <div className="row g-4">

        {/* Konten */}
        <div className="col-lg-8">
          <div className="card border-0 shadow rounded-4">
            <div className="card-body p-5">

              <h1
                className="fw-bold mb-3"
                style={{ color: "#0B5AA7" }}
              >
                {data.judul}
              </h1>

              <p className="text-muted mb-4">
                {DateFormatter.formatDateLong(data.tanggal)}
              </p>

              {data.konten && (
                <img
                  src={data.konten}
                  alt={data.judul}
                  className="img-fluid rounded-4 w-100 mb-4"
                />
              )}

              <hr />

              <div
                className="mb-4"
                dangerouslySetInnerHTML={{
                  __html: data.deskripsi || "-",
                }}
              />

            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card border-0 shadow rounded-4">
            <div className="card-body">

              <h5
                className="fw-bold mb-4"
                style={{ color: "#0B5AA7" }}
              >
                Informasi
              </h5>

              <InfoCard
                title="Judul"
                value={data.judul}
              />

              <InfoCard
                title="Tanggal"
                value={DateFormatter.formatDateLong(data.tanggal)}
              />

              <InfoCard
                title="Jenis"
                value={data.jenis}
              />

            </div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <LandingLayout>
      <section
        style={{
          background: "#F5F5F5",
          minHeight: "100vh",
          paddingTop: "120px",
          paddingBottom: "80px",
        }}
      >
        <div className="container">

          <div className="mb-4">
            <Button
              classType="secondary"
              label="← Kembali"
              onClick={() => router.back()}
            />
          </div>

          {content}

        </div>
      </section>
    </LandingLayout>
  );
}