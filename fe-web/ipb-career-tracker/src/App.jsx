import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Lowongan from './pages/Lowongan'
import Profil from './pages/Profil'
import Panduan from './pages/Panduan'
import Karir from './pages/Karir'
import Login from './pages/Login'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/lowongan" element={<Lowongan />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/panduan" element={<Panduan />} />
        <Route path="/karir" element={<Karir />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
