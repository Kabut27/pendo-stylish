import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import WorkerPortal from './pages/WorkerPortal'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/worker" element={<WorkerPortal />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}
