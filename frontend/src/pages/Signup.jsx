import { useRef, useState } from "react"
import { useAuth } from "../contexts/useAuth.jsx"
import { useNavigate, Link } from "react-router-dom"
import Alert from "../components/Alert.jsx"
import GoogleButton from "../components/GoogleButton.jsx"
import "../styles/signup.css"

export default function Signup() {
    const nameRef = useRef()
    const emailRef = useRef()
    const passwordRef = useRef()
    const confirmpassRef = useRef()
    const { signup, signInWithGoogle, googleScriptLoaded } = useAuth()
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setSuccess("")

        const displayName = nameRef.current.value.trim()
        const email = emailRef.current.value
        const password = passwordRef.current.value
        const confirmPassword = confirmpassRef.current.value

        // Validation
        if (!displayName) {
            return setError("Please enter your name")
        }

        if (password.length < 6) {
            return setError("Password must be at least 6 characters")
        }

        if (password !== confirmPassword) {
            return setError("Passwords do not match")
        }

        try {
            setLoading(true)
            await signup(email, password, displayName)
            setSuccess("Account created successfully! Redirecting...")
            setTimeout(() => {
                navigate("/dashboard")
            }, 1000)
        } catch (error) {
            console.error("Signup error:", error)

            if (error.message.includes('already')) {
                setError("Email is already in use. Try logging in instead.")
            } else if (error.message.includes('email')) {
                setError("Please enter a valid email address.")
            } else if (error.message.includes('password')) {
                setError("Password is too weak. Choose a stronger password.")
            } else if (error.message.includes('network')) {
                setError("Network error. Please check your internet connection.")
            } else {
                setError(error.message || "Failed to create an account. Please try again.")
            }
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

            setTimeout(() => {
                navigate("/dashboard")
            }, 500)
        } catch (error) {
            console.error("Google sign-up error:", error)

            if (error.message.includes('popup')) {
                setError("Sign-up popup was closed or blocked. Please try again")
            } else if (error.message.includes('network')) {
                setError("Network error. Please check your internet connection")
            } else {
                setError(error.message || "Failed to sign up with Google. Please try again")
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
                        <input
                            type="text"
                            placeholder="Full Name"
                            ref={nameRef}
                            required
                            disabled={loading}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            ref={emailRef}
                            required
                            disabled={loading}
                        />
                        <input
                            type="password"
                            placeholder="Password (min. 6 characters)"
                            ref={passwordRef}
                            required
                            disabled={loading}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            ref={confirmpassRef}
                            required
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                        <div className="divider">OR</div>
                        <GoogleButton
                            onClick={handleGoogleSignUp}
                            text={loading ? "Connecting..." : "Sign up with Google"}
                            disabled={loading || !googleScriptLoaded}
                        />
                        <p>Already have an account? <Link to="/signin">Login</Link></p>
                    </form>
                </div>
            </div>
        </div>
    )
}
