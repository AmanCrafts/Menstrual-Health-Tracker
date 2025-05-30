import React, { useRef, useState } from "react"
import { useAuth } from "../contexts/useAuth.jsx"
import { useNavigate } from "react-router-dom"
import Alert from "../components/Alert.jsx"
import GoogleButton from "../components/GoogleButton.jsx"
import "../styles/signup.css"

export default function Signup() {
    const emailRef = useRef()
    const passwordRef = useRef()
    const confirmpassRef = useRef()
    const { signup, signInWithGoogle } = useAuth()
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setSuccess("")

        // Password validation
        if (passwordRef.current.value.length < 6) {
            return setError("Password must be at least 6 characters")
        }

        if (passwordRef.current.value !== confirmpassRef.current.value) {
            return setError("Passwords do not match")
        }

        try {
            setLoading(true)
            await signup(emailRef.current.value, passwordRef.current.value)
            setSuccess("Account created successfully! Redirecting...")
            setTimeout(() => {
                navigate("/profile")
            }, 1500)
        } catch (error) {
            // Handle specific Firebase errors with user-friendly messages
            if (error.code === 'auth/email-already-in-use') {
                setError("Email is already in use. Try logging in instead.")
            } else if (error.code === 'auth/invalid-email') {
                setError("Email address is not valid.")
            } else if (error.code === 'auth/weak-password') {
                setError("Password is too weak. Choose a stronger password.")
            } else if (error.code === 'auth/network-request-failed') {
                setError("Network error. Please check your internet connection.")
            } else {
                setError("Failed to create an account. Please try again.")
            }
            console.error("Signup error:", error.code, error.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleGoogleSignUp() {
        setError("")
        setSuccess("")

        try {
            setLoading(true)
            console.log("Starting Google sign-up process...")
            await signInWithGoogle()
            setSuccess("Google account connected! Redirecting...")

            // Add a short delay to ensure token is properly stored before navigation
            setTimeout(() => {
                navigate("/profile")
            }, 500)
        } catch (error) {
            console.error("Full Google sign-up error:", error)

            if (error.code === 'auth/popup-closed-by-user') {
                setError("Sign-up cancelled by user")
            } else if (error.code === 'auth/network-request-failed') {
                setError("Network error. Please check your internet connection")
            } else if (error.code === 'auth/internal-error') {
                setError("An internal error occurred. Please try again")
            } else if (error.code === 'auth/popup-blocked') {
                setError("Popup was blocked by your browser. Please enable popups for this site")
            } else {
                setError("Failed to sign up with Google. Please try again")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="signup-container">
            <div className="split-form">
                <div className="image-side">
                    <h2>Track Your Cycle</h2>
                    <p>Join our community to track, understand, and take control of your menstrual health</p>
                </div>
                <div className="form-side">
                    <h2>Create an Account</h2>
                    <Alert type="error" message={error} />
                    <Alert type="success" message={success} />

                    <form onSubmit={handleSubmit}>
                        <input type="email" placeholder="Email" ref={emailRef} required />
                        <input
                            type="password"
                            placeholder="Password (min. 6 characters)"
                            ref={passwordRef}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            ref={confirmpassRef}
                            required
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                        <div className="divider">OR</div>
                        <GoogleButton
                            onClick={handleGoogleSignUp}
                            text="Sign up with Google"
                        />
                        <p>Already have an account? <a href="/signin">Login</a></p>
                    </form>
                </div>
            </div>
        </div>
    )
}
