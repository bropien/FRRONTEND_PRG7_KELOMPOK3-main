"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LandingLayout from "@/components/layout/Landing";
import Table from "@/components/common/Table";

export default function LandingBeritaPage() {
  const router = useRouter();

  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBerita();
  }, []);

  const getBerita = async () => {
    try {
      const response = await fetch("/api/landing/berita-list");
      const result = await response.json();
      setBerita(result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Transform data untuk table
  const transformedData = berita.map((item) => ({
    id: item.id,
    No: berita.indexOf(item) + 1,
    Judul: item.judul,
    Tanggal: formatDate(item.created_at || item.tanggal || item.date),
    Aksi: ["Detail"]
  }));

  const handleDetail = (id) => {
    router.push(`/pages/landing-page/detail-berita/${id}`);
  };

  return (
    <LandingLayout>
      <div className="container py-5">
        <h1
          className="mb-4"
          style={{
            color: "#0B5AA7",
            fontWeight: "700"
          }}
        >
          Berita
        </h1>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" aria-label="Loading">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <Table
            data={transformedData}
            size="Normal"
            enableCheckbox={false}
            onDetail={handleDetail}
            config={{
              widths: {
                No: "5%",
                Judul: "50%",
                Tanggal: "20%",
                Aksi: "10%"
              },
              isWrap: {
                Judul: true
              }
            }}
          />
        )}
      </div>
    </LandingLayout>
  );
}