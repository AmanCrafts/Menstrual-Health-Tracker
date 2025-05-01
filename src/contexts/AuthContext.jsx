import React, { useState, useEffect, createContext } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth"
import { auth } from "../configs/firebase.jsx"
import { setAccessToken } from "../services/googleDriveService"

const TOKEN_STORAGE_KEY = "flowsync_google_token";
export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()
  const [loading, setLoading] = useState(true)

  const [googleAuthToken, setGoogleAuthToken] = useState(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      return savedToken || null;
    } catch (error) {
      console.error("Error reading token from localStorage:", error);
      return null;
    }
  })

  useEffect(() => {
    try {
      if (googleAuthToken) {
        console.log("Saving token to localStorage:", googleAuthToken.substring(0, 10) + '...');
        localStorage.setItem(TOKEN_STORAGE_KEY, googleAuthToken);
        setAccessToken(googleAuthToken);
      } else {
        console.log("Removing token from localStorage");
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error saving token to localStorage:", error);
    }
  }, [googleAuthToken]);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    provider.addScope('https://www.googleapis.com/auth/drive.file')
    provider.addScope('https://www.googleapis.com/auth/drive.appdata')
    provider.setCustomParameters({
      prompt: 'consent',
      access_type: 'offline'
    })

    try {
      console.log("Initiating Google auth popup...")
      const result = await signInWithPopup(auth, provider)

      const credential = GoogleAuthProvider.credentialFromResult(result)
      const token = credential.accessToken

      if (!token) {
        console.error('Google sign-in succeeded but no access token was returned');
        return result;
      }

      console.log('Google sign-in successful with access token:', token.substring(0, 10) + '...');

      setGoogleAuthToken(token)
      setAccessToken(token)

      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      console.log('Token saved to localStorage and provided to Drive service');

      await new Promise(resolve => setTimeout(resolve, 500));

      return result
    } catch (error) {
      console.error('Google sign-in error:', error)
      throw error
    }
  }

  function logout() {
    setGoogleAuthToken(null)
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return signOut(auth)
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email)
  }

  function updateEmail(email) {
    return firebaseUpdateEmail(currentUser, email)
  }

  function updatePassword(password) {
    return firebaseUpdatePassword(currentUser, password)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      console.log("Auth state changed, user:", user ? "logged in" : "logged out");
      setCurrentUser(user)

      if (user && user.providerData && user.providerData.some(provider => provider.providerId === 'google.com')) {
        try {
          const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

          if (savedToken) {
            if (!googleAuthToken) {
              console.log('Retrieved Google token from storage:', savedToken.substring(0, 10) + '...');
              setGoogleAuthToken(savedToken);
              setAccessToken(savedToken);
            }
          } else {
            console.log('User signed in with Google but no token available in storage.');
          }
        } catch (error) {
          console.error("Error retrieving token from localStorage:", error);
        }
      } else if (!user) {
        setGoogleAuthToken(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }

      setLoading(false)
    })

    return unsubscribe
  }, [googleAuthToken])

  const value = {
    currentUser,
    googleAuthToken,
    login,
    signup,
    signInWithGoogle,
    logout,
    resetPassword,
    updateEmail,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}