const UNAUTHORIZED_PAGE = "/auth/sso";

const fetchClient = async (
  url,
  param = {},
  method = "POST",
  responseType = "json",
) => {
  const normalizedMethod = method.toUpperCase();

  const options = {
    method: normalizedMethod,
    headers: {},
  };

  if (!(param instanceof FormData)) {
    options.headers["Content-Type"] = "application/json";
  }

  if (normalizedMethod !== "GET" && normalizedMethod !== "HEAD") {
    options.body = param instanceof FormData ? param : JSON.stringify(param);
  } else if (Object.keys(param).length > 0) {
    const queryString = new URLSearchParams(param).toString();
    url = `${url}?${queryString}`;
  }

  try {
    const response = await fetch(url, options);

    if (response.status === 401 || response.status === 403) {
      if (globalThis.window !== undefined) {
        globalThis.location.href = UNAUTHORIZED_PAGE;
      }
      return { error: true, status: response.status, message: "Unauthorized" };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: true, status: response.status, ...errorData };
    }

    if (responseType === "blob") {
      return await response.blob();
    }

    if (responseType === "text") {
      return await response.text();
    }

    return await response.json();
  } catch {
    return {
      error: true,
      message: "Terjadi kesalahan jaringan",
    };
  }
};

export default fetchClient;
