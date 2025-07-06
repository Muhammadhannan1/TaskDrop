import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import {
  IOAuth,
  IOAuthTokenData,
} from '../../../utils/interfaces/oauth.interface';
import { JWK, JWS } from 'node-jose';

@Injectable()
export default class AppleOAuthService implements IOAuth {
  constructor(private _httpService: HttpService) {}

  private async _getPublicKeys() {
    const result = await this._httpService.axiosRef.get(
      `${process.env.APP_APPLE_OAUTH_ENDPOINT}/auth/keys`,
    );
    return result.data;
  }

  async GetTokenData(token: string): Promise<IOAuthTokenData> {
    const keys = await this._getPublicKeys();
    const keystore = await JWK.asKeyStore(keys);
    const verifiedResult = await JWS.createVerify(keystore).verify(token);
    const data = JSON.parse(verifiedResult.payload.toString());

    return {
      id: data.sub,
      name: data?.user?.name?.firstName ?? 'John Doe',
      email: data.email,
      type: 'apple',
    };
  }
}
