export interface JwtPayload {
  iat?: number;
  exp?: number;
  sub?: string;
  aud?: string;
  did?: string;
  nonce?: string;
  iss?: string;
}
