import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Signup from './pages/Signup.jsx'
import Signin from './pages/Signin.jsx'
import Profile from './pages/Profile.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Analytics from './pages/Analytics.jsx'
import Trackers from './pages/Trackers.jsx'
import Navbar from './components/Navbar.jsx'
import Education from './pages/Education.jsx'
import ArticleDetail from './pages/ArticleDetail.jsx'
import TestModeToggle from './components/TestModeToggle.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { DataProvider } from './contexts/DataContext.jsx'
import { useData } from './contexts/DataContext.jsx'
import { useAuth } from './contexts/useAuth.jsx'
import './styles/global.css'
import './styles/testMode.css'

const DEVELOPER_EMAIL = 'theamanmalikarts@gmail.com';

function TestModeController() {
  const { testMode, setTestMode, testUser, setTestUser } = useData();
  const { currentUser } = useAuth();

  if (!currentUser || currentUser.email !== DEVELOPER_EMAIL) {
    return null;
  }

  return (
    <TestModeToggle
      isEnabled={testMode}
      onToggle={setTestMode}
      currentUser={testUser}
      onUserChange={setTestUser}
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
            <Route path="/signin" element={<Signin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/trackers" element={<Trackers />} />
            <Route path="/education" element={<Education />} />
            <Route path="/education/article/:articleId" element={<ArticleDetail />} />
            <Route path="/" element={<Home />} />
          </Routes>
          <TestModeController />
        </Router>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
