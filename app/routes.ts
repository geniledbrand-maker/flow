import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("flow", "routes/flow.tsx"),
] satisfies RouteConfig;
