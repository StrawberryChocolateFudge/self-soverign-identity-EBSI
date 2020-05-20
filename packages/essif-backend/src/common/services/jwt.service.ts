import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  decodeTokenPayload,
  isTokenExpired,
  generateSelfSignedToken,
} from "../utils/jwt.utils";
import { JwtPayload } from "../interfaces/jwt.payload";

@Injectable()
export class JwtService {
  private readonly logger = new Logger(JwtService.name);

  private assertionToken = new Map<string, string>();

  constructor(private configService: ConfigService) {}

  clearCache(): void {
    this.assertionToken.clear();
  }

  /**
   * Create a signed JWT to be used as assertion in /sessions endpoints
   * @param audience aud in jwt payload
   */
  createSignedAssertionToken(audience: string): string {
    // Check if the token in memory is still valid
    if (this.assertionToken.has(audience)) {
      const cachedToken = this.assertionToken.get(audience);
      const payload: JwtPayload = decodeTokenPayload(cachedToken);

      // If valid, directly return the token
      if (!isTokenExpired(payload)) {
        return cachedToken;
      }
    }

    // Load private key from config
    const privKey = this.configService.get("privateKey");
    const iss = this.configService.get("issuer");

    const token = generateSelfSignedToken({
      audience,
      privKey,
      iss,
    });

    this.logger.debug(`New session token generated for ${audience}`);

    // Save token in memory
    this.assertionToken.set(audience, token);

    return token;
  }
}

export default JwtService;
