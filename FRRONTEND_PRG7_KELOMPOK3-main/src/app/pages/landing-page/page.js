"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingLayout from "@/components/layout/Landing";
import Img from "@/components/common/Img";
import "./style.css";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

export default function LandingPage() {
  const router = useRouter();
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [beritaData, setBeritaData] = useState([]);
  const [dashboard, setDashboard] = useState({
      totalPengabdian:0,
      totalPenelitian:0,
      chartPengabdian:[],
      chartPenelitian:[]
  });
  const [showLP2M, setShowLP2M] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);

  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, clientWidth } = scrollContainerRef.current;

    setActiveIndex(Math.round(scrollLeft / clientWidth));
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const width = container.clientWidth;

    container.scrollTo({
      left:
        activeIndex <= 0
          ? width * (beritaData.length - 1)
          : container.scrollLeft - width,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const width = container.clientWidth;

    container.scrollTo({
      left:
        activeIndex >= beritaData.length - 1
          ? 0
          : container.scrollLeft + width,
      behavior: "smooth",
    });
  };

  // CHART OPTIONS - Sama seperti dashboard admin
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  // PERBAIKAN: Tambahkan optional chaining untuk menghindari error
  const pengabdianChart = {
      labels: (dashboard.chartPengabdian || []).map(x => x.namaBulan),
      datasets:[
          {
              label:"Pengabdian",
              data: (dashboard.chartPengabdian || []).map(x => x.total),
              backgroundColor: "#6f42c1",
              borderRadius: 6,
          }
      ]
  };
  
  const penelitianChart = {
    labels: (dashboard.chartPenelitian || []).map(x => x.namaBulan),
    datasets: [
      {
        label: "Penelitian",
        data: (dashboard.chartPenelitian || []).map(x => x.total),
        backgroundColor: "#0d6efd",
        borderRadius: 6,
      },
    ],
  };

  // Fungsi scroll ke index tertentu (untuk dot indicator)
  const scrollToIndex = (index) => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: containerWidth * index,
        behavior: "smooth"
      });
      setActiveIndex(index);
    }
  };

  const getDashboard = async () => {
    try {
      const res = await fetch("/api/landing/perbandingan");

      const result = await res.json();

      if (!result.error) {
        setDashboard(result.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // PIE CHART dengan warna yang lebih baik
  const pieData = {
      labels:["Pengabdian","Penelitian"],
      datasets:[
          {
              data:[
                  dashboard.totalPengabdian || 0,
                  dashboard.totalPenelitian || 0
              ],
              backgroundColor: [
                  "#6f42c1",
                  "#0d6efd"
              ],
              borderWidth: 2,
              borderColor: '#ffffff',
          }
      ]
  };

  // Handle scroll untuk menampilkan/menyembunyikan elemen
  useEffect(() => {
    const handleScroll = () => {
      const beritaSection = document.getElementById('berita');
      const lp2mSection = document.getElementById('home');
      const diagramSection = document.getElementById('diagram');

      // Handle LP2M
      if (beritaSection && lp2mSection) {
        
        const lp2mRect = lp2mSection.getBoundingClientRect();

        const isLp2mVisible = lp2mRect.top < window.innerHeight && lp2mRect.bottom > 0;

        if (isLp2mVisible || lp2mRect.top < 0) {
          setShowLP2M(true);
        } else {
          setShowLP2M(false);
        }
      }

      // Handle Diagram
      if (diagramSection) {
        const diagramRect = diagramSection.getBoundingClientRect();
        const isDiagramVisible = diagramRect.top < window.innerHeight && diagramRect.bottom > 0;

        if (isDiagramVisible || diagramRect.top < 0) {
          setShowDiagram(true);
        } else {
          setShowDiagram(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    container.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    checkScrollPosition();

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, []);

  useEffect(() => {
    getBeritaTerbaru();
    getDashboard();

    const interval = setInterval(() => {
      getBeritaTerbaru();
      getDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getBeritaTerbaru = async () => {
    try {

      const response = await fetch(
        "/api/landing/berita"
      );

      const result = await response.json();

      const beritaTerbaru = (result.data || [])
        .sort(
          (a, b) =>
            new Date(b.tanggal) - new Date(a.tanggal)
        )
        .slice(0, 6)
        .map((item) => ({
          ...item,
          gambar: item.konten,
        }));

      setBeritaData(beritaTerbaru);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDetailBerita = (encryptedId) => {
    router.push(`/pages/landing-page/detail-berita/${encryptedId}`);
  };

  return (
    <LandingLayout>

      {/* ================================================= */}
      {/* BERITA (HORIZONTAL SCROLLING WITH SIDE BUTTONS) */}
      {/* ================================================= */}
      <section
        id="berita"
        style={{
          height: "100vh",
          backgroundColor: "#000",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Tombol kiri */}
          <button
            onClick={scrollLeft}
            style={{
              position: "absolute",
              left: "25px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              width: "55px",
              height: "55px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,.25)",
              color: "#fff",
              backdropFilter: "blur(6px)",
            }}
          >
            <i className="bi bi-chevron-left fs-3"></i>
          </button>

        {/* Tombol kanan */}

          <button
            onClick={scrollRight}
            style={{
              position: "absolute",
              right: "25px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              width: "55px",
              height: "55px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,.25)",
              color: "#fff",
              backdropFilter: "blur(6px)",
            }}
          >
            <i className="bi bi-chevron-right fs-3"></i>
          </button>

        <div
          ref={scrollContainerRef}
          className="custom-scrollbar"
          style={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            width: "100%",
            height: "100%",
          }}
        >
          {beritaData.map((item) => (
            <div
              key={item.id}
              style={{
                minWidth: "100%",
                height: "100%",
                position: "relative",
                scrollSnapAlign: "start",
                cursor: "pointer",
              }}
            >
            {/* Background Image */}
            <Img
              src={item.konten}
              alt={item.judul}
              width={1920}
              height={1080}
              objectFit="cover"
              className="w-100 h-100"
            />

              {/* Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to right, rgba(0,0,0,.75), rgba(0,0,0,.2), rgba(0,0,0,.2))",
                }}
              />

              {/* Content */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "8%",
                  transform: "translateY(-50%)",
                  color: "#fff",
                  maxWidth: "700px",
                  zIndex: 10,
                }}
              >
                <h1
                  style={{
                    fontSize: "64px",
                    fontWeight: "700",
                    lineHeight: "1.15",
                    marginBottom: "25px",
                  }}
                >
                  {item.judul}
                </h1>

                <p
                  style={{
                    fontSize: "24px",
                    lineHeight: "1.8",
                    marginBottom: "35px",
                  }}
                >
                  {item.deskripsi}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDetailBerita(item.encryptedId);
                  }}
                  style={{
                    background: "#0B5AA7",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50px",
                    padding: "15px 40px",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                >
                  Baca Selengkapnya
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dot Indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "35px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "12px",
            zIndex: 30,
          }}
        >
          {beritaData.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => scrollToIndex(idx)}
              style={{
                width: activeIndex === idx ? "35px" : "10px",
                height: "10px",
                borderRadius: "20px",
                border: "none",
                background:
                  activeIndex === idx
                    ? "#fff"
                    : "rgba(255,255,255,.4)",
                transition: ".3s",
              }}
            />
          ))}
        </div>
      </section>

      {/* ================================================= */}
      {/* LP2M SECTION */}
      {/* ================================================= */}
      <section
        id="home"
        style={{
          minHeight: "100vh",
          backgroundColor: "#2C6AA0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 0",
          overflow: "hidden",
        }}
      >
        <div className="container">
          <div
            className="row align-items-center hero-section-card"
            style={{
              backgroundColor: "#F2F2F2",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              opacity: showLP2M ? 1 : 0,
              transform: showLP2M ? "translateX(0)" : "translateX(-100%)",
              pointerEvents: showLP2M ? "auto" : "none",
            }}
          >
            {/* IMAGE */}
            <div className="col-lg-4 text-center">
              <Img
                src="/images/model.png"
                alt="Dashboard LP2M"
                width={500}
                height={500}
                objectFit="contain"
                className="hero-model"
              />
            </div>

            {/* TEXT */}
            <div className="col-lg-8 p-5">
              <h1
                className="fw-bold"
                style={{
                  fontSize: "80px",
                  color: "#0B5AA7",
                  textShadow: "4px 4px 6px rgba(0,0,0,0.25)",
                  lineHeight: "90px",
                }}
              >
                LP2M
                <br />
                Politeknik Astra
              </h1>

              <p
                style={{
                  fontSize: "30px",
                  color: "#2D5F8B",
                  maxWidth: "700px",
                }}
              >
                Lembaga Penelitian dan Pengabdian Kepada Masyarakat
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* DATA & DIAGRAM - Pie di kiri, Bar Charts vertikal di kanan */}
      {/* ================================================= */}
      <section
        id="diagram"
        style={{
          minHeight: "100vh",
          backgroundColor: "#F5F5F5",
          padding: "100px 0",
          overflow: "hidden",
        }}
      >
        <div className="container">
          <h1
            className="text-center fw-bold mb-5"
            style={{
              color: "#0B5AA7",
              fontSize: "55px",
              transition: "all 0.6s ease",
              opacity: showDiagram ? 1 : 0,
              transform: showDiagram ? "translateY(0)" : "translateY(-30px)",
            }}
          >
            DATA PENELITIAN & PENGABDIAN
          </h1>

          <div className="row g-4">
            {/* KOLOM KIRI - PIE CHART */}
            <div className="col-lg-4">
              <div
                className="bg-white rounded-5 shadow p-4 h-100"
                style={{
                  transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  opacity: showDiagram ? 1 : 0,
                  transform: showDiagram ? "translateX(0)" : "translateX(-100%)",
                }}
              >
                <h4 className="fw-bold mb-4 text-center">Data Persentase</h4>
                <div style={{ height: "250px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Pie 
                    data={pieData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                              size: 14,
                              weight: 'bold'
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="d-flex flex-column gap-4">
                {/* GRAFIK PENGABDIAN */}
                <div
                  className="bg-white rounded-5 shadow p-4"
                  style={{
                    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    opacity: showDiagram ? 1 : 0,
                    transform: showDiagram ? "translateX(0)" : "translateX(100%)",
                  }}
                >
                  <h6 className="fw-bold mb-3 text-center">Grafik Pengabdian</h6>
                  <div style={{ height: "280px" }}>
                    <Bar
                      data={pengabdianChart}
                      options={chartOptions}
                    />
                  </div>
                </div>

                {/* GRAFIK PENELITIAN */}
                <div
                  className="bg-white rounded-5 shadow p-4"
                  style={{
                    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    opacity: showDiagram ? 1 : 0,
                    transform: showDiagram ? "translateX(0)" : "translateX(100%)",
                  }}
                >
                  <h6 className="fw-bold mb-3 text-center">Grafik Penelitian</h6>
                  <div style={{ height: "280px" }}>
                    <Bar
                      data={penelitianChart}
                      options={chartOptions}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* VISI MISI */}
      {/* ================================================= */}
      <section
        id="visi-misi"
        style={{
          minHeight: "100vh",
          backgroundColor: "#0B5AA7",
          padding: "100px 0",
        }}
      >
        <div className="container">
          {/* VISI */}
          <div className="row justify-content-end mb-5">
            <div className="col-lg-8">
              <div
                className="rounded-5 shadow p-5"
                style={{
                  backgroundColor: "#F5F5F5",
                  color: "#0B5AA7",
                }}
              >
                <h1
                  className="fw-bold text-center mb-4"
                  style={{
                    fontSize: "60px",
                  }}
                >
                  Visi
                </h1>
                <p
                  className="text-center"
                  style={{
                    fontSize: "28px",
                  }}
                >
                  Menjadi pusat penelitian unggulan yang inovatif dan
                  berdaya saing global.
                </p>
              </div>
            </div>
          </div>

          {/* MISI */}
          <div className="row justify-content-start">
            <div className="col-lg-8">
              <div
                className="rounded-5 shadow p-5"
                style={{
                  backgroundColor: "#F5F5F5",
                  color: "#0B5AA7",
                }}
              >
                <h1
                  className="fw-bold text-center mb-4"
                  style={{
                    fontSize: "60px",
                  }}
                >
                  Misi
                </h1>
                <p
                  className="text-center"
                  style={{
                    fontSize: "28px",
                  }}
                >
                  Mengembangkan budaya penelitian dan pengabdian yang
                  profesional serta memberikan kontribusi nyata kepada
                  masyarakat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.6);
          border-radius: 10px;
        }
      `}</style>
    </LandingLayout>
  );
}