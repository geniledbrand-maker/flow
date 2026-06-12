import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  basename: "/flow/",
  prerender: ["/", "/flow"],
} satisfies Config;
