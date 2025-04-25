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

// Token storage key in localStorage
const TOKEN_STORAGE_KEY = "flowsync_google_token";

// this is the context for authentication
export const AuthContext = createContext()

export function AuthProvider({ children }) {
  // these are state variables that keep track of things
  const [currentUser, setCurrentUser] = useState()
  const [loading, setLoading] = useState(true)

  // Initialize token from localStorage if available
  const [googleAuthToken, setGoogleAuthToken] = useState(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      return savedToken || null;
    } catch (error) {
      console.error("Error reading token from localStorage:", error);
      return null;
    }
  })

  // Save token to localStorage whenever it changes
  useEffect(() => {
    try {
      if (googleAuthToken) {
        console.log("Saving token to localStorage:", googleAuthToken.substring(0, 10) + '...');
        localStorage.setItem(TOKEN_STORAGE_KEY, googleAuthToken);
        // Also set it in the service
        setAccessToken(googleAuthToken);
      } else {
        console.log("Removing token from localStorage");
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error saving token to localStorage:", error);
    }
  }, [googleAuthToken]);

  // this creates a new user with email and password
  // it uses firebase which is a google service
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  // this logs in with email and password
  // it's pretty simple actually
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // this does google login, which is complicated
  async function signInWithGoogle() {
    // Create a Google provider with additional scopes for Drive access
    const provider = new GoogleAuthProvider()

    // Add scopes needed for Drive access
    provider.addScope('https://www.googleapis.com/auth/drive.file')
    provider.addScope('https://www.googleapis.com/auth/drive.appdata')

    // Set custom parameters to always prompt for consent
    provider.setCustomParameters({
      prompt: 'consent',
      access_type: 'offline'  // Request a refresh token
    })

    try {
      console.log("Initiating Google auth popup...")
      const result = await signInWithPopup(auth, provider)

      // This gives you a Google Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const token = credential.accessToken

      if (!token) {
        console.error('Google sign-in succeeded but no access token was returned');
        return result;
      }

      console.log('Google sign-in successful with access token:', token.substring(0, 10) + '...');

      // Store the token in state and for Drive operations
      setGoogleAuthToken(token)
      setAccessToken(token)

      // Force save to localStorage for immediate persistence
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      console.log('Token saved to localStorage and provided to Drive service');

      // Wait a moment to ensure token is properly processed
      await new Promise(resolve => setTimeout(resolve, 500));

      return result
    } catch (error) {
      console.error('Google sign-in error:', error)
      throw error
    }
  }

  // this logs the user out
  // and clears the token so they can't use drive anymore
  function logout() {
    // Clear the token when logging out
    setGoogleAuthToken(null)
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return signOut(auth)
  }

  // this helps reset password for forgetful users
  // it sends them an email
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email)
  }

  // this lets users change their email
  // haven't tested this much yet
  function updateEmail(email) {
    return firebaseUpdateEmail(currentUser, email)
  }

  // this lets users change their password
  // also haven't tested this much
  function updatePassword(password) {
    return firebaseUpdatePassword(currentUser, password)
  }

  // this runs when the component loads
  // it sets up an event listener for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      console.log("Auth state changed, user:", user ? "logged in" : "logged out");
      setCurrentUser(user)

      // If we have a token in localStorage, set it when auth state changes
      if (user && user.providerData && user.providerData.some(provider => provider.providerId === 'google.com')) {
        try {
          const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

          if (savedToken) {
            // If we already have a token in state, don't overwrite it
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
        // User logged out, ensure token is cleared
        setGoogleAuthToken(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }

      setLoading(false)
    })

    return unsubscribe
  }, [googleAuthToken])

  // this is what we provide to components
  // it has all the auth functions
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