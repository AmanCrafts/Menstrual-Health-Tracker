import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup.jsx'
import Signin from './pages/Signin.jsx'
import Profile from './pages/Profile.jsx'
import Education from './pages/Education.jsx'
import UnderstandingCycle from './pages/education/UnderstandingCycle.jsx'
import ProductGuide from './pages/education/ProductGuide.jsx'
import PMSManagement from './pages/education/PMSManagement.jsx'
import Navbar from './components/Navbar.jsx'
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
            <Route path="/education" element={<Education />} />
            <Route path="/education/basics/understanding-cycle" element={<UnderstandingCycle />} />
            <Route path="/education/products/product-guide" element={<ProductGuide />} />
            <Route path="/education/health/pms-management" element={<PMSManagement />} />
            <Route path="/" element={<Profile />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
