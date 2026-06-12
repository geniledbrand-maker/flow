import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("flow", "routes/flow.tsx"),
  route("order", "routes/order.tsx"),
  route("order/done", "routes/order-done.tsx"),
] satisfies RouteConfig;
