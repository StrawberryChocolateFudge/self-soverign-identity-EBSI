export default () => {
  const { EBSI_ENV } = process.env;

  const defaultConfig = {
    local: {
      APP_PUBLIC_URL: "http://localhost:8080/demo/essif/issue-id",
      EBSI_WALLET_API: "https://api.intebsi.xyz/wallet/v1",
      EBSI_WALLET_WEB_CLIENT_URL: "https://app.intebsi.xyz/wallet",
      LOG_LEVEL: "debug",
    },
    integration: {
      APP_PUBLIC_URL: "https://app.intebsi.xyz/demo/essif/issue-id",
      EBSI_WALLET_API: "https://api.intebsi.xyz/wallet/v1",
      EBSI_WALLET_WEB_CLIENT_URL: "https://app.intebsi.xyz/wallet",
      LOG_LEVEL: "debug",
    },
    development: {
      APP_PUBLIC_URL: "https://app.ebsi.xyz/demo/essif/issue-id",
      EBSI_WALLET_API: "https://api.ebsi.xyz/wallet/v1",
      EBSI_WALLET_WEB_CLIENT_URL: "https://app.ebsi.xyz/wallet",
      LOG_LEVEL: "debug",
    },
    production: {
      APP_PUBLIC_URL: "",
      EBSI_WALLET_API: "",
      EBSI_WALLET_WEB_CLIENT_URL: "",
      LOG_LEVEL: "warn",
    },
  };

  const publicUrl =
    process.env.APP_PUBLIC_URL || defaultConfig[EBSI_ENV].APP_PUBLIC_URL;

  const prefix = (publicUrl.startsWith("http")
    ? new URL(publicUrl).pathname
    : publicUrl
  ).replace(/\/+$/, "");

  return {
    prefix,
    port: process.env.APP_PORT || 8080,
    publicUrl,
    walletApi:
      process.env.EBSI_WALLET_API || defaultConfig[EBSI_ENV].EBSI_WALLET_API,
    walletWebClientUrl:
      process.env.EBSI_WALLET_WEB_CLIENT_URL ||
      defaultConfig[EBSI_ENV].EBSI_WALLET_WEB_CLIENT_URL,
    logLevel: process.env.LOG_LEVEL || defaultConfig[EBSI_ENV].LOG_LEVEL,
    privateKey: process.env.APP_PRIVATE_KEY,
    issuer: process.env.APP_ISSUER,
  };
};
