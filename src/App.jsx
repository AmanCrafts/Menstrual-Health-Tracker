import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup.jsx'
import Signin from './pages/Signin.jsx'
import Profile from './pages/Profile.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { DataProvider } from './contexts/DataContext.jsx'

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Profile />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
