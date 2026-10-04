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
          icon: "code-branch",
          label: "Git",
          href: "https://git.methanium.net/tensamin",
        },
        {
          icon: "external",
          label: "Homepage",
          href: "https://tensamin.net",
        },
        {
          icon: "information",
          label: "Status",
          href: "https://status.methanium.net",
        },
        {
          icon: "heart",
          label: "Support us",
          href: "https://shop.methanium.net/collections/tensamin",
        },
      ],
      sidebar: [
        "index",
        "installation",
        "obtainium",
        "deployment",
        "updates",
        {
          label: "Developers",
          items: [{ autogenerate: { directory: "developers" } }],
        },
        {
          label: "Components",
          items: [
            {
              label: "Iota",
              items: [{ autogenerate: { directory: "components/iota" } }],
            },
            {
              label: "Omikron",
              items: [{ autogenerate: { directory: "components/omikron" } }],
            },
            {
              label: "Omega",
              items: [{ autogenerate: { directory: "components/omega" } }],
            },
            {
              label: "Auth Server",
              items: [
                { autogenerate: { directory: "components/auth-server" } },
              ],
            },
          ],
        },
        {
          label: "Security",
          items: [{ autogenerate: { directory: "security" } }],
        },
      ],
    }),
    mdx(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
