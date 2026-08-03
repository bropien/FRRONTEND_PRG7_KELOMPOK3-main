"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import PropTypes from "prop-types";
import Button from "@/components/common/Button";
import MainContent from "@/components/layout/MainContent";
import Toast from "@/components/common/Toast";
import DateFormatter from "@/lib/dateFormater";
import Badge from "@/components/common/Badge";
import fetchClient from "@/lib/fetchClient";
import { useUser } from "@/context/UserContext";
import PermissionGuard from "@/components/PermissionGuard";

const DetailItem = ({ label, value }) => (
  <div className="col-lg-6 mb-3">
    <div className="detail-item">
      <small className="text-muted d-block mb-1">
        <strong>{label}</strong>
      </small>
      {value !== null && value !== undefined && value !== "" ? value : "-"}
    </div>
  </div>
);

DetailItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

export default function DetailBeritaPage() {
  const path = useParams();
  const router = useRouter();

  const id = path.id;

  const { ssoData } = useUser();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasEditAccess, setHasEditAccess] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) {
      Toast.error("ID berita tidak valid.");
      router.back();
      return;
    }

    setLoading(true);

    try {
      const response = await fetchClient(
        `/api/berita/detail?id=${id}`,
        {},
        "GET"
      );

      if (response.error) {
        throw new Error(response.message);
      }

      setData(response.data);
    } catch (err) {
      Toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!ssoData) {
      globalThis.location.href = "/auth/login";
      return;
    }

    const permsStr = localStorage.getItem("permissionData");

    if (permsStr) {
      try {
        const permsArray = JSON.parse(permsStr);
        setHasEditAccess(permsArray.includes("berita.edit"));
      } catch {
        Toast.error("Gagal mendapatkan hak akses.");
      }
    }

    loadData();
  }, [ssoData, loadData]);

  const handleEdit = useCallback(() => {
    router.push(`/pages/berita-page/edit/${id}`);
  }, [router, id]);

  const handleBack = useCallback(() => {
    router.push("/pages/berita-page");
  }, [router]);

  const renderBannerBadge = (bannerValue) => {
    if (bannerValue === "1" || bannerValue === 1 || bannerValue === true) {
      return <Badge status="success">Ya</Badge>;
    } else if (bannerValue === "0" || bannerValue === 0 || bannerValue === false) {
      return <Badge status="secondary">Tidak</Badge>;
    }
    return "-";
  };

  return (
    <PermissionGuard requiredModule="berita">
      <MainContent
        layout="Admin"
        loading={loading}
        title="Detail Berita"
        breadcrumb={[
          { label: "Beranda", href: "/" },
          {
            label: "Berita",
            href: "/pages/berita",
          },
          { label: "Detail" },
        ]}
      >
        <div className="card border-0 shadow-lg">
          <div className="card-body p-4">
            {data && (
              <div>
                <div className="mb-4">
                  <h5 className="text-primary mb-3 pb-2 border-bottom">
                    Informasi Berita
                  </h5>

                  <div className="row">
                    <DetailItem
                      label="Judul"
                      value={data.judul}
                    />

                    <DetailItem
                      label="Tanggal"
                      value={
                        data.tanggal
                          ? DateFormatter.formatDateLong(data.tanggal)
                          : "-"
                      }
                    />

                    <DetailItem
                      label="Jenis"
                      value={data.jenis}
                    />
                    {data.jenis === "Informasi" && (
                      <DetailItem
                        label="Penerima"
                        value={data.penerima}
                      />
                    )}

                    <DetailItem
                      label="Banner"
                      value={renderBannerBadge(data.banner)}
                    />

                    <DetailItem
                      label="Status"
                      value={<Badge status={data.status} />}
                    />

                    <div className="col-12 mb-3">
                      <small className="text-muted d-block mb-1">
                        <strong>Deskripsi</strong>
                      </small>

                      <div
                        className="border rounded p-3"
                        dangerouslySetInnerHTML={{
                          __html: data.deskripsi || "-",
                        }}
                      />
                    </div>

                    <div className="col-12 mb-3">
                      <small className="text-muted d-block mb-1">
                        <strong>Konten</strong>
                      </small>

                      <div className="border rounded p-3 text-center">
                        {data.konten ? (
                          data.konten.startsWith("data:image") ? (
                            <img
                              src={data.konten}
                              alt={data.judul}
                              className="img-fluid rounded"
                              style={{
                                maxHeight: "500px",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: data.konten,
                              }}
                            />
                          )
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="row mt-4">
              <div className="col-12">
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    classType="secondary"
                    label="Kembali"
                    onClick={handleBack}
                    type="button"
                  />

                  {hasEditAccess && (
                    <Button
                      classType="primary"
                      iconName="pencil"
                      label="Edit"
                      onClick={handleEdit}
                      type="button"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainContent>
    </PermissionGuard>
  );
}