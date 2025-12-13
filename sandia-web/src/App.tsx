import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AnalyzePage from './pages/AnalyzePage'
import DashboardSelectionPage from './pages/DashboardSelectionPage'
import FileSelectionPage from './pages/FileSelectionPage'
import EnhancedSTATAPage from './pages/EnhancedSTATAPage'
import DynamoPage from './pages/DynamoPage'
import HomePage from './pages/HomePage'

function App() {
  return (
    <div className="min-h-screen bg-dark-950 sci-fi-background">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/dashboard" element={<DashboardSelectionPage />} />
        <Route path="/stata-files" element={<FileSelectionPage />} />
        <Route path="/stata" element={<EnhancedSTATAPage />} />
        <Route path="/dynamo" element={<DynamoPage />} />
      </Routes>
    </div>
  )
}

export default App