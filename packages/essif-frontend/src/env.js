const { REACT_APP_EBSI_ENV, PUBLIC_URL } = process.env;

if (!REACT_APP_EBSI_ENV) {
  throw new Error("REACT_APP_EBSI_ENV must be defined");
}

if (
  !["local", "integration", "development", "production"].includes(
    REACT_APP_EBSI_ENV
  )
) {
  throw new Error(
    `REACT_APP_EBSI_ENV has an unknown value: ${REACT_APP_EBSI_ENV}`
  );
}

if (!PUBLIC_URL && PUBLIC_URL !== "") {
  throw new Error("PUBLIC_URL must be defined");
}

const defaultConfig = {
  local: {
    REACT_APP_BACKEND_EXTERNAL_URL: "http://localhost:8080/demo/essif/issue-id",
    REACT_APP_WALLET_WEB_CLIENT_URL: "https://app.intebsi.xyz/wallet",
    REACT_APP_DEMONSTRATOR_URL: "https://app.intebsi.xyz/demo",
  },
  integration: {
    REACT_APP_BACKEND_EXTERNAL_URL:
      "https://app.intebsi.xyz/demo/essif/issue-id",
    REACT_APP_WALLET_WEB_CLIENT_URL: "https://app.intebsi.xyz/wallet",
    REACT_APP_DEMONSTRATOR_URL: "https://app.intebsi.xyz/demo",
  },
  development: {
    REACT_APP_BACKEND_EXTERNAL_URL: "https://app.ebsi.xyz/demo/essif/issue-id",
    REACT_APP_WALLET_WEB_CLIENT_URL: "https://app.ebsi.xyz/wallet",
    REACT_APP_DEMONSTRATOR_URL: "https://app.ebsi.xyz/demo",
  },
  production: {
    REACT_APP_BACKEND_EXTERNAL_URL: "",
    REACT_APP_WALLET_WEB_CLIENT_URL: "",
    REACT_APP_DEMONSTRATOR_URL: "",
  },
};

const basename = (PUBLIC_URL.startsWith("http")
  ? new URL(PUBLIC_URL).pathname
  : PUBLIC_URL
).replace(/\/+$/, "");

const config = {
  PUBLIC_URL,
  BASENAME: basename,
  REACT_APP_EBSI_ENV,
  REACT_APP_WALLET_WEB_CLIENT_URL:
    process.env.REACT_APP_WALLET_WEB_CLIENT_URL ||
    defaultConfig[REACT_APP_EBSI_ENV].REACT_APP_WALLET_WEB_CLIENT_URL,
  REACT_APP_DEMONSTRATOR_URL:
    process.env.REACT_APP_DEMONSTRATOR_URL ||
    defaultConfig[REACT_APP_EBSI_ENV].REACT_APP_DEMONSTRATOR_URL,
  REACT_APP_BACKEND_EXTERNAL_URL:
    process.env.REACT_APP_BACKEND_EXTERNAL_URL ||
    defaultConfig[REACT_APP_EBSI_ENV].REACT_APP_BACKEND_EXTERNAL_URL,
};

module.exports = config;
