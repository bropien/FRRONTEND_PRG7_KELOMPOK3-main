import "server-only";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.APP_SECRET_KEY;

export const encryptId = (text) => {
  if (!text) return null;
  return CryptoJS.AES.encrypt(text.toString(), SECRET_KEY).toString();
};

export const decryptId = (cipherText) => {
  if (!cipherText) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) return null;
    return decryptedText;
  } catch {
    return null;
  }
};

export const encryptIdUrl = (text) => {
  if (!text) return null;

  const encrypted = CryptoJS.AES.encrypt(
    text.toString(),
    SECRET_KEY,
  ).toString();

  return encrypted
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

export const decryptIdUrl = (encryptedText) => {
  if (!encryptedText) return null;

  try {
    let encrypted = encryptedText.replaceAll("-", "+").replaceAll("_", "/");

    while (encrypted.length % 4) {
      encrypted += "=";
    }

    const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) return null;
    return decryptedText;
  } catch {
    return null;
  }
};
