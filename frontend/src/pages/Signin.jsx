import { useState, useRef } from 'react'
import { useAuth } from '../contexts/useAuth.jsx'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import GoogleButton from '../components/GoogleButton.jsx'
import '../styles/signin.css'

const Signin = () => {
  const { signInWithGoogle, login, googleScriptLoaded } = useAuth()
  const emailRef = useRef()
  const passwordRef = useRef()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Get the page they were trying to visit, default to dashboard
  const from = location.state?.from?.pathname || '/dashboard'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const email = emailRef.current.value
    const password = passwordRef.current.value

    if (!email || !password) {
      return setError('Please fill in all fields')
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

      if (error.message.includes('Invalid')) {
        setError('Invalid email or password')
      } else if (error.message.includes('network')) {
        setError('Network error. Please check your internet connection')
      } else {
        setError(error.message || 'Failed to sign in. Please try again')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
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

      if (error.message.includes('popup')) {
        setError('Sign-in popup was closed or blocked. Please try again')
      } else if (error.message.includes('network')) {
        setError('Network error. Please check your internet connection')
      } else {
        setError(error.message || 'Failed to sign in with Google. Please try again')
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

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              ref={emailRef}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              ref={passwordRef}
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="divider">OR</div>

          <GoogleButton
            onClick={handleGoogleSignIn}
            text={loading ? "Connecting..." : "Sign in with Google"}
            disabled={loading || !googleScriptLoaded}
          />

          <div className="privacy-note">
            <i className="fas fa-shield-alt"></i>
            <p>We respect your privacy and will never share your personal data</p>
          </div>

          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signin