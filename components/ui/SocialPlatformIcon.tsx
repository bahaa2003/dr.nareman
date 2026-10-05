type SocialPlatformIconProps = {
  platform: string;
};

export function SocialPlatformIcon({ platform }: SocialPlatformIconProps) {
  if (platform === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.5" cy="6.7" r="1.1" fill="currentColor" />
      </svg>
    );
  }

  if (platform === "Snapchat") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M12 2.7c-3.26 0-5.5 2.38-5.5 5.72 0 .92.17 1.7.38 2.42-.8.4-1.6.55-2.26.42-.2-.04-.37.1-.34.3.08.68.83 1.56 2.84 1.84.16.7.63 1.08 1.38 1.24.22.52.75.88 1.5.88.55 0 .97-.13 1.5-.13s.95.13 1.5.13c.75 0 1.28-.36 1.5-.88.75-.16 1.22-.54 1.38-1.24 2.01-.28 2.76-1.16 2.84-1.84.03-.2-.14-.34-.34-.3-.66.13-1.46-.02-2.26-.42.21-.72.38-1.5.38-2.42C17.5 5.08 15.26 2.7 12 2.7Z"
        />
      </svg>
    );
  }

  if (platform === "TikTok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M14.45 2.75h3.05c.23 2.13 1.36 3.5 3.5 3.7v3.04c-2.02.06-3.74-.58-5.14-1.72v6.56c0 3.95-2.72 6.42-6.33 6.42-3.38 0-6.03-2.48-6.03-5.9 0-3.62 2.91-6.1 6.42-6.1.4 0 .78.04 1.16.12v3.1a3.16 3.16 0 0 0-1.13-.2c-1.72 0-2.94 1.19-2.94 2.92 0 1.59 1.16 2.82 2.75 2.82 1.87 0 2.7-1.1 2.7-3.34V2.75Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M18.9 2.5h3.48l-7.6 8.68 8.94 10.32h-7l-5.48-7.13-6.24 7.13H1.5l8.13-9.3L1.05 2.5h7.16l4.96 6.55L18.9 2.5Zm-1.22 17.1h1.93L7.16 4.3H5.1L17.68 19.6Z"
      />
    </svg>
  );
}
