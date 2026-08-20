import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nurnrebel aka XNX",
    short_name: "Nurnrebel",
    description:
      "Social awareness streetwear built for identity, rebellion, awareness, and self-expression.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/logo-white.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}