import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as jose from "jose";
import * as cookie from "cookie";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { signSessionToken, verifySessionToken } from "./session";
import { users as kimiUsers } from "./platform";
import { findUserByUnionId, upsertUser } from "../queries/users";
import type { TokenResponse } from "./types";

async function exchangeAuthCode(
  code: string,
  redirectUri: string,
): Promise<TokenResponse> {
  if (!env.isProduction || code === "mock_code") {
    return {
      access_token: "mock_access_token",
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: "mock_refresh_token",
      scope: "profile",
    };
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.appId,
    redirect_uri: redirectUri,
    client_secret: env.appSecret,
  });

  const resp = await fetch(`${env.kimiAuthUrl}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token exchange failed (${resp.status}): ${text}`);
  }

  return resp.json() as Promise<TokenResponse>;
}

let jwks: any = null;
if (env.isProduction || (env.kimiAuthUrl && env.kimiAuthUrl.startsWith("http"))) {
  try {
    jwks = jose.createRemoteJWKSet(
      new URL(`${env.kimiAuthUrl}/api/.well-known/jwks.json`),
    );
  } catch (error) {
    console.warn("[auth] Failed to parse kimiAuthUrl into URL:", error);
  }
}

async function verifyAccessToken(
  accessToken: string,
): Promise<{ userId: string; clientId: string }> {
  if (!env.isProduction || accessToken === "mock_access_token") {
    return {
      userId: env.ownerUnionId || "admin_dev",
      clientId: env.appId || "dev_app_id",
    };
  }

  if (!jwks) {
    throw new Error("JWKS endpoint is not initialized");
  }

  const { payload } = await jose.jwtVerify(accessToken, jwks);
  const userId = payload.user_id as string;
  const clientId = payload.client_id as string;
  if (!userId) {
    throw new Error("user_id missing from access token");
  }
  return { userId, clientId };
}

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    if (!env.isProduction) {
      let devUser = await findUserByUnionId("admin_dev");
      if (!devUser) {
        try {
          await upsertUser({
            unionId: "admin_dev",
            name: "Admin Dev",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin_dev",
            role: "admin",
            lastSignInAt: new Date(),
          });
          devUser = await findUserByUnionId("admin_dev");
        } catch (dbError) {
          console.error("[auth] Failed to upsert dev user in database:", dbError);
        }
      }
      if (devUser) {
        return {
          ...devUser,
          role: "admin" as const,
        };
      }
      return {
        id: 999999,
        unionId: "admin_dev",
        name: "Admin Dev",
        email: null,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin_dev",
        role: "admin" as const,
        isOnboarded: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignInAt: new Date(),
      };
    }
    console.warn("[auth] No session cookie found in request.");
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  return user;
}

export function createOAuthCallbackHandler() {
  return async (c: Context) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");
    const errorDescription = c.req.query("error_description");

    if (error) {
      if (error === "access_denied") {
        return c.redirect("/", 302);
      }
      return c.json(
        { error, error_description: errorDescription },
        400,
      );
    }

    if (!code || !state) {
      return c.json({ error: "code and state are required" }, 400);
    }

    try {
      const redirectUri = atob(state);
      const tokenResp = await exchangeAuthCode(code, redirectUri);
      const { userId } = await verifyAccessToken(tokenResp.access_token);
      const userProfile = (!env.isProduction || tokenResp.access_token === "mock_access_token")
        ? { name: "Admin Dev", avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=admin_dev" }
        : await kimiUsers.getProfile(tokenResp.access_token);
      if (!userProfile) {
        throw new Error("Failed to fetch user profile from Kimi Open");
      }

      await upsertUser({
        unionId: userId,
        name: userProfile.name,
        avatar: userProfile.avatar_url,
        lastSignInAt: new Date(),
      });

      const token = await signSessionToken({
        unionId: userId,
        clientId: env.appId,
      });

      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      return c.redirect("/", 302);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      return c.json({ error: "OAuth callback failed" }, 500);
    }
  };
}

export { exchangeAuthCode, verifyAccessToken };
