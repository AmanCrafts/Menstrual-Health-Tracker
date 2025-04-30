import React, { useRef, useState } from 'react'
import { useAuth } from '../contexts/useAuth.jsx'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import GoogleButton from '../components/GoogleButton.jsx'
import '../styles/signin.css'

const Signin = () => {
  const emailRef = useRef()
  const passwordRef = useRef()
  const { login, signInWithGoogle } = useAuth()
  const [error, setError] = useState(``)
  const [success, setSuccess] = useState(``)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(``)
    setSuccess(``)

    try {
      setLoading(true)
      await login(emailRef.current.value, passwordRef.current.value)
      setSuccess(`Login successful! Redirecting...`)
      setTimeout(() => {
        navigate(`/profile`)
      }, 1500)
    } catch (error) {

      if (error.code === `auth/user-not-found` || error.code === `auth/wrong-password`) {
        setError(`Incorrect email or password`)
      } else if (error.code === `auth/invalid-email`) {
        setError(`Email address is not valid`)
      } else if (error.code === `auth/user-disabled`) {
        setError(`This account has been disabled`)
      } else if (error.code === `auth/too-many-requests`) {
        setError(`Too many failed login attempts. Please try again later`)
      } else if (error.code === `auth/network-request-failed`) {
        setError(`Network error. Please check your internet connection`)
      } else {
        setError(`Failed to sign in. Please try again`)
      }
      console.error(`Login error:`, error.code, error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setError(``)
    setSuccess(``)

    try {
      setLoading(true)
      console.log(`Starting Google sign-in process...`)
      await signInWithGoogle()
      setSuccess(`Google login successful! Redirecting...`)

      // Add a short delay to ensure token is properly stored before navigation
      setTimeout(() => {
        navigate(`/profile`)
      }, 500)
    } catch (error) {
      console.error(`Full Google sign-in error:`, error)

      if (error.code === `auth/popup-closed-by-user`) {
        setError(`Sign-in cancelled by user`)
      } else if (error.code === `auth/network-request-failed`) {
        setError(`Network error. Please check your internet connection`)
      } else if (error.code === `auth/internal-error`) {
        setError(`An internal error occurred. Please try again`)
      } else if (error.code === `auth/popup-blocked`) {
        setError(`Popup was blocked by your browser. Please enable popups for this site`)
      } else {
        setError(`Failed to sign in with Google. Please try again`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signin-container">
      <div className="split-form">
        <div className="image-side">
          <h2>Welcome Back!</h2>
          <p>Track your cycle and feel empowered with every insight</p>
        </div>
        <div className="form-side">
          <h2>Sign In</h2>
          <Alert type="error" message={error} />
          <Alert type="success" message={success} />
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              ref={emailRef}
              required
            />
            <input
              type="password"
              placeholder="Password"
              ref={passwordRef}
              required
            />
            <div className="forgot-password">
              <a href="/reset-password">Forgot Password?</a>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? `Signing In...` : `Login`}
            </button>
            <div className="divider">OR</div>
            <GoogleButton
              onClick={handleGoogleSignIn}
              text={`Sign in with Google`}
            />
            <p>Don't have an account? <a href="/signup">Sign Up</a></p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signin