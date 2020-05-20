import { JWT, JWK } from "jose";
import crypto from "crypto";
import base64url from "base64url";
import { JwtPayload } from "../interfaces/jwt.payload";

export function decodeToken(token: string) {
  if (!token) {
    throw new Error("Missing token");
  }

  return JWT.decode(token);
}

export function decodeTokenPayload(token: string): JwtPayload {
  if (!token) {
    throw new Error("Missing token");
  }

  const r = decodeToken(token);
  const l: JwtPayload = r as JwtPayload;
  return l;
}

export function isTokenExpired(jwtPayload: JwtPayload) {
  if (!jwtPayload || !jwtPayload.exp) {
    throw new Error("Invalid JWT payload provided");
  }

  return jwtPayload.exp * 1000 < Date.now();
}

export function generateSelfSignedToken({ audience, iss, privKey }) {
  if (!audience || !iss || !privKey) {
    throw new Error("Invalid parameters");
  }

  const nonce = crypto.randomBytes(16).toString("base64");

  const tokenPayload = {
    iss,
    nonce,
  };

  const key = JWK.asKey(base64url.decode(privKey));

  const token = JWT.sign(tokenPayload, key, {
    expiresIn: "15 minutes",
    audience,
    header: {
      typ: "JWT",
    },
  });

  return token;
}
