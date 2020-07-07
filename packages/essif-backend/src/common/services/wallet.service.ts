import crypto from "crypto";
import { Injectable, HttpService, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import base64url from "base64url";
import { Agent, Scope } from "@cef-ebsi/app-jwt";
import { SessionsResponse } from "../types/sessions.response";

// Imported from previous wallet backend, probably need to be standardised
enum NotificationType {
  STORE_CREDENTIAL,
  STORE_VERIFIABLEID,
  REQUEST_PRESENTATION,
  SIGN_PAYLOAD,
  SIGN_TX,
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly http: HttpService,
    private configService: ConfigService
  ) {}

  /**
   * Call /sessions on Wallet API to get an accessToken
   * We must first create and sign an Authn token with
   * self-sovereign-identity private key
   */
  async login(): Promise<SessionsResponse> {
    this.logger.debug("Login with Wallet API");
    let payload;

    try {
      const privKey = this.configService.get("privateKey");
      const iss = this.configService.get("issuer");

      const agent = new Agent(Scope.ENTITY, privKey, {
        issuer: iss,
      });

      const nonce = crypto.randomBytes(16).toString("base64");

      payload = await agent.createRequestPayload("ebsi-wallet", {
        nonce,
      });
    } catch (error) {
      this.logger.error("Error while creating the self-signed token");
      this.logger.error(error);
      throw error;
    }

    const walletApi = this.configService.get("walletApi");

    try {
      const response = await this.http
        .post(`${walletApi}/sessions`, payload)
        .toPromise()
        .then((res) => res.data);

      this.logger.debug("Login successful");
      return response;
    } catch (error) {
      // Log Axios error
      this.logger.error("Error while contacting Wallet API");
      if (error.response) {
        // Request made and server responded
        this.logger.error("Response data:");
        this.logger.error(error.response.data);
        this.logger.error("Response status:");
        this.logger.error(error.response.status);
        this.logger.error("Response headers:");
        this.logger.error(JSON.stringify(error.response.headers));
      } else if (error.request) {
        // The request was made but no response was received
        this.logger.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        this.logger.error(error.message);
      }
      this.logger.error(error.config);

      throw error;
    }
  }

  async signVerifiableId({ issuerDid, verifiableId, token }): Promise<any> {
    // Send to Wallet API for signature
    const signPayload = {
      issuer: issuerDid,
      type: "EcdsaSecp256k1Signature2019",
      payload: verifiableId,
    };

    // POST /wallet/v1/signatures
    return this.http
      .post(`${this.configService.get("walletApi")}/signatures`, signPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .toPromise()
      .then((res) => res.data);
  }

  async sendVerifiableId({ verifiableId, token }) {
    const notificationPayload = {
      sender: verifiableId.issuer,
      notification: {
        target: verifiableId.credentialSubject.id,
        notificationType: NotificationType.STORE_VERIFIABLEID,
        name: "Verifiable ID",
        data: { base64: base64url.encode(JSON.stringify(verifiableId)) },
      },
    };

    // POST /wallet/v1/notifications
    await this.http
      .post(
        `${this.configService.get("walletApi")}/notifications`,
        notificationPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .toPromise()
      .then((res) => res.data);
  }
}

export default WalletService;
