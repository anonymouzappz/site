"use client";

import Script from "next/script";

export default function GoogleAdSense() {
  return (
    <Script
      id="google-adsense"
      async
      strategy="afterInteractive"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1114243423418375"
      crossOrigin="anonymous"
    />
  );
}