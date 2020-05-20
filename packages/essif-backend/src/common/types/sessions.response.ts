export interface SessionsResponse {
  accessToken: string; // Authentication JWT to access the API.
  tokenType?: string; // Type of the authentication token. Supported type "bearer".
  expiresIn?: number; // JWT expiration in seconds.
  issuedAt?: string; // Time of JWT issuance. Format: unix timestamp
}
