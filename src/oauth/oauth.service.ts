import { Injectable, BadRequestException } from '@nestjs/common';
// import { BadRequestException } from 'core/exceptions/response.exception';
import {
  IOAuthTokenData,
  OAuthProviders,
} from '../../utils/interfaces/oauth.interface';
import AppleOAuthService from './providers/apple.service';
import GoogleOAuthService from './providers/google.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OAuth } from './schema/oauth.schema';
import { OAuthDocument } from './schema/oauth.schema';

@Injectable()
export default class OAuthService {
  constructor(
    @InjectModel(OAuth.name) private readonly oAuthModel: Model<OAuth>,
    private _googleService: GoogleOAuthService,
    private _appleService: AppleOAuthService,
  ) {}

  async GetTokenData(
    token: string,
    type: OAuthProviders,
  ): Promise<IOAuthTokenData> {
    try {
      switch (type) {
        case 'google':
          return await this._googleService.GetTokenData(token);
        case 'apple':
          return await this._appleService.GetTokenData(token);
        default:
          throw new BadRequestException('oauth.invalid_provider');
      }
    } catch (err) {
      throw new BadRequestException('oauth.invalid_token');
    }
  }
  async create(payload: any) {
    return await this.oAuthModel.create(payload);
  }

  async findOne(filter: any): Promise<OAuthDocument> {
    return await this.oAuthModel.findOne(filter);
  }
}
