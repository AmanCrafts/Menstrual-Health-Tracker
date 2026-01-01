import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { articleContent } from './education/articleContent';
import '../styles/education.css';

export default function Education() {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', name: 'All Articles' },
        { id: 'Menstrual Health', name: 'Menstrual Health' },
        { id: 'Periods', name: 'Periods' },
        { id: 'Reproductive Health', name: 'Reproductive Health' }
    ];

    const filteredArticles = selectedCategory === 'all'
        ? articleContent
        : articleContent.filter(article => article.category === selectedCategory);

    return (
        <div className="education-container">
            <div className="education-hero">
                <h1>Menstrual Health Education</h1>
                <p>Explore our resources to better understand and manage your menstrual health</p>
            </div>

            <div className="category-filter">
                {categories.map(category => (
                    <button
                        key={category.id}
                        className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category.id)}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            <div className="article-grid">
                {filteredArticles.map(article => (
                    <Link
                        to={`/education/article/${article.id}`}
                        key={article.id}
                        className="article-card"
                    >
                        <div className="article-image">
                            {article.imageUrl ? (
                                <img src={article.imageUrl} alt={article.title} />
                            ) : (
                                <div className="article-placeholder"></div>
                            )}
                        </div>
                        <div className="article-content">
                            <h3>{article.title}</h3>
                            <p className="article-excerpt">{article.excerpt}</p>
                            <div className="article-meta">
                                <span className="article-category">{article.category}</span>
                                <span className="read-time">
                                    <i className="fas fa-clock"></i> {article.readTime} read
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
