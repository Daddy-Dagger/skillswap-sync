import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

if (!env.isProduction) {
  app.get("/api/oauth/authorize", (c) => {
    const redirectUri = c.req.query("redirect_uri");
    const state = c.req.query("state");
    if (!redirectUri || !state) {
      return c.json({ error: "Missing redirect_uri or state" }, 400);
    }
    return c.redirect(`${redirectUri}?code=mock_code&state=${state}`);
  });

  app.post("/api/oauth/token", (c) => {
    return c.json({
      access_token: "mock_access_token",
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: "mock_refresh_token",
      scope: "profile",
    });
  });
}
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
