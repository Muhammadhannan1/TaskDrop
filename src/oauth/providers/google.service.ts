import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import {
  IOAuth,
  IOAuthTokenData,
} from '../../../utils/interfaces/oauth.interface';

@Injectable()
export default class GoogleOAuthService implements IOAuth {
  constructor(private _httpService: HttpService) {}

  async GetTokenData(token: string): Promise<IOAuthTokenData> {
    const result = await this._httpService.axiosRef.get(
      `${process.env.APP_GOOGLE_OAUTH_ENDPOINT}?id_token=${token}`,
    );

    return {
      id: result.data.sub,
      name: result.data?.given_name ?? 'John',
      email: result.data.email,
      type: 'google',
    };
  }
}
