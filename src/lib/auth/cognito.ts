"use client";

import { Amplify } from "aws-amplify";
import {
  confirmResetPassword,
  confirmSignUp,
  fetchAuthSession,
  resendSignUpCode,
  resetPassword,
  signIn,
  signOut,
  signUp as amplifySignUp,
} from "aws-amplify/auth";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      loginWith: { email: true },
      signUpVerificationMethod: "code",
    },
  },
});

function authFlowError(code: string, message: string): Error & { code: string } {
  const error = new Error(message) as Error & { code: string };
  error.name = code;
  error.code = code;
  return error;
}

// Turn a Cognito error (or any of its `code`s) into a sentence we can show. The
// raw SDK messages are mostly fine; this just smooths the few opaque ones.
export function authMessage(err: unknown): string {
  const e = err as { code?: string; name?: string; message?: string } | undefined;
  switch (e?.code ?? e?.name) {
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

export async function signUp(email: string, password: string, name?: string): Promise<void> {
  await amplifySignUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        ...(name ? { name } : {}),
      },
    },
  });
}

export async function confirmRegistration(email: string, code: string): Promise<void> {
  await confirmSignUp({
    username: email,
    confirmationCode: code,
    // Match the v5 default so confirming a reused email alias behaves as before.
    options: { forceAliasCreation: true },
  });
}

export async function resendCode(email: string): Promise<void> {
  await resendSignUpCode({ username: email });
}

export async function login(email: string, password: string): Promise<void> {
  const result = await signIn({ username: email, password });
  if (result.isSignedIn) return;

  switch (result.nextStep.signInStep) {
    case "CONFIRM_SIGN_UP":
      throw authFlowError("UserNotConfirmedException", "Your email isn't verified yet.");
    case "RESET_PASSWORD":
      throw authFlowError("PasswordResetRequiredException", "You need to reset your password.");
    default:
      throw authFlowError(
        "UnsupportedAuthChallenge",
        "This account requires an additional sign-in step that this app doesn't support yet.",
      );
  }
}

export async function logout(): Promise<void> {
  await signOut();
}

export async function forgotPassword(email: string): Promise<void> {
  await resetPassword({ username: email });
}

export async function confirmPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  await confirmResetPassword({
    username: email,
    confirmationCode: code,
    newPassword,
  });
}

// The current ID token, refreshed transparently via the stored refresh token
// when the 60-minute ID token has expired. null when signed out.
export async function getIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}
