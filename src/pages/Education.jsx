import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/education.css';

export default function Education() {
    // Education content categories
    const categories = [
        {
            id: 'basics',
            title: 'Menstrual Cycle Basics',
            description: 'Learn the fundamentals of your menstrual cycle and reproductive health.',
            articles: [
                {
                    id: 'understanding-cycle',
                    title: 'Understanding Your Menstrual Cycle',
                    summary: 'Learn about the four phases of the menstrual cycle and what happens in your body.',
                    image: '/images/education/cycle-phases.jpg',
                    readTime: '5 min'
                },
                {
                    id: 'hormones-explained',
                    title: 'Hormones and Your Cycle',
                    summary: 'Understand the key hormones that regulate your menstrual cycle.',
                    image: '/images/education/hormones.jpg',
                    readTime: '6 min'
                }
            ]
        },
        {
            id: 'products',
            title: 'Menstrual Products',
            description: 'Explore different menstrual products to find what works best for you.',
            articles: [
                {
                    id: 'product-guide',
                    title: 'Complete Guide to Menstrual Products',
                    summary: 'Compare different menstrual products including pads, tampons, cups, and period underwear.',
                    image: '/images/education/products.jpg',
                    readTime: '8 min'
                },
                {
                    id: 'sustainable-options',
                    title: 'Sustainable Period Products',
                    summary: 'Discover eco-friendly alternatives that are better for your body and the planet.',
                    image: '/images/education/sustainable.jpg',
                    readTime: '4 min'
                }
            ]
        },
        {
            id: 'health',
            title: 'Menstrual Health',
            description: 'Identify common issues and learn when to seek medical advice.',
            articles: [
                {
                    id: 'common-issues',
                    title: 'Common Menstrual Issues and Solutions',
                    summary: 'Learn about common problems such as cramps, irregular periods, and how to address them.',
                    image: '/images/education/health-issues.jpg',
                    readTime: '7 min'
                },
                {
                    id: 'pms-management',
                    title: 'Managing PMS Symptoms',
                    summary: 'Effective strategies to cope with premenstrual syndrome symptoms.',
                    image: '/images/education/pms.jpg',
                    readTime: '5 min'
                }
            ]
        }
    ];

    return (
        <div className="education-container">
            <div className="education-header">
                <h1>Menstrual Health Education</h1>
                <p>Explore our resources to better understand and manage your menstrual health</p>
            </div>

            {categories.map(category => (
                <section key={category.id} className="education-category">
                    <h2>{category.title}</h2>
                    <p className="category-description">{category.description}</p>

                    <div className="article-grid">
                        {category.articles.map(article => (
                            <Link
                                to={`/education/${category.id}/${article.id}`}
                                key={article.id}
                                className="article-card"
                            >
                                <div className="article-image">
                                    <div className="article-placeholder"></div>
                                </div>
                                <div className="article-content">
                                    <h3>{article.title}</h3>
                                    <p>{article.summary}</p>
                                    <div className="article-meta">
                                        <span className="read-time">
                                            <i className="fas fa-clock"></i> {article.readTime} read
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
