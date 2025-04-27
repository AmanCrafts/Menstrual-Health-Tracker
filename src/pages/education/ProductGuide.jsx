import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/education.css';

export default function ProductGuide() {
    return (
        <div className="article-page-container">
            <Link to="/education" className="back-to-education">
                <i className="fas fa-arrow-left"></i> Back to Education
            </Link>

            <article>
                <header className="article-header">
                    <h1>Complete Guide to Menstrual Products</h1>
                    <div className="article-meta">
                        <span className="read-time"><i className="fas fa-clock"></i> 8 min read</span>
                        <span className="category"><i className="fas fa-folder"></i> Menstrual Products</span>
                    </div>
                </header>

                <div className="article-content-body">
                    <p>
                        Finding the right menstrual products can significantly improve your period experience. There are more options available
                        than ever before, each with its own benefits and considerations. This guide will help you understand your choices.
                    </p>

                    <h2>Disposable Pads</h2>
                    <p>
                        Disposable pads are sheets of absorbent material that attach to your underwear. They come in various sizes, absorbency
                        levels, and designs.
                    </p>

                    <h3>Pros:</h3>
                    <ul>
                        <li>Easy to use and widely available</li>
                        <li>No insertion required</li>
                        <li>Can be worn overnight</li>
                        <li>Good for beginners</li>
                    </ul>

                    <h3>Cons:</h3>
                    <ul>
                        <li>Can feel bulky or uncomfortable</li>
                        <li>May shift position during activities</li>
                        <li>Environmental impact (most are not biodegradable)</li>
                        <li>Can cause irritation for some people</li>
                    </ul>

                    <h2>Tampons</h2>
                    <p>
                        Tampons are absorbent cylinders that are inserted into the vagina to absorb menstrual flow before it leaves the body.
                    </p>

                    <h3>Pros:</h3>
                    <ul>
                        <li>Can't be felt when inserted correctly</li>
                        <li>Allow for swimming and most physical activities</li>
                        <li>Less visible under clothing</li>
                        <li>Various absorbency levels available</li>
                    </ul>

                    <h3>Cons:</h3>
                    <ul>
                        <li>Requires insertion, which some find uncomfortable</li>
                        <li>Small risk of Toxic Shock Syndrome (TSS)</li>
                        <li>Need to be changed every 4-8 hours</li>
                        <li>Environmental impact</li>
                    </ul>

                    <h2>Menstrual Cups</h2>
                    <p>
                        Menstrual cups are flexible cups made of medical-grade silicone, rubber, or TPE that are inserted into the vagina to collect
                        menstrual flow rather than absorb it.
                    </p>

                    <h3>Pros:</h3>
                    <ul>
                        <li>Can be worn for up to 12 hours</li>
                        <li>Reusable for several years (eco-friendly)</li>
                        <li>Cost-effective over time</li>
                        <li>No risk of TSS when used properly</li>
                        <li>Doesn't dry out vaginal tissues</li>
                    </ul>

                    <h3>Cons:</h3>
                    <ul>
                        <li>Steeper learning curve for insertion and removal</li>
                        <li>Initial investment is higher</li>
                        <li>Requires washing between uses</li>
                        <li>Finding the right size can take trial and error</li>
                    </ul>

                    <h2>Period Underwear</h2>
                    <p>
                        Period underwear has built-in absorbent layers that trap menstrual fluid, eliminating the need for additional products.
                    </p>

                    <h3>Pros:</h3>
                    <ul>
                        <li>Comfortable and feels like regular underwear</li>
                        <li>Reusable and environmentally friendly</li>
                        <li>Good backup for other methods</li>
                        <li>No insertion required</li>
                    </ul>

                    <h3>Cons:</h3>
                    <ul>
                        <li>Higher upfront cost</li>
                        <li>Needs to be changed and washed daily</li>
                        <li>May not be sufficient for very heavy flow days</li>
                        <li>Can feel damp if absorbency is exceeded</li>
                    </ul>

                    <h2>Choosing What's Right for You</h2>
                    <p>
                        When selecting menstrual products, consider:
                    </p>
                    <ul>
                        <li>Your flow heaviness</li>
                        <li>Comfort preferences</li>
                        <li>Lifestyle and activities</li>
                        <li>Environmental concerns</li>
                        <li>Budget considerations</li>
                    </ul>

                    <p>
                        Many people use different products for different situations or combine methods. For example, using a menstrual cup during the day
                        and period underwear at night, or using tampons for swimming and pads for sleeping.
                    </p>

                    <p>
                        The best approach is to experiment with different options to find what works best for your body, lifestyle, and preferences.
                    </p>
                </div>
            </article>
        </div>
    );
}
