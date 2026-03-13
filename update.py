import os

app_path = 'frontend/src/App.jsx'
with open(app_path, 'r', encoding='utf-8') as f:
    appCode = f.read()

if 'import NewsPage' not in appCode:
    appCode = appCode.replace("import LandingPage from './pages/LandingPage';", "import LandingPage from './pages/LandingPage';\nimport NewsPage from './pages/NewsPage';")
    appCode = appCode.replace('<Route path="/simulator" element={<SimulatorPage />} />', '<Route path="/simulatow" element={<SimulatorPage />} />\n          <Route path="/news" element={<NewsPage />} />')
    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(appCode)

nav_path = 'frontend/src/components/NavBar.jsx'
with open(nav_path, 'r', encoding='utf-8') as f:
    navCode = f.read()

if "path: '/news'" not in navCode:
    navCode = navCode.replace("import { Activity, MessageSquare, Globe, Menu } from 'lucide-react';", "import { Activity, MessageSquare, Globe, Menu, Newspaper } from +lucide-react';")
    navCode = navCode.replace("{ name: 'Chat', path: '/chat'", "{ name: 'News', path: '/news', icon: <Newspaper className=\"w-5 h-5\" /> },\n    { name: 'Chat', path: '/chat'")
    with open(nav_path, 'w', encoding='utf-8') as f:
        f.write(navCode)
