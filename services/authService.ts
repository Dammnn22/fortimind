
import * as fbAuth from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../firebase"; // Ensure firebase.ts exports these

export const loginWithGoogle = async (): Promise<fbAuth.UserCredential> => {
  try {
    const result = await fbAuth.signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error("Error al iniciar con Google:", error);
    throw error; // Re-throw to be caught by UI
  }
};

export const loginWithFacebook = async (): Promise<fbAuth.UserCredential> => {
  try {
    const result = await fbAuth.signInWithPopup(auth, facebookProvider);
    // You can access Facebook's access token if needed:
    // const credential = FacebookAuthProvider.credentialFromResult(result);
    // const token = credential.accessToken;
    return result;
  } catch (error) {
    console.error("Error al iniciar con Facebook:", error);
    throw error; // Re-throw to be caught by UI
  }
};
