const developmentBackendOrigin = "http://localhost:3001";

export function getBackendOrigin(): string {
  const configuredOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.trim();

  if (!configuredOrigin) {
    if (process.env.NODE_ENV !== "production") {
      return developmentBackendOrigin;
    }

    throw new Error("NEXT_PUBLIC_BACKEND_ORIGIN must be configured in production");
  }

  let parsedOrigin: URL;

  try {
    parsedOrigin = new URL(configuredOrigin);
  } catch {
    throw new Error("NEXT_PUBLIC_BACKEND_ORIGIN must be a valid HTTP(S) origin");
  }

  const supportedProtocols = process.env.NODE_ENV === "production" ? ["https:"] : ["http:", "https:"];

  if (!supportedProtocols.includes(parsedOrigin.protocol) || parsedOrigin.origin === "null") {
    throw new Error("NEXT_PUBLIC_BACKEND_ORIGIN must be a valid HTTP(S) origin");
  }

  return parsedOrigin.origin;
}

export function getBackendUrl(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error("API paths must start with a slash");
  }

  return new URL(path, getBackendOrigin()).toString();
}

export function resolveBackendAssetUrl(url: string): string {
  return url.startsWith("/") ? getBackendUrl(url) : url;
}
