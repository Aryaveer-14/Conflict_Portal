import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import SimulatorPage from './pages/SimulatorPage';
import LandingPage from './pages/LandingPage';
import NewsPage from './pages/NewsPage';

// A wrapper to selectively hide NavBar on Landing Page
const AppLayout = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-base text-primary flex flex-col">
      {!isLandingPage && <NavBar />}
      <main className={`flex-1 overflow-x-hidden ${isLandingPage ? '' : 'overflow-y-auto'}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/news" element={<NewsPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
