"use client";

import "./style.css";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Img from "@/components/common/Img";
import Toast from "@/components/common/Toast";
import fetchClient from "@/lib/fetchClient";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateCaptcha = useCallback(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0];
      code += chars.charAt(randomIndex % chars.length);
    }
    setCaptchaCode(code);
    setCaptchaInput("");
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!username || !password || !captchaInput) {
        Toast.error("Username, password, dan kode captcha wajib diisi.");
        return;
      }

      if (captchaInput !== captchaCode) {
        Toast.error("Kode captcha salah.");
        generateCaptcha();
        setPassword("");
        return;
      }

      setIsLoading(true);

      const response = await fetchClient(
        "/api/auth/login",
        {
          username: username,
          password: password,
          jenisAplikasi: "Public",
        },
        "POST",
      );

      if (response.error) {
        Toast.error(response.message || "Username atau password tidak valid.");
        setPassword("");
        generateCaptcha();
        setIsLoading(false);
      } else {
        globalThis.location.href = "/auth/sso";
      }
    },
    [username, password, captchaInput, captchaCode, router, generateCaptcha],
  );

  return (
    <div className="gradient-bg">
      <div className="login-card mx-4">
        <div className="row">
          <div
            className="col-lg-6"
            style={{ backgroundColor: "transparent", color: "#aaa" }}
          >
            <Img
              src="/images/IMG_Logo.png"
              className="img-logo mb-3"
              width="180"
              lazy={false}
              fluid
            />
            <Img
              src="/images/model.png"
              width="420"
              className="img-model text-center pt-5 mb-0 pb-0"
              lazy={false}
              fluid
            />
          </div>
          <div className="col-lg-6">
            <h3 className="login-title">Masuk ke LPPM</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <Input
                  type="text"
                  id="username"
                  name="username"
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="mb-3">
                <Input
                  type="password"
                  id="password"
                  name="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="mb-2">
                <p className="form-label fw-bold text-primary small mb-2">
                  Verifikasi Captcha
                </p>
                <div className="captcha-container">
                  <div className="captcha-box">{captchaCode}</div>
                  <Button
                    type="button"
                    classType="primary"
                    size="md"
                    title="Perbarui Captcha"
                    onClick={generateCaptcha}
                    iconName="arrow-counterclockwise"
                    isDisabled={isLoading}
                  />
                </div>
              </div>
              <div className="mb-3">
                <Input
                  type="text"
                  id="captcha"
                  name="captcha"
                  placeholder="Masukkan kode captcha"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                classType="success btn-login w-100"
                label={isLoading ? "Memproses..." : "Masuk"}
                title="Masuk ke SSO"
                isDisabled={isLoading}
              />
              <div className="mt-3">
              {/* <Button
                type="button"
                classType="secondary btn-login w-100"
                label="Kembali ke Landing Page"
                title="Landing Page"
                iconName="house-door"
                onClick={() => router.push("/")}
                isDisabled={isLoading}
              /> */}
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
