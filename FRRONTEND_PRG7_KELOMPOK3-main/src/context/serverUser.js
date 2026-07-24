import "server-only";
import { cookies } from "next/headers";
import { decryptId } from "../lib/encryptor";

const COOKIE_USER_DATA = "userData";
const COOKIE_SSO_DATA = "ssoData";

async function getDecryptedServerCookie(name) {
  const cookieStore = await cookies();
  const cookieObj = cookieStore.get(name);

  if (!cookieObj?.value) return null;

  try {
    const decoded = decodeURIComponent(cookieObj.value);
    const decrypted = decryptId(decoded);

    if (
      !decrypted ||
      typeof decrypted !== "string" ||
      decrypted.trim() === ""
    ) {
      return null;
    }

    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export const getServerUserData = () =>
  getDecryptedServerCookie(COOKIE_USER_DATA);
export const getServerSSOData = () => getDecryptedServerCookie(COOKIE_SSO_DATA);
