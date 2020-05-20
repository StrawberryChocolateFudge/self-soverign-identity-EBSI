import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { decodeToken, isTokenExpired } from "../utils/jwt.utils";

const formatException = (message) =>
  new HttpException(
    {
      status: HttpStatus.FORBIDDEN,
      error: "Forbidden",
      message,
    },
    HttpStatus.FORBIDDEN
  );

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request: any = context.switchToHttp().getRequest();

    if (!request.headers || !request.headers.authorization) {
      this.logger.debug("Request is missing JWT");
      throw formatException("Missing JWT");
    }

    if (!request.headers.authorization.startsWith("Bearer ")) {
      this.logger.debug("Authorization header doesn't start with 'Bearer '");
      throw formatException("Invalid JWT");
    }

    let decodedToken;
    try {
      decodedToken = decodeToken(request.headers.authorization.substr(7));
    } catch (e) {
      this.logger.debug("Unable to parse token");
      throw formatException("Unparseable JWT");
    }

    try {
      if (isTokenExpired(decodedToken)) {
        this.logger.debug("JWT is expired");
        throw new Error("Expired JWT");
      }
    } catch (e) {
      this.logger.debug(e.message);
      throw formatException(e.message);
    }

    if (
      !decodedToken.sub_jwk ||
      !decodedToken.sub_jwk.kid ||
      !decodedToken.sub_jwk.kid.startsWith("did:ebsi:")
    ) {
      this.logger.debug("Missing or malformed DID in JWT");
      throw formatException("Missing or malformed DID in JWT");
    }

    return true;
  }
}

export default JwtGuard;
