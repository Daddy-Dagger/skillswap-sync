import "dotenv/config";

function required(name: string): string {
  let value = process.env[name];
  if (value !== undefined) {
    const hashIndex = value.indexOf("#");
    if (hashIndex !== -1) {
      value = value.substring(0, hashIndex);
    }
    value = value.trim();
  }
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  kimiAuthUrl: required("KIMI_AUTH_URL"),
  kimiOpenUrl: required("KIMI_OPEN_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
};
