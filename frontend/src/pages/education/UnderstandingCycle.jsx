import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/education.css';

export default function UnderstandingCycle() {
    return (
        <div className="article-page-container">
            <Link to="/education" className="back-to-education">
                <i className="fas fa-arrow-left"></i> Back to Education
            </Link>

            <article>
                <header className="article-header">
                    <h1>Understanding Your Menstrual Cycle</h1>
                    <div className="article-meta">
                        <span className="read-time"><i className="fas fa-clock"></i> 5 min read</span>
                        <span className="category"><i className="fas fa-folder"></i> Menstrual Cycle Basics</span>
                    </div>
                </header>

                <div className="article-content-body">
                    <p>
                        The menstrual cycle is a natural process that your body goes through to prepare for potential pregnancy.
                        Understanding this cycle can help you track symptoms, plan activities, and identify any irregularities that might
                        indicate health issues.
                    </p>

                    <h2>The Four Phases of the Menstrual Cycle</h2>

                    <h3>1. Menstruation Phase (Days 1-5)</h3>
                    <p>
                        Your cycle begins with the first day of your period. During this phase, the uterine lining that built up in the previous cycle
                        sheds through the vagina if pregnancy didn't occur. This phase typically lasts 3-7 days, with the heaviest flow usually
                        occurring in the first 1-2 days.
                    </p>

                    <h3>2. Follicular Phase (Days 1-13)</h3>
                    <p>
                        This phase overlaps with menstruation and continues until ovulation. Your body releases follicle-stimulating hormone (FSH),
                        which stimulates the ovaries to produce follicles. Each follicle contains an immature egg. Usually, one follicle will become
                        dominant and continue to mature, while the others will be reabsorbed.
                    </p>

                    <h3>3. Ovulation Phase (Day 14, approximately)</h3>
                    <p>
                        Ovulation occurs when the mature egg is released from the ovary into the fallopian tube. This typically happens around day 14
                        in a 28-day cycle, but can vary widely between individuals. During this time, your body temperature may slightly increase, and
                        you might notice changes in cervical mucus.
                    </p>

                    <h3>4. Luteal Phase (Days 15-28)</h3>
                    <p>
                        After ovulation, the ruptured follicle transforms into the corpus luteum, which produces progesterone. This hormone helps thicken
                        the uterine lining in preparation for a potential fertilized egg. If pregnancy doesn't occur, the corpus luteum will break down,
                        hormone levels will drop, and your next period will begin.
                    </p>

                    <h2>Common Cycle Lengths and Variations</h2>
                    <p>
                        While a 28-day cycle is often cited as the average, menstrual cycles can range from 21 to 35 days and still be considered normal.
                        Your cycle length may also change throughout your life due to factors like age, stress, weight changes, or medical conditions.
                    </p>

                    <h2>Tracking Your Cycle</h2>
                    <p>
                        Keeping track of your cycle can help you:
                    </p>
                    <ul>
                        <li>Predict when your next period will start</li>
                        <li>Identify patterns in symptoms</li>
                        <li>Plan activities around your cycle</li>
                        <li>Notice irregularities that might indicate health issues</li>
                        <li>Prepare for fertility or contraception needs</li>
                    </ul>

                    <p>
                        FlowSync provides comprehensive tools to track your menstrual cycle, including period dates, symptoms, and notes to help you
                        better understand your body's patterns and needs.
                    </p>
                </div>
            </article>
        </div>
    );
}
