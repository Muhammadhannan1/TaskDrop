export default class UserApiRoutes {
  static readonly Root = 'user';
  static readonly GetMe = '/getMe';
  static readonly UpdateProfile =  '/updateProfile';
  static readonly ChangePassword =  '/changePassword';
  static readonly ForgotPassword =  '/forgotPassword';
  static readonly ResetPassword = '/resetPassword';
  static readonly VerifyOTP =  '/verifyOTP';
  static readonly ResendOtp =  '/resendOtp';
  static readonly DeleteUser =   '/delete/:userId';

  static readonly GetAllUsers = '/allUsers';
  static readonly getUserById = '/getUser/:userId';
  static readonly toggleNotifications = '/toggleNotifications';
}
