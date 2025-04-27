import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/education.css';

export default function Education() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        // In a real implementation, this would be an API call to fetch articles
        const fetchBlogPosts = async () => {
            setLoading(true);
            try {
                // This simulates fetching articles from pinkishe.org
                setArticles(pinkisheArticles);
            } catch (error) {
                console.error("Error fetching articles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogPosts();
    }, []);

    const categories = [
        { id: 'all', name: 'All Articles' },
        { id: 'menstrual-health', name: 'Menstrual Health' },
        { id: 'periods', name: 'Periods' },
        { id: 'hygiene', name: 'Hygiene' },
        { id: 'mental-health', name: 'Mental Health' },
        { id: 'reproductive-health', name: 'Reproductive Health' }
    ];

    const filteredArticles = selectedCategory === 'all'
        ? articles
        : articles.filter(article => article.category === selectedCategory);

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

            {loading ? (
                <div className="loading-spinner">Loading articles...</div>
            ) : (
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
                                    <span className="article-category">{getCategoryName(article.category)}</span>
                                    <span className="read-time">
                                        <i className="fas fa-clock"></i> {article.readTime || '5 min'} read
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );

    function getCategoryName(categoryId) {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'General';
    }
}

// Articles scraped from pinkishe.org
const pinkisheArticles = [
    {
        id: 'menstrual-hygiene-day',
        title: 'Menstrual Hygiene Day',
        excerpt: 'Menstrual Hygiene Day is an annual awareness day that aims to highlight the importance of menstrual hygiene management.',
        category: 'hygiene',
        readTime: '5 min',
        imageUrl: 'https://www.pinkishe.org/uploads/8/3/9/0/83901006/published/menstrual-hygiene-day.jpg?1622437945'
    },
    {
        id: 'endometriosis',
        title: 'Endometriosis',
        excerpt: 'Endometriosis is a condition where tissue similar to the lining of the womb grows in other places, such as the ovaries and fallopian tubes.',
        category: 'reproductive-health',
        readTime: '7 min',
        imageUrl: 'https://www.pinkishe.org/uploads/8/3/9/0/83901006/endometriosis_orig.jpg'
    },
    {
        id: 'myths-about-menstruation',
        title: 'Myths About Menstruation',
        excerpt: 'Despite being a natural biological process, menstruation is surrounded by numerous myths and misconceptions across cultures.',
        category: 'menstrual-health',
        readTime: '6 min',
        imageUrl: 'https://www.pinkishe.org/uploads/8/3/9/0/83901006/published/myths-of-menstruation.jpg?1612760203'
    },
    {
        id: 'good-touch-bad-touch',
        title: 'Good Touch Bad Touch',
        excerpt: 'Understanding the difference between appropriate and inappropriate physical contact is crucial for personal safety.',
        category: 'mental-health',
        readTime: '4 min',
        imageUrl: 'https://www.pinkishe.org/uploads/8/3/9/0/83901006/published/goodtouchbadtouch.png?1593166473'
    },
    {
        id: 'polycystic-ovary-syndrome',
        title: 'Polycystic Ovary Syndrome (PCOS)',
        excerpt: 'PCOS is a hormonal disorder common among women of reproductive age that can affect fertility and overall health.',
        category: 'reproductive-health',
        readTime: '8 min',
        imageUrl: 'https://www.pinkishe.org/uploads/8/3/9/0/83901006/pcos_orig.jpg'
    },
    {
        id: 'periods-and-pregnancy',
        title: 'Periods and Pregnancy',
        excerpt: 'Understanding the relationship between menstrual cycles and fertility is essential for family planning.',
        category: 'periods',
        readTime: '6 min',
        imageUrl: 'https://www.pinkishe.org/uploads/8/3/9/0/83901006/periods-and-pregnancy_orig.jpg'
    },
    {
        id: 'feminine-hygiene',
        title: 'Feminine Hygiene',
        excerpt: 'Proper feminine hygiene practices are important for preventing infections and maintaining overall reproductive health.',
        category: 'hygiene',
        readTime: '5 min',
        imageUrl: 'https://www.pinkishe.org/uploads/8/3/9/0/83901006/feminine-hygiene_orig.jpg'
    },
    {
        id: 'premenstrual-syndrome',
        title: 'Premenstrual Syndrome (PMS)',
        excerpt: 'PMS refers to physical and emotional symptoms that occur before the start of a period, affecting many women.',
        category: 'menstrual-health',
        readTime: '6 min',
        imageUrl: 'https://www.pinkishe.org/uploads/8/3/9/0/83901006/pms_orig.jpg'
    },
    {
        id: 'menstrual-cup',
        title: 'The Menstrual Cup Guide',
        excerpt: 'Menstrual cups are an eco-friendly, reusable alternative to traditional period products like pads and tampons.',
        category: 'periods',
        readTime: '7 min',
        imageUrl: 'https://www.pinkishe.org/uploads/8/3/9/0/83901006/menstrualcup_orig.jpg'
    },
    {
        id: 'reproductive-health-problems',
        title: 'Common Reproductive Health Problems',
        excerpt: 'Understanding common reproductive health issues can help with early detection and treatment.',
        category: 'reproductive-health',
        readTime: '8 min',
        imageUrl: 'https://www.pinkishe.org/uploads/8/3/9/0/83901006/published/reproductivehealth.jpg?1590557078'
    },
    {
        id: 'menstrual-health-taboos',
        title: 'Breaking Menstrual Health Taboos',
        excerpt: 'Cultural taboos around menstruation can lead to shame, misinformation, and unhealthy practices.',
        category: 'menstrual-health',
        readTime: '6 min',
        imageUrl: 'https://www.pinkishe.org/uploads/8/3/9/0/83901006/published/taboos.jpg?1590557054'
    },
    {
        id: 'hormonal-imbalance',
        title: 'Understanding Hormonal Imbalance',
        excerpt: 'Hormonal imbalances can affect menstrual cycles, mood, and overall health in various ways.',
        category: 'menstrual-health',
        readTime: '7 min',
        imageUrl: 'https://www.pinkishe.org/uploads/8/3/9/0/83901006/published/hormonalimbalance.jpg?1590557030'
    }
];
