import { JWT } from "jose";
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
