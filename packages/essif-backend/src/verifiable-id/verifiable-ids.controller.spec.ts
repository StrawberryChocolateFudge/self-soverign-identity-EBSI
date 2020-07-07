import { Test } from "@nestjs/testing";
import { HttpModule, HttpStatus } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Response } from "jest-express/lib/response";
import { VerifiableIdsController } from "./verifiable-ids.controller";
import { VerifiableIdsService } from "./verifiable-ids.service";
import { WalletService } from "../common/services/wallet.service";
import { CreateVerifiableIdDto } from "./dtos/create-verifiable-id.dto";
import configuration from "../config/configuration";

describe("verifiable-ids.controller", () => {
  let verifiableIdsController: VerifiableIdsController;
  let verifiableIdsService: VerifiableIdsService;

  // eslint-disable-next-line jest/no-hooks
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot({
          envFilePath: [".env.test", ".env"],
          load: [configuration],
        }),
      ],
      controllers: [VerifiableIdsController],
      providers: [VerifiableIdsService, WalletService],
    }).compile();

    verifiableIdsService = moduleRef.get<VerifiableIdsService>(
      VerifiableIdsService
    );
    verifiableIdsController = moduleRef.get<VerifiableIdsController>(
      VerifiableIdsController
    );
  });

  describe("createVerifiableId", () => {
    it("should return what verifiableIdsService.createVerifiableId returns", async () => {
      expect.assertions(3);

      const req = {
        credentialSubject: {
          id: "",
          personIdentifier: "",
          currentAddress: "",
          currentFamilyName: "",
          currentGivenName: "",
          birthName: "",
          dateOfBirth: "",
          placeOfBirth: "",
          gender: "",
        },
      };

      const response = new Response();

      jest
        .spyOn(verifiableIdsService, "createVerifiableId")
        .mockImplementation(
          async (body: CreateVerifiableIdDto): Promise<any> => body
        );

      // @ts-ignore: typings are not 100% supported https://github.com/jameswlane/jest-express/issues/120
      await verifiableIdsController.createVerifiableId(req, response);

      expect(response.send).toHaveBeenCalledWith(req);
      expect(response.body).toBe(req);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
    });
  });
});
