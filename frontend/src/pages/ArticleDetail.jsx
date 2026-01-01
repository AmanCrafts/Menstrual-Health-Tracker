import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { articleContent } from './education/articleContent';
import '../styles/education.css';

export default function ArticleDetail() {
    const { articleId } = useParams();
    const article = articleContent.find(a => a.id === articleId);

    if (!article) {
        return <Navigate to="/education" replace />;
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
                            <i className="fas fa-clock"></i> {article.readTime} read
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
