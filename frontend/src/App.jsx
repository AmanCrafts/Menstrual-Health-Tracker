import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Signup from './pages/Signup.jsx';
import Signin from './pages/Signin.jsx';
import Profile from './pages/Profile.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Analytics from './pages/Analytics.jsx';
import Trackers from './pages/Trackers.jsx';
import Navbar from './components/Navbar.jsx';
import Education from './pages/Education.jsx';
import ArticleDetail from './pages/ArticleDetail.jsx';
import TestModeToggle from './components/TestModeToggle.jsx';
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { DataProvider } from './contexts/DataContext.jsx';
import { useData } from './contexts/DataContext.jsx';
import { useAuth } from './contexts/useAuth.jsx';
import './styles/global.css';
import './styles/testMode.css';

const ALLOWED_TEST_MODE_EMAILS = ['theamanmalikarts@gmail.com', 'test@g.com'];

function TestModeController() {
    const { testMode, setTestMode, testUser, setTestUser } = useData();
    const { currentUser } = useAuth();

    if (!currentUser || !ALLOWED_TEST_MODE_EMAILS.includes(currentUser.email)) {
        return null;
    }

    const isDemoUser = currentUser.email === 'test@g.com';

    return (
        <TestModeToggle
            isEnabled={testMode}
            onToggle={isDemoUser ? undefined : setTestMode}
            currentUser={testUser}
            onUserChange={setTestUser}
            locked={isDemoUser}
        />
    );
}

const App = () => {
    return (
        <AuthProvider>
            <DataProvider>
                <Router>
                    <Navbar />
                    <Routes>
                        <Route
                            path="/signin"
                            element={
                                <PublicOnlyRoute>
                                    <Signin />
                                </PublicOnlyRoute>
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <PublicOnlyRoute>
                                    <Signup />
                                </PublicOnlyRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/analytics"
                            element={
                                <ProtectedRoute>
                                    <Analytics />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/trackers"
                            element={
                                <ProtectedRoute>
                                    <Trackers />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/education" element={<Education />} />
                        <Route path="/education/article/:articleId" element={<ArticleDetail />} />
                        <Route path="/" element={<Home />} />
                    </Routes>
                    <TestModeController />
                </Router>
            </DataProvider>
        </AuthProvider>
    );
};

export default App;
