import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import OAuthService from './oauth.service';
import AppleOAuthService from './providers/apple.service';
import GoogleOAuthService from './providers/google.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OAuth, OAuthSchema } from './schema/oauth.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OAuth.name, schema: OAuthSchema }]),
    HttpModule,
  ],
  exports: [OAuthService],
  providers: [OAuthService, GoogleOAuthService, AppleOAuthService],
})
export default class OAuthModule {}
