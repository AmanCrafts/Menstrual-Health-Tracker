import React, { useState } from 'react'
import { useAuth } from '../contexts/useAuth.jsx'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import GoogleButton from '../components/GoogleButton.jsx'
import '../styles/signin.css'

const Signin = () => {
  const { signInWithGoogle } = useAuth()
  const [error, setError] = useState(``)
  const [success, setSuccess] = useState(``)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleGoogleSignIn() {
    setError(``)
    setSuccess(``)

    try {
      setLoading(true)
      await signInWithGoogle()
      setSuccess(`Google login successful! Redirecting...`)

      setTimeout(() => {
        navigate(`/profile`)
      }, 500)
    } catch (error) {
      console.error(`Google sign-in error:`, error)

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
      <div className="login-card">
        <div className="image-side">
          <div className="logo-container">
            <span className="logo-icon">🌸</span>
            <h1 className="logo-text">FlowSync</h1>
          </div>
          <h2>Welcome to FlowSync</h2>
          <p>Track, understand, and take control of your menstrual health with our comprehensive and secure platform.</p>
          <div className="features-list">
            <div className="feature-item"><i className="fas fa-calendar-check"></i> Accurate cycle tracking</div>
            <div className="feature-item"><i className="fas fa-chart-line"></i> Personalized insights</div>
            <div className="feature-item"><i className="fas fa-lock"></i> Privacy-focused design</div>
            <div className="feature-item"><i className="fas fa-book-open"></i> Educational resources</div>
          </div>
        </div>
        <div className="form-side">
          <h2>Sign In</h2>
          <Alert type="error" message={error} />
          <Alert type="success" message={success} />

          <div className="signin-content">
            <p className="signin-message">
              FlowSync uses Google for secure and convenient authentication.
              Your data remains private and under your control.
            </p>

            <GoogleButton
              onClick={handleGoogleSignIn}
              text={loading ? "Connecting..." : "Sign in with Google"}
              disabled={loading}
            />

            <div className="privacy-note">
              <i className="fas fa-shield-alt"></i>
              <p>We respect your privacy and will never share your personal data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signin