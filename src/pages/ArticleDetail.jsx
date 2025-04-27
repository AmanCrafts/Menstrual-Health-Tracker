import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../styles/education.css';

export default function ArticleDetail() {
    const { articleId } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                // In a real app, you would call an API here
                // For now, we'll simulate by finding the article from our array
                import('./education/articleContent').then(module => {
                    const foundArticle = module.articleContent.find(a => a.id === articleId);
                    if (foundArticle) {
                        setArticle(foundArticle);
                    } else {
                        navigate('/education');
                    }
                    setLoading(false);
                }).catch(error => {
                    console.error("Could not load article content:", error);
                    setLoading(false);
                    navigate('/education');
                });
            } catch (error) {
                console.error("Error fetching article:", error);
                setLoading(false);
                navigate('/education');
            }
        };

        fetchArticle();
    }, [articleId, navigate]);

    if (loading) {
        return <div className="loading-spinner">Loading article...</div>;
    }

    if (!article) {
        return <div className="loading-spinner">Article not found</div>;
    }

    return (
        <div className="article-page-container">
            <Link to="/education" className="back-to-education">
                <i className="fas fa-arrow-left"></i> Back to Articles
            </Link>

            <article>
                <header className="article-header">
                    <h1>{article.title}</h1>
                    <div className="article-meta-full">
                        <span className="article-meta-item">
                            <i className="fas fa-folder"></i> {article.category}
                        </span>
                        <span className="article-meta-item">
                            <i className="fas fa-clock"></i> {article.readTime || '5 min'} read
                        </span>
                    </div>
                </header>

                {article.imageUrl && (
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="article-featured-image"
                    />
                )}

                <div
                    className="article-content-full"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />
            </article>
        </div>
    );
}
