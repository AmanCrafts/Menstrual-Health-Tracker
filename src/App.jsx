import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup.jsx'
import Signin from './pages/Signin.jsx'
import Profile from './pages/Profile.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Analytics from './pages/Analytics.jsx'
import Trackers from './pages/Trackers.jsx'
import Navbar from './components/Navbar.jsx'
import Education from './pages/Education.jsx'
import ArticleDetail from './pages/ArticleDetail.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { DataProvider } from './contexts/DataContext.jsx'

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/trackers" element={<Trackers />} />
            <Route path="/education" element={<Education />} />
            <Route path="/education/article/:articleId" element={<ArticleDetail />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
