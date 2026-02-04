import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/education.css';

export default function PMSManagement() {
    return (
        <div className="article-page-container">
            <Link to="/education" className="back-to-education">
                <i className="fas fa-arrow-left"></i> Back to Education
            </Link>

            <article>
                <header className="article-header">
                    <h1>Managing PMS Symptoms</h1>
                    <div className="article-meta">
                        <span className="read-time">
                            <i className="fas fa-clock"></i> 5 min read
                        </span>
                        <span className="category">
                            <i className="fas fa-folder"></i> Menstrual Health
                        </span>
                    </div>
                </header>

                <div className="article-content-body">
                    <p>
                        Premenstrual Syndrome (PMS) refers to a combination of physical, emotional,
                        and behavioral symptoms that many women experience in the days leading up to
                        their period. While PMS is common, there are numerous strategies to help
                        manage and alleviate these symptoms.
                    </p>

                    <h2>Common PMS Symptoms</h2>
                    <p>PMS can manifest differently for everyone, but common symptoms include:</p>
                    <ul>
                        <li>Mood changes (irritability, anxiety, depression)</li>
                        <li>Fatigue and sleep disturbances</li>
                        <li>Headaches or migraines</li>
                        <li>Bloating and water retention</li>
                        <li>Breast tenderness</li>
                        <li>Food cravings</li>
                        <li>Abdominal cramps</li>
                        <li>Joint or muscle pain</li>
                        <li>Concentration difficulties</li>
                    </ul>

                    <h2>Lifestyle Approaches for Managing PMS</h2>

                    <h3>Nutrition</h3>
                    <p>What you eat can significantly impact PMS symptoms:</p>
                    <ul>
                        <li>
                            <strong>Reduce salt intake</strong> to minimize bloating and water
                            retention
                        </li>
                        <li>
                            <strong>Limit caffeine and alcohol</strong>, which can affect mood and
                            sleep
                        </li>
                        <li>
                            <strong>Eat smaller, more frequent meals</strong> to maintain stable
                            blood sugar
                        </li>
                        <li>
                            <strong>Increase calcium-rich foods</strong> (dairy, leafy greens,
                            fortified plant milks)
                        </li>
                        <li>
                            <strong>Consume magnesium-rich foods</strong> (nuts, seeds, whole
                            grains, dark chocolate)
                        </li>
                        <li>
                            <strong>Ensure adequate vitamin B6</strong> from fish, poultry,
                            potatoes, and bananas
                        </li>
                    </ul>

                    <h3>Physical Activity</h3>
                    <p>Regular exercise can help reduce PMS symptoms by:</p>
                    <ul>
                        <li>Releasing endorphins that improve mood</li>
                        <li>Reducing bloating and water retention</li>
                        <li>Decreasing fatigue and improving sleep quality</li>
                        <li>Alleviating cramps through increased circulation</li>
                    </ul>
                    <p>
                        Aim for at least 30 minutes of moderate activity most days. Walking,
                        swimming, cycling, and yoga are particularly beneficial during the
                        premenstrual phase.
                    </p>

                    <h3>Stress Management</h3>
                    <p>Stress can worsen PMS symptoms. Try these techniques:</p>
                    <ul>
                        <li>Meditation and mindfulness practices</li>
                        <li>Deep breathing exercises</li>
                        <li>Progressive muscle relaxation</li>
                        <li>Adequate sleep (7-9 hours nightly)</li>
                        <li>Time in nature</li>
                        <li>Journaling</li>
                    </ul>

                    <h2>Natural Remedies</h2>
                    <p>Some supplements and herbs may help manage PMS:</p>
                    <ul>
                        <li>
                            <strong>Calcium supplements</strong> (1000 mg daily)
                        </li>
                        <li>
                            <strong>Magnesium</strong> (300-400 mg daily)
                        </li>
                        <li>
                            <strong>Vitamin B6</strong> (50-100 mg daily)
                        </li>
                        <li>
                            <strong>Chasteberry (Vitex)</strong> for hormone balance
                        </li>
                        <li>
                            <strong>Evening primrose oil</strong> for breast tenderness
                        </li>
                    </ul>
                    <p>
                        <em>
                            Note: Always consult with a healthcare provider before starting any
                            supplements.
                        </em>
                    </p>

                    <h2>When to Seek Medical Help</h2>
                    <p>
                        If your PMS symptoms significantly interfere with your daily life, it might
                        be time to consult a healthcare provider. This is especially important if
                        you experience:
                    </p>
                    <ul>
                        <li>Severe depression or anxiety</li>
                        <li>Symptoms that don't improve with self-care</li>
                        <li>Premenstrual Dysphoric Disorder (PMDD) symptoms</li>
                    </ul>
                    <p>
                        Medical treatments may include hormonal contraceptives, antidepressants, or
                        anti-inflammatory medications, depending on your specific symptoms and
                        needs.
                    </p>

                    <h2>Tracking Makes a Difference</h2>
                    <p>
                        Using FlowSync to track your symptoms throughout your cycle can help you
                        identify patterns and determine which management strategies work best for
                        you. This information can also be valuable if you need to discuss your
                        symptoms with a healthcare provider.
                    </p>
                </div>
            </article>
        </div>
    );
}
