// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import mdx from "@astrojs/mdx";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  outDir: "dist",

  integrations: [
    starlight({
      title: "Tensamin",
      logo: {
        alt: "Tensamin Logo",
        replacesTitle: true,
        dark: "./src/logo/dark.svg",
        light: "./src/logo/light.svg",
      },
      customCss: ["./src/theme.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Tensamin",
        },
        {
          icon: "external",
          label: "Website",
          href: "https://tensamin.net",
        },
        {
          icon: "information",
          label: "Status",
          href: "https://status.tensamin.net",
        },
      ],
      sidebar: [
        "index",
        "installation",
        {
          label: "Components",
          items: [
            { label: "Iota", autogenerate: { directory: "components/iota" } },
            {
              label: "Omikron",
              autogenerate: { directory: "components/omikron" },
            },
            { label: "Omega", autogenerate: { directory: "components/omega" } },
            {
              label: "Auth Server",
              autogenerate: { directory: "components/auth-server" },
            },
          ],
        },
        { label: "Security", autogenerate: { directory: "security" } },
      ],
    }),
    mdx(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
