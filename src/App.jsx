import { BrowserRouter, Routes, Route } from 'react-router-dom'
import InvitationPage from './pages/InvitationPage'
import AdminPage from './pages/AdminPage'
import ScannerPage from './pages/ScannerPage'
import CheckInPage from './pages/CheckInPage'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InvitationPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/checkin/:token" element={<CheckInPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
