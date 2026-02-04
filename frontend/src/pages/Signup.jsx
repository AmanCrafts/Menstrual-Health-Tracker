import { useState, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/useAuth.jsx';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

const Signup = () => {
    const { signup, signInWithGoogle, googleScriptLoaded } = useAuth();
    const nameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const confirmPasswordRef = useRef();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Password strength calculator
    const passwordStrength = useMemo(() => {
        if (!password) return { level: '', text: '' };

        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return { level: 'weak', text: 'Weak - Add more characters' };
        if (score <= 4) return { level: 'medium', text: 'Medium - Try adding numbers or symbols' };
        return { level: 'strong', text: 'Strong password!' };
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const displayName = nameRef.current.value.trim();
        const email = emailRef.current.value.trim();
        const passwordValue = passwordRef.current.value;
        const confirmPassword = confirmPasswordRef.current.value;

        // Validation
        if (!displayName) {
            return setError('Please enter your full name');
        }

        if (displayName.length < 2) {
            return setError('Name must be at least 2 characters long');
        }

        if (!email) {
            return setError('Please enter your email address');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return setError('Please enter a valid email address');
        }

        if (!passwordValue) {
            return setError('Please enter a password');
        }

        if (passwordValue.length < 6) {
            return setError('Password must be at least 6 characters long');
        }

        if (passwordValue !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setLoading(true);
            await signup(email, passwordValue, displayName);
            setSuccess('Account created successfully! Redirecting to dashboard...');

            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 1000);
        } catch (error) {
            console.error('Signup error:', error);

            // Handle specific error messages
            if (error.message.includes('already') || error.message.includes('exists')) {
                setError('An account with this email already exists. Try signing in instead.');
            } else if (error.message.includes('email') || error.message.includes('invalid')) {
                setError('Please enter a valid email address.');
            } else if (error.message.includes('password') || error.message.includes('weak')) {
                setError('Password is too weak. Please choose a stronger password.');
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                setError('Unable to connect to server. Please check your internet connection.');
            } else {
                setError(error.message || 'Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setError('');
        setSuccess('');

        try {
            setLoading(true);
            await signInWithGoogle();
            setSuccess('Google account connected! Redirecting...');

            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 500);
        } catch (error) {
            console.error('Google sign-up error:', error);

            if (error.message.includes('popup') || error.message.includes('closed')) {
                setError('Sign-up popup was closed. Please try again.');
            } else if (error.message.includes('network')) {
                setError('Network error. Please check your internet connection.');
            } else if (error.message.includes('not loaded')) {
                setError('Google sign-in is loading. Please try again in a moment.');
            } else {
                setError(error.message || 'Failed to sign up with Google. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Branding Side */}
                <div className="auth-branding">
                    <div className="auth-logo">
                        <img
                            src="/parllel-logo.png"
                            alt="FlowSync Logo"
                            className="auth-logo-img"
                        />
                    </div>

                    <div className="auth-branding-content">
                        <h2 className="auth-branding-title">Start Your Journey</h2>
                        <p className="auth-branding-text">
                            Join thousands who have taken control of their menstrual health. Create
                            your free account and discover personalized insights tailored just for
                            you.
                        </p>

                        <div className="auth-features">
                            <div className="auth-feature">
                                <i className="fas fa-heart"></i>
                                <span>Track symptoms & moods</span>
                            </div>
                            <div className="auth-feature">
                                <i className="fas fa-brain"></i>
                                <span>AI-powered predictions</span>
                            </div>
                            <div className="auth-feature">
                                <i className="fas fa-book-medical"></i>
                                <span>Health education resources</span>
                            </div>
                            <div className="auth-feature">
                                <i className="fas fa-user-shield"></i>
                                <span>100% private & secure</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="auth-form-side">
                    <div className="auth-form-header">
                        <h2>Create Account</h2>
                        <p>Fill in your details to get started</p>
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
                        {/* Name Input */}
                        <div className="auth-input-group">
                            <label htmlFor="name">Full Name</label>
                            <div className="auth-input-wrapper">
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Enter your full name"
                                    ref={nameRef}
                                    disabled={loading}
                                    autoComplete="name"
                                />
                                <i className="fas fa-user"></i>
                            </div>
                        </div>

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
                                    placeholder="Create a password (min. 6 characters)"
                                    ref={passwordRef}
                                    disabled={loading}
                                    autoComplete="new-password"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <i className="fas fa-lock"></i>
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    <i
                                        className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                                    ></i>
                                </button>
                            </div>
                            {password && (
                                <div className="password-strength">
                                    <div className="password-strength-bar">
                                        <div
                                            className={`password-strength-fill ${passwordStrength.level}`}
                                        ></div>
                                    </div>
                                    <span
                                        className={`password-strength-text ${passwordStrength.level}`}
                                    >
                                        {passwordStrength.text}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div className="auth-input-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="auth-input-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    placeholder="Confirm your password"
                                    ref={confirmPasswordRef}
                                    disabled={loading}
                                    autoComplete="new-password"
                                />
                                <i className="fas fa-lock"></i>
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex={-1}
                                >
                                    <i
                                        className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                                    ></i>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`auth-submit-btn ${loading ? 'auth-loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                'Creating account...'
                            ) : (
                                <>
                                    <i className="fas fa-user-plus"></i>
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">or continue with</div>

                    {/* Google Sign Up */}
                    <button
                        type="button"
                        className="auth-google-btn"
                        onClick={handleGoogleSignUp}
                        disabled={loading || !googleScriptLoaded}
                    >
                        <svg viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        {loading ? 'Connecting...' : 'Continue with Google'}
                    </button>

                    {/* Privacy Note */}
                    <div className="auth-privacy">
                        <i className="fas fa-shield-alt"></i>
                        <p>
                            By creating an account, you agree to keep your health data private and
                            secure.
                        </p>
                    </div>

                    {/* Sign In Link */}
                    <div className="auth-footer">
                        Already have an account? <Link to="/signin">Sign in here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
