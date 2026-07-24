  "use client";

  import { useEffect, useState, useCallback } from "react";
  import { useParams, useRouter } from "next/navigation";
  import PropTypes from "prop-types";
  import Button from "@/components/common/Button";
  import MainContent from "@/components/layout/MainContent";
  import Toast from "@/components/common/Toast";
  import DateFormatter from "@/lib/dateFormater";
  import fetchClient from "@/lib/fetchClient";
  import { useUser } from "@/context/UserContext";
  import PermissionGuard from "@/components/PermissionGuard";

  const DetailItem = ({ label, value }) => (
    <div className="col-lg-6 mb-3">
      <div className="detail-item">
        <small className="text-muted d-block mb-1">
          <strong>{label}</strong>
        </small>
        {value !== null &&
        value !== undefined &&
        value !== ""
          ? value
          : "-"}
      </div>
    </div>
  );

  DetailItem.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.node,
  };

  export default function DetailLogBeritaPage() {
    const path = useParams();
    const router = useRouter();

    const id = path.id;

    const { ssoData } = useUser();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
      if (!id) {
        Toast.error("ID transaksi tidak valid.");
        router.back();
        return;
      }

      try {
        setLoading(true);

        const response = await fetchClient(
          `/api/berita-log/detail?id=${id}`,
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
        globalThis.location.href =
          "/auth/login";
        return;
      }

      loadData();
    }, [ssoData, loadData]);

    const handleBack = useCallback(() => {
      router.push("/pages/berita-page");
    }, [router]);

    return (
      <PermissionGuard requiredModule="berita">
        <MainContent
          layout="Admin"
          loading={loading}
          title="Detail Transaksi Berita"
          breadcrumb={[
            {
              label: "Beranda",
              href: "/",
            },
            {
              label: "Berita",
              href: "/pages/berita-page",
            },
            {
              label: "Detail Transaksi",
            },
          ]}
        >
          <div className="card border-0 shadow-lg">
            <div className="card-body p-4">
              {data && (
                <>
                  <h5 className="text-primary mb-3 pb-2 border-bottom">
                    Informasi Transaksi Berita
                  </h5>

                  <div className="row">

                    <DetailItem
                      label="Judul Berita"
                      value={
                        data.brtJudul ??
                        data.BrtJudul
                      }
                    />

                    <DetailItem
                      label="Keterangan"
                      value={
                        data.bclKeterangan ??
                        data.BclKeterangan
                      }
                    />

                    <DetailItem
                      label="User Pengirim"
                      value={
                        data.bclUserPengirim ??
                        data.BclUserPengirim
                      }
                    />

                    <DetailItem
                      label="User Penerima"
                      value={
                        data.bclUserPenerima ??
                        data.BclUserPenerima
                      }
                    />

                    <DetailItem
                      label="Tanggal Kirim"
                      value={
                        data.bclTanggalKirim ||
                        data.BclTanggalKirim
                          ? DateFormatter.formatDateLong(
                              data.bclTanggalKirim ??
                                data.BclTanggalKirim
                            )
                          : "-"
                      }
                    />
                  </div>
                </>
              )}

              <div className="row mt-4">
                <div className="col-12">
                  <div className="d-flex justify-content-end">
                    <Button
                      classType="secondary"
                      label="Kembali"
                      onClick={handleBack}
                      type="button"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MainContent>
      </PermissionGuard>
    );
  }