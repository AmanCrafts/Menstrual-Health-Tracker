import { useState, useRef } from 'react'
import { useAuth } from '../contexts/useAuth.jsx'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import '../styles/auth.css'

const Signin = () => {
  const { signInWithGoogle, login, googleScriptLoaded } = useAuth()
  const emailRef = useRef()
  const passwordRef = useRef()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Get the page they were trying to visit, default to dashboard
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const email = emailRef.current.value.trim()
    const password = passwordRef.current.value

    // Validation
    if (!email) {
      return setError('Please enter your email address')
    }

    if (!password) {
      return setError('Please enter your password')
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return setError('Please enter a valid email address')
    }

    try {
      setLoading(true)
      await login(email, password)
      setSuccess('Login successful! Redirecting...')

      setTimeout(() => {
        navigate(from, { replace: true })
      }, 500)
    } catch (error) {
      console.error('Login error:', error)

      // Handle specific error messages
      if (error.message.includes('Invalid') || error.message.includes('password')) {
        setError('Invalid email or password. Please try again.')
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        setError('Unable to connect to server. Please check your internet connection.')
      } else if (error.message.includes('not found') || error.message.includes('exist')) {
        setError('No account found with this email. Please sign up first.')
      } else {
        setError(error.message || 'Failed to sign in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setSuccess('')

    try {
      setLoading(true)
      await signInWithGoogle()
      setSuccess('Google login successful! Redirecting...')

      setTimeout(() => {
        navigate(from, { replace: true })
      }, 500)
    } catch (error) {
      console.error('Google sign-in error:', error)

      if (error.message.includes('popup') || error.message.includes('closed')) {
        setError('Sign-in popup was closed. Please try again.')
      } else if (error.message.includes('network')) {
        setError('Network error. Please check your internet connection.')
      } else if (error.message.includes('not loaded')) {
        setError('Google sign-in is loading. Please try again in a moment.')
      } else {
        setError(error.message || 'Failed to sign in with Google. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Branding Side */}
        <div className="auth-branding">
          <div className="auth-logo">
            <img src="/parllel-logo.png" alt="FlowSync Logo" className="auth-logo-img" />
          </div>

          <div className="auth-branding-content">
            <h2 className="auth-branding-title">Welcome Back!</h2>
            <p className="auth-branding-text">
              Continue your journey to better health awareness.
              Track, understand, and take control of your menstrual health
              with personalized insights.
            </p>

            <div className="auth-features">
              <div className="auth-feature">
                <i className="fas fa-calendar-check"></i>
                <span>Accurate cycle predictions</span>
              </div>
              <div className="auth-feature">
                <i className="fas fa-chart-line"></i>
                <span>Personalized health insights</span>
              </div>
              <div className="auth-feature">
                <i className="fas fa-shield-alt"></i>
                <span>Your data stays private</span>
              </div>
              <div className="auth-feature">
                <i className="fas fa-bell"></i>
                <span>Smart reminders & alerts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="auth-form-side">
          <div className="auth-form-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="auth-alert error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="auth-alert success">
              <i className="fas fa-check-circle"></i>
              <span>{success}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="auth-input-group">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrapper">
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  ref={emailRef}
                  disabled={loading}
                  autoComplete="email"
                />
                <i className="fas fa-envelope"></i>
              </div>
            </div>

            {/* Password Input */}
            <div className="auth-input-group">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  ref={passwordRef}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <i className="fas fa-lock"></i>
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`auth-submit-btn ${loading ? 'auth-loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Signing in...' : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">or continue with</div>

          {/* Google Sign In */}
          <button
            type="button"
            className="auth-google-btn"
            onClick={handleGoogleSignIn}
            disabled={loading || !googleScriptLoaded}
          >
            <svg viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {/* Privacy Note */}
          <div className="auth-privacy">
            <i className="fas fa-shield-alt"></i>
            <p>Your privacy is our priority. We never share your personal data with third parties.</p>
          </div>

          {/* Sign Up Link */}
          <div className="auth-footer">
            Don't have an account? <Link to="/signup">Create one now</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signin