import React, { useRef, useState } from "react"
import { useAuth } from "../contexts/useAuth.jsx"
import { useNavigate } from "react-router-dom"
import Alert from "../components/Alert.jsx"

export default function Signup() {
    const emailRef = useRef()
    const passwordRef = useRef()
    const confirmpassRef = useRef()
    const { signup } = useAuth()
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
                navigate("/")
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

    return (
        <>
            <div className="split-form">
                <div className="image-side">
                    <h2>Welcome Back!</h2>
                    <p>Enter your details to access your account</p>
                </div>
                <div className="form-side">
                    <h2>Sign Up</h2>
                    <Alert type="error" message={error} />
                    <Alert type="success" message={success} />

                    <form onSubmit={handleSubmit}>
                        <input type="email" placeholder="Email" ref={emailRef} required />
                        <input type="password" placeholder="Password" ref={passwordRef} required />
                        <input type="password" placeholder='Confirm Password' ref={confirmpassRef} required />
                        <button type="submit" disabled={loading}>
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                        <p>Already have an account? <a href="/signin">Login</a></p>
                    </form>
                </div>
            </div>
        </>
    )
}
