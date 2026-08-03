"use client";

import PropTypes from "prop-types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import { useEffect, useState, useRef } from "react";

export default function LandingLayout({ children }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const router = useRouter();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // ================= CLOSE DROPDOWN WHEN CLICK OUTSIDE =================
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
      
      // Close mobile menu when clicking outside
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('.hamburger-button')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

    const footerMenuStyle = {
      background: "transparent",
      border: "none",
      color: "white",
      textAlign: "left",
      padding: 0,
      fontSize: "14px",
      cursor: "pointer",
      opacity: 0.9,
      transition: "0.2s",
    };


  // ================= MENU URL =================
  const menuItems = [
    {
      name: "Home",
      url: "/",
    },
    {
      name: "Perpus",
      url: "https://library.polytechnic.astra.ac.id/",
      external: true,
    },

    {
      name: "Penelitian",
      url: "/pages/landing-page/penelitian",
    },

    {
      name: "Pengabdian",
      url: "/pages/landing-page/pengabdian",
    },

    {
      name: "Produk Terapan",
      url: "/produk-terapan",
    },
    { 
      name: "Inovasi",
      url: "/inovasi",
    },

    // ================= INFORMASI DROPDOWN =================
    {
      name: "Informasi",
      dropdown: [
        {
          label: "Berita",
          url: "/pages/landing-page/berita",
        },
        {
          label: "Panduan",
          url: "/pages/landing-page/panduan",
        },
        {
          label: "Dokumen Template",
          url: "/pages/landing-page/dokumen-template",
        },
      ],
    },
  ];

  // ================= HANDLE NAVIGATION =================
  const handleNavigation = (item) => {
    if (item.external) {
      window.open(item.url, "_blank");
    } else {
      router.push(item.url);
    }
    setIsMobileMenuOpen(false);
  };

  // ================= HANDLE DROPDOWN =================
  const handleDropdownClick = (menuName) => {
    if (openDropdown === menuName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(menuName);
    }
  };

  // ================= TOGGLE MOBILE MENU =================
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setOpenDropdown(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F5F5",
      }}
    >
      {/* ================= TOPBAR / NAVBAR ================= */}
      <header
        className={`fixed-top ${isScrolled ? "shadow-lg" : ""}`}
        style={{
          backgroundColor: "#0D5AA7",
          height: "75px",
          zIndex: 9999,
          transition: "all 0.3s ease",
        }}
      >
        <div className="container-fluid h-100">
          <div className="d-flex align-items-center justify-content-between h-100 px-3">

            {/* ================= LOGO ================= */}
            <button
              type="button"
              className="d-flex align-items-center gap-2"
              onClick={() => router.push("/")}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <Img
                src="/images/IMG_Logo.png"
                alt="Logo"
                width={150}
                height={100}
                objectFit="contain"
                lazy={false}
                style={{
                  filter: "brightness(0) invert(1)",
                }}
              />

              <div className="text-white">
                <h5
                  className="m-0 fw-bold"
                  style={{
                    fontSize: "20px",
                    lineHeight: "15px",
                  }}
                >
                  LP2M
                </h5>
              </div>
            </button>

            {/* ================= DESKTOP MENU ================= */}
            <nav 
            ref={dropdownRef} className="d-none d-lg-flex align-items-center gap-4">

              {menuItems.map((item) => {

                // ================= DROPDOWN MENU =================
                if (item.dropdown) {
                  return (
                    <div
                      key={item.name}
                      style={{
                        position: "relative",
                      }}
                    >

                      {/* BUTTON MENU */}
                      <button
                        onClick={() => handleDropdownClick(item.name)}
                        className="fw-semibold d-flex align-items-center gap-1"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "white",
                          fontSize: "15px",
                          cursor: "pointer",
                          transition: "0.2s",
                        }}
                        onMouseEnter={(e) => {
                          const arrow = e.currentTarget.querySelector(".dropdown-arrow");

                          e.currentTarget.style.opacity = "0.7";

                          if (arrow) {
                            arrow.style.opacity = "1";
                            arrow.style.transform = "translateY(0)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          const arrow = e.currentTarget.querySelector(".dropdown-arrow");

                          e.currentTarget.style.opacity = "1";

                          if (arrow) {  
                            arrow.style.opacity = "0";
                            arrow.style.transform = "translateY(-3px)";
                          }
                        }}
                      >
                        {item.name}

                        {/* ARROW */}
                        <span
                          className="dropdown-arrow"
                          style={{
                            opacity: 0,
                            transition: "all 0.2s ease",
                            transform: "translateY(-3px)",
                            fontSize: "12px",
                          }}
                        >
                          ▼
                        </span>
                      </button>

                      {/* DROPDOWN */}
                      {openDropdown === item.name && (
                        <div
                          style={{
                            position: "absolute",
                            top: "40px",
                            left: 0,
                            backgroundColor: "#0D5AA7",
                            minWidth: "260px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                            zIndex: 9999,
                          }}
                        >
                          {item.dropdown.map((subItem, subIndex) => (
                            <button
                              key={subItem.label}
                              onClick={() => handleNavigation(subItem)}
                              style={{
                                width: "100%",
                                padding: "12px 15px",
                                border: "none",
                                background: "transparent",
                                color: "white",
                                textAlign: "left",
                                fontWeight: "600",
                                fontSize: "14px",
                                cursor: "pointer",
                                borderBottom:
                                  subIndex !== item.dropdown.length - 1
                                    ? "1px solid rgba(255,255,255,0.1)"
                                    : "none",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#0A4A8A";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                              }}
                            >
                              {subItem.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // ================= NORMAL MENU =================
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item)}
                    className="fw-semibold"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "white",
                      fontSize: "15px",
                      transition: "0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = "0.7";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = "1";
                    }}
                  >
                    {item.name}
                  </button>
                );
              })}

            </nav>

            {/* ================= RIGHT SIDE (Login + Hamburger) ================= */}
            <div className="d-flex align-items-center gap-3">
              {/* Login Button */}
              <Link
                href="/auth/login"
                className="btn fw-semibold"
                style={{
                  backgroundColor: "white",
                  color: "#0D5AA7",
                  borderRadius: "30px",
                  padding: "8px 24px",
                  border: "none",
                  fontSize: "14px",
                }}
              >
                Login
              </Link>

              {/* Hamburger Button - Mobile */}
              <button
                className="hamburger-button d-lg-none"
                onClick={toggleMobileMenu}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "28px",
                  cursor: "pointer",
                  padding: "5px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
                aria-label="Toggle menu"
              >
                <span style={{
                  display: "block",
                  width: "28px",
                  height: "3px",
                  backgroundColor: "white",
                  borderRadius: "3px",
                  transition: "all 0.3s ease",
                  transform: isMobileMenuOpen ? "rotate(45deg) translate(5px, 5px)" : "none"
                }}></span>
                <span style={{
                  display: "block",
                  width: "28px",
                  height: "3px",
                  backgroundColor: "white",
                  borderRadius: "3px",
                  transition: "all 0.3s ease",
                  opacity: isMobileMenuOpen ? 0 : 1
                }}></span>
                <span style={{
                  display: "block",
                  width: "28px",
                  height: "3px",
                  backgroundColor: "white",
                  borderRadius: "3px",
                  transition: "all 0.3s ease",
                  transform: isMobileMenuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none"
                }}></span>
              </button>
            </div>

          </div>
        </div>

        {/* ================= MOBILE MENU OVERLAY ================= */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            style={{
              position: "fixed",
              top: "75px",
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 9998,
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              style={{
                backgroundColor: "#0D5AA7",
                padding: "20px",
                maxWidth: "400px",
                marginLeft: "auto",
                height: "100%",
                overflowY: "auto",
                boxShadow: "-5px 0 15px rgba(0,0,0,0.3)",
                animation: "slideIn 0.3s ease",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <style jsx>{`
                @keyframes slideIn {
                  from {
                    transform: translateX(100%);
                  }
                  to {
                    transform: translateX(0);
                  }
                }
              `}</style>

              {/* Mobile Menu Items */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}>
                {menuItems.map((item) => {
                  // Dropdown item
                  if (item.dropdown) {
                    return (
                      <div key={item.name}>
                        <button
                          onClick={() => handleDropdownClick(item.name)}
                          style={{
                            width: "100%",
                            padding: "12px 15px",
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "600",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          {item.name}
                          <span style={{
                            fontSize: "12px",
                            transition: "transform 0.3s ease",
                            transform: openDropdown === item.name ? "rotate(180deg)" : "none"
                          }}>
                            ▼
                          </span>
                        </button>

                        {openDropdown === item.name && (
                          <div style={{
                            marginTop: "5px",
                            marginLeft: "10px",
                            borderLeft: "2px solid rgba(255,255,255,0.2)",
                            paddingLeft: "15px",
                          }}>
                            {item.dropdown.map((subItem) => (
                              <button
                                key={subItem.label}
                                onClick={() => handleNavigation(subItem)}
                                style={{
                                  width: "100%",
                                  padding: "10px 15px",
                                  background: "transparent",
                                  border: "none",
                                  color: "rgba(255,255,255,0.9)",
                                  fontSize: "14px",
                                  textAlign: "left",
                                  cursor: "pointer",
                                  borderRadius: "4px",
                                  transition: "0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = "transparent";
                                }}
                              >
                                {subItem.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Normal item
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item)}
                      style={{
                        width: "100%",
                        padding: "12px 15px",
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "white",
                        fontSize: "16px",
                        fontWeight: "600",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main
        style={{
          paddingTop: "75px",
        }}
      >
        {children}
      </main>
            {/* ================= FOOTER ================= */}
      <footer
        style={{
          backgroundColor: "#0B3D6E",
          color: "white",
          padding: "14px 0 20px 0",
        }}
      >
        <div className="container">
          <div className="row g-2">

            {/* ================= INFO ================= */}
            <div className="col-lg-4 col-md-6">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Img
                  src="/images/IMG_Logo.png"
                  alt="Logo LP2M"
                  width={120}
                  height={80}
                  objectFit="contain"
                  style={{
                    filter: "brightness(0) invert(1)",
                  }}
                />

                <div>
                  <h4
                    className="fw-bold m-0"
                    style={{
                      fontSize: "24px",
                    }}
                  >
                    LP2M
                  </h4>

                  <p
                    className="m-0"
                    style={{
                      fontSize: "14px",
                      opacity: 0.8,
                    }}
                  >
                    Politeknik Astra
                  </p>
                </div>
              </div>

              <p
                style={{
                  fontSize: "14px",
                  lineHeight: "28px",
                  opacity: 0.9,
                }}
              >
                Lembaga Penelitian dan Pengabdian kepada Masyarakat
                Politeknik Astra yang mendukung pengembangan inovasi,
                penelitian, dan kontribusi nyata kepada masyarakat.
              </p>
            </div>

            {/* ================= SEKRETARIAT ================= */}
            <div className="col-lg-4 col-md-6">
              <h5
                className="fw-bold mb-2"
                style={{
                  fontSize: "20px",
                }}
              >
                Sekretariat
              </h5>

              {/* Alamat */}
              <div className="d-flex mb-3">
                <i
                  className="bi bi-geo-alt-fill"
                  style={{
                    marginRight: "12px",
                    color: "#9ED0FF",
                    fontSize: "18px",
                  }}
                />

                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    lineHeight: "26px",
                  }}
                >
                  Komplek Astra International Gedung B lt.5
                  <br />
                  Jl. Gaya Motor Raya No 8, Sunter II
                  <br />
                  Jakarta Utara 14330
                </p>
              </div>

              {/* Telepon */}
              <div className="d-flex align-items-center mb-3">
                <i
                  className="bi bi-telephone-fill"
                  style={{
                    marginRight: "12px",
                    color: "#9ED0FF",
                    fontSize: "18px",
                  }}
                />

                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                  }}
                >
                  (021) 6519555
                </p>
              </div>

              {/* Fax */}
              <div className="d-flex align-items-center mb-3">
                <i
                  className="bi bi-printer-fill"
                  style={{
                    marginRight: "12px",
                    color: "#9ED0FF",
                    fontSize: "18px",
                  }}
                />

                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                  }}
                >
                  (021) 6519821
                </p>
              </div>

              {/* Email */}
              <div className="d-flex align-items-center">
                <i
                  className="bi bi-envelope-fill"
                  style={{
                    marginRight: "12px",
                    color: "#9ED0FF",
                    fontSize: "18px",
                  }}
                />

                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    wordBreak: "break-word",
                  }}
                >
                  lppm@polytechnic.astra.ac.id
                </p>
              </div>
            </div>

            {/* ================= MENU CEPAT ================= */}
            <div className="col-lg-4 col-md-12">
              <h5
                className="fw-bold mb-2"
                style={{
                  fontSize: "18px",
                }}
              >
                Menu Cepat
              </h5>

              <div className="d-flex flex-column gap-3">
                <button
                  onClick={() => router.push("/")}
                  style={footerMenuStyle}
                >
                  Home
                </button>

                <button
                  onClick={() => router.push("/penelitian")}
                  style={footerMenuStyle}
                >
                  Penelitian
                </button>

                <button
                  onClick={() => router.push("/pengabdian")}
                  style={footerMenuStyle}
                >
                  Pengabdian
                </button>

                <button
                  onClick={() => router.push("/terapan")}
                  style={footerMenuStyle}
                >
                  Produk Terapan
                </button>
              </div>
            </div>
          </div>

          {/* ================= COPYRIGHT ================= */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.15)",
              marginTop: "40px",
              paddingTop: "15px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                opacity: 0.8,
              }}
            >
              © 2026 LP2M Politeknik Astra. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

LandingLayout.propTypes = {
  children: PropTypes.node.isRequired,
};