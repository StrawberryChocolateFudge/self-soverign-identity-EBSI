import { IsDefined, IsNotEmpty } from "class-validator";

export class ValidateDidAuthDto {
  @IsNotEmpty()
  @IsDefined()
  didAuthResponseJwt: string;

  @IsNotEmpty()
  @IsDefined()
  nonce: string;
}

export default ValidateDidAuthDto;
