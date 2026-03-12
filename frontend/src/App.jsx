import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import SimulatorPage from './pages/SimulatorPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-base text-primary flex flex-col">
        <NavBar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
