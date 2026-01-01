import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';


export default function Home() {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Track Your Cycle.<br />Understand Your Body.</h1>
                    <p className="hero-subtitle">
                        FlowSync helps you monitor your menstrual health with personalized insights,
                        symptom tracking, and intuitive analytics.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/signin" className="primary-button">Get Started</Link>
                        <Link to="/education" className="secondary-button">Learn More</Link>
                    </div>
                </div>
                <div className="hero-image">
                    <img src="/hero-image.png" alt="Woman using FlowSync app" />
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Track What Matters</h2>
                    <p>Comprehensive tools to monitor your menstrual health</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-calendar-alt"></i>
                        </div>
                        <h3>Period Tracking</h3>
                        <p>Log and predict your cycles with accuracy based on your unique patterns</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <h3>Personalized Insights</h3>
                        <p>Gain understanding about your cycle, symptoms, and patterns over time</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-notes-medical"></i>
                        </div>
                        <h3>Symptom Monitoring</h3>
                        <p>Track physical and emotional symptoms throughout your cycle</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-lock"></i>
                        </div>
                        <h3>Private & Secure</h3>
                        <p>Your data stays private with optional Google Drive backup</p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works-section">
                <div className="section-header">
                    <h2>How FlowSync Works</h2>
                    <p>Simple, intuitive cycle tracking in just a few steps</p>
                </div>
                <div className="steps-container">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h3>Sign Up</h3>
                        <p>Create your account using email or Google authentication</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h3>Complete Your Profile</h3>
                        <p>Enter your cycle details to personalize predictions</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h3>Log Your Cycle</h3>
                        <p>Record periods, symptoms, and notes throughout your cycle</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">4</div>
                        <h3>Get Insights</h3>
                        <p>View analytics and predictions based on your unique patterns</p>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section">
                <div className="benefits-content">
                    <div className="section-header">
                        <h2>Why Track Your Cycle?</h2>
                        <p>Understanding your menstrual health empowers you to:</p>
                    </div>
                    <ul className="benefits-list">
                        <li><i className="fas fa-check"></i> Predict your next period with accuracy</li>
                        <li><i className="fas fa-check"></i> Identify patterns in symptoms and mood</li>
                        <li><i className="fas fa-check"></i> Plan activities around your cycle phases</li>
                        <li><i className="fas fa-check"></i> Recognize changes that might need medical attention</li>
                        <li><i className="fas fa-check"></i> Make informed decisions about your reproductive health</li>
                        <li><i className="fas fa-check"></i> Communicate effectively with healthcare providers</li>
                    </ul>
                    <Link to="/signin" className="primary-button">Start Tracking Today</Link>
                </div>
                <div className="benefits-image">
                    <img src="/benefits-image.png" alt="Woman feeling empowered" />
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <div className="section-header">
                    <h2>Frequently Asked Questions</h2>
                    <p>Common questions about FlowSync and menstrual tracking</p>
                </div>
                <div className="faq-grid">
                    <div className="faq-item">
                        <h3>Is my data private?</h3>
                        <p>Yes, your data is completely private. We offer secure local storage and optional Google Drive backup (which only you can access).</p>
                    </div>
                    <div className="faq-item">
                        <h3>How accurate are the predictions?</h3>
                        <p>Predictions improve over time as you log more cycles. Most users report high accuracy after logging 3+ cycles.</p>
                    </div>
                    <div className="faq-item">
                        <h3>Do I need to create an account?</h3>
                        <p>Yes, a free account is required to use FlowSync. This ensures your data can be safely stored and accessed.</p>
                    </div>
                    <div className="faq-item">
                        <h3>Can I use this if I have irregular periods?</h3>
                        <p>Absolutely! FlowSync is especially helpful for those with irregular cycles, as it helps identify patterns over time.</p>
                    </div>
                </div>
            </section>


            <section className="cta-section">
                <h2>Ready to take control of your menstrual health?</h2>
                <p>Join thousands of women who track their cycles with FlowSync</p>
                <Link to="/signin" className="primary-button">Sign In Now</Link>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <img src="/parllel-logo.png" alt="FlowSync" className="logo-icon-img" />
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">Terms of Service</a></li>
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Contact</a></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4>Resources</h4>
                            <ul>
                                <li><Link to="/education">Education</Link></li>
                                <li><a href="#">Blog</a></li>
                                <li><a href="#">Support</a></li>
                                <li><a href="#">FAQ</a></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4>Connect</h4>
                            <ul className="social-links">
                                <li><a href="#"><i className="fab fa-facebook"></i></a></li>
                                <li><a href="#"><i className="fab fa-twitter"></i></a></li>
                                <li><a href="#"><i className="fab fa-instagram"></i></a></li>
                                <li><a href="#"><i className="fab fa-linkedin"></i></a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} FlowSync. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
