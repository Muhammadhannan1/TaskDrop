export type OAuthProviders = 'google' | 'apple';

export type IOAuthTokenData = {
  id: string;
  name?: string;
  type: 'google' | 'apple';
  email: string;
};

export interface IOAuth {
  GetTokenData(token: string): Promise<IOAuthTokenData>;
}
