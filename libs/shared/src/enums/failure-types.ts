export enum FailureTypes {
  // Fields Failures Type
  email = 'email-error',
  fieldsError = 'fields-error',

  // Auth Failures Type
  unauthorized = 'unauthorized',
  invalidAccessToken = 'invalid-access-token',
  expiredAccessToken = 'expired-access-token',
  signatureAccessTokenInvalid = 'signature-access-token-invalid',
  userIsNotActive = 'user-is-not-active',
  userIsBanned = 'user-is-banned',
  roleNotValid = 'role-not-valid',

  userAlreadyInvited = 'user-already-invited',
  inviteNotFound = 'invite-not-found',

  // Others
  jwtNotFoundInRoleGuardedRoute = 'jwt-not-found-in-role-guarded-route',
  formatException = 'format-exception',
  httpHandleError = 'http-handle-error',
  networkError = 'network-error',
  unknown = 'unknown',
}
