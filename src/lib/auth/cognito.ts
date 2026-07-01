"use client";

import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
  type CognitoUserSession,
} from "amazon-cognito-identity-js";

export const userPool = new CognitoUserPool({
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
});

function user(email: string) {
  return new CognitoUser({ Username: email, Pool: userPool });
}

// Turn a Cognito error (or any of its `code`s) into a sentence we can show. The
// raw SDK messages are mostly fine; this just smooths the few opaque ones.
export function authMessage(err: unknown): string {
  const e = err as { code?: string; message?: string } | undefined;
  switch (e?.code) {
    case "UsernameExistsException":
      return "That email is already registered. Try signing in instead.";
    case "UserNotConfirmedException":
      return "Your email isn't verified yet — enter the code we sent you.";
    case "NotAuthorizedException":
      return "Incorrect email or password.";
    case "CodeMismatchException":
      return "That code isn't right. Check it and try again.";
    case "ExpiredCodeException":
      return "That code has expired. Request a new one.";
    case "LimitExceededException":
      return "Too many attempts. Wait a little and try again.";
    case "InvalidPasswordException":
      return "Password must be 8+ characters with an upper- and lower-case letter and a number.";
    case "UserNotFoundException":
      return "No account found for that email.";
    default:
      return e?.message || "Something went wrong. Please try again.";
  }
}

export function signUp(email: string, password: string, name?: string): Promise<void> {
  const attrs = name ? [new CognitoUserAttribute({ Name: "name", Value: name })] : [];
  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attrs, [], (err) => (err ? reject(err) : resolve()));
  });
}

export function confirmRegistration(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    user(email).confirmRegistration(code, true, (err) => (err ? reject(err) : resolve()));
  });
}

export function resendCode(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    user(email).resendConfirmationCode((err) => (err ? reject(err) : resolve()));
  });
}

export function login(email: string, password: string): Promise<CognitoUserSession> {
  const details = new AuthenticationDetails({ Username: email, Password: password });
  return new Promise((resolve, reject) => {
    user(email).authenticateUser(details, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => reject(err),
    });
  });
}

export function logout() {
  userPool.getCurrentUser()?.signOut();
}

export function forgotPassword(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    user(email).forgotPassword({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

export function confirmPassword(email: string, code: string, newPassword: string): Promise<void> {
  return new Promise((resolve, reject) => {
    user(email).confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

// The current ID token, refreshed transparently via the stored refresh token
// when the 60-minute ID token has expired. null when signed out.
export function getIdToken(): Promise<string | null> {
  return new Promise((resolve) => {
    const current = userPool.getCurrentUser();
    if (!current) return resolve(null);
    current.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) return resolve(null);
      resolve(session.getIdToken().getJwtToken());
    });
  });
}
