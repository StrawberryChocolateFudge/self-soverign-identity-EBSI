import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  HttpService,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EbsiDidAuth, DidAuthRequestCall } from "@cef-ebsi/did-auth";
import { CreateVerifiableIdDto } from "./dtos/create-verifiable-id.dto";
import { ValidateDidAuthDto } from "./dtos/validate-did-auth.dto";
import { WalletService } from "../common/services/wallet.service";
import { decodeTokenPayload } from "../common/utils/jwt.utils";
import { SessionsResponse } from "../common/types/sessions.response";
import {
  formatVerifiableId,
  createFullVerifiableId,
} from "./verifiable-ids.utils";

@Injectable()
export class VerifiableIdsService {
  private readonly logger = new Logger(VerifiableIdsService.name);

  constructor(
    private walletService: WalletService,
    private configService: ConfigService,
    private readonly http: HttpService
  ) {}

  async login(): Promise<SessionsResponse> {
    try {
      return await this.walletService.login();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: "Error while contacting Wallet API",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async createVerifiableId(body: CreateVerifiableIdDto): Promise<any> {
    // Get session token
    const sessionResponse: SessionsResponse = await this.login();
    const { accessToken } = sessionResponse;
    let fullVerifiableId;

    try {
      const decodedToken = decodeTokenPayload(accessToken);
      const { did } = decodedToken;
      const verifiableId = formatVerifiableId(body, did);

      const { jws } = await this.walletService.signVerifiableId({
        issuerDid: did,
        verifiableId,
        token: accessToken,
      });

      fullVerifiableId = createFullVerifiableId(jws);

      this.logger.debug("Full VerifiableId");
      this.logger.debug(fullVerifiableId);
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: "Error while creating the Full Verifiable ID",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Send eID VC to wallet
    try {
      await this.walletService.sendVerifiableId({
        verifiableId: fullVerifiableId,
        token: accessToken,
      });

      return "Successfully shared the eID VC with the Wallet";
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: "Error while sharing the Full Verifiable ID",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async didAuth(): Promise<any> {
    // Get session token
    const sessionResponse: SessionsResponse = await this.login();
    const { accessToken } = sessionResponse;

    const didAuthRequestCall: DidAuthRequestCall = {
      redirectUri: `${this.configService.get("publicUrl")}/login`, // Redirect URI after successful authentication
      signatureUri: `${this.configService.get("walletApi")}/signatures`, // EBSI wallet endpoint to create a signature
      authZToken: accessToken, // RP Access token received after calling EBSI wallet sessions endpoint
    };

    // Creates a URI using the wallet backend that manages entity DID keys
    const { uri, nonce } = await EbsiDidAuth.createUriRequest(
      didAuthRequestCall
    );

    const redirectUrl = `${this.configService.get(
      "walletWebClientUrl"
    )}?did-auth=${uri}`;

    return {
      redirectUrl,
      nonce,
    };
  }

  async validateDidAuth(body: ValidateDidAuthDto): Promise<any> {
    const { didAuthResponseJwt, nonce } = body;

    // Get session token
    const sessionResponse: SessionsResponse = await this.login();
    const { accessToken } = sessionResponse;

    try {
      await EbsiDidAuth.verifyDidAuthResponse(
        didAuthResponseJwt,
        `${this.configService.get("walletApi")}/signature-validations`,
        accessToken,
        nonce
      );

      this.logger.debug("DID Auth Response validated successfully");
    } catch (error) {
      this.logger.error("Invalid DID Auth Response or nonce");
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: "Invalid DID Auth Response or nonce",
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}

export default VerifiableIdsService;
