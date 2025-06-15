import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("demo", "routes/demo.tsx"),
  
  layout("components/auth-guard.tsx", [
    layout("components/layout.tsx", [
      index("routes/home.tsx"),
      route("profile", "routes/profile.tsx"),
      route("credentials", "routes/credentials.tsx"),
      route("sessions/new", "routes/sessions/new.tsx"),
      route("sessions/:id", "routes/sessions/$id.tsx"),
      route("sessions/:id/edit", "routes/sessions/$id.edit.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
