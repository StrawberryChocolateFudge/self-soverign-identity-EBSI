import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Logger,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { VerifiableIdsService } from "./verifiable-ids.service";
import { CreateVerifiableIdDto } from "./dtos/create-verifiable-id.dto";
import { ValidateDidAuthDto } from "./dtos/validate-did-auth.dto";
import { JwtGuard } from "../common/guards/jwt.guard";

@Controller("api")
export class VerifiableIdsController {
  private readonly logger = new Logger(VerifiableIdsController.name);

  constructor(private readonly verifiableIdsService: VerifiableIdsService) {}

  @Post("verifiable-credentials")
  @UseGuards(JwtGuard)
  async createVerifiableId(
    @Body() verifiableIdsBody: CreateVerifiableIdDto,
    @Res() res: Response
  ): Promise<Response<any>> {
    const result = await this.verifiableIdsService.createVerifiableId(
      verifiableIdsBody
    );
    return res.status(HttpStatus.CREATED).send(result);
  }

  @Get("did-auth")
  async didAuth(@Res() res: Response): Promise<Response<any>> {
    const result = await this.verifiableIdsService.didAuth();
    return res.status(HttpStatus.OK).send(result);
  }

  @Post("did-auth-validations")
  async validateDidAuth(
    @Body() body: ValidateDidAuthDto,
    @Res() res: Response
  ): Promise<Response<any>> {
    await this.verifiableIdsService.validateDidAuth(body);
    return res.status(HttpStatus.CREATED).send();
  }
}

export default VerifiableIdsController;
