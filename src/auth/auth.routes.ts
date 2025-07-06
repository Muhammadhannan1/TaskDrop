export class AuthApiRoutes {
  static readonly Root = 'auth';

  static readonly CreateAdmin = '/admin/create';
  static readonly AdminLogin = '/admin/login';
  static readonly UserLogin = '/user/login';
  static readonly SignUpUser = '/user/signup';
  static readonly SignupAdmin = '/admin/signup';
  static readonly LoginUser = '/user/login';
  static readonly LoginAdmin = '/admin/login';
  static readonly Logout = '/user/logout';
  static readonly VerifyAccount = '/verifyAccount';

  static readonly AppleSignUp = '/signup/apple';
  static readonly GoogleSignUp = '/signup/google';
}
