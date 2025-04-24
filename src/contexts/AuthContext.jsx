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

// this is the context for authentication
// i learned about contexts recently, they're cool!
export const AuthContext = createContext()

export function AuthProvider({ children }) {
  // these are state variables that keep track of things
  const [currentUser, setCurrentUser] = useState()
  const [loading, setLoading] = useState(true)
  const [googleAuthToken, setGoogleAuthToken] = useState(null)

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
  // i had to look up how to do this!!
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
      const result = await signInWithPopup(auth, provider)

      // This gives you a Google Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const token = credential.accessToken

      // Store the token in state and for Drive operations
      setGoogleAuthToken(token)
      setAccessToken(token)

      console.log('Google sign-in successful with access token')
      return result
    } catch (error) {
      console.error('Google sign-in error:', error)
      throw error
    }
  }

  // this logs the user out
  // and clears the token so they can't use drive anymore
  function logout() {
    setGoogleAuthToken(null)
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
      setCurrentUser(user)
      setLoading(false)

      // Check if user has signed in with Google
      if (user && user.providerData.some(provider => provider.providerId === 'google.com')) {
        // If we have a google token saved from sign in, use it
        if (googleAuthToken) {
          setAccessToken(googleAuthToken)
        } else {
          // User might have refreshed the page, handle token refresh here
          // For simplicity, let's just notify that they may need to sign in again
          console.log('User signed in with Google but no token available. Drive access may be limited.')
        }
      }
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