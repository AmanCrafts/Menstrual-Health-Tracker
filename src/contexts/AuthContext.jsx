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

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()
  const [loading, setLoading] = useState(true)

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  function logout() {
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
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
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