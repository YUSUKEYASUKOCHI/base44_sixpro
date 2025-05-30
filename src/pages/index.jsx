import Layout from "./Layout.jsx";

import ProfileSettings from "./ProfileSettings";

import MenuGeneration from "./MenuGeneration";

import MenuHistory from "./MenuHistory";

import ResetPassword from "./ResetPassword";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    ProfileSettings: ProfileSettings,
    
    MenuGeneration: MenuGeneration,
    
    MenuHistory: MenuHistory,
    
    ResetPassword: ResetPassword,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    // リセットパスワードページはレイアウトを使用しない
    if (location.pathname === '/reset-password') {
      return (
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      );
    }
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<ProfileSettings />} />
                
                
                <Route path="/ProfileSettings" element={<ProfileSettings />} />
                
                <Route path="/MenuGeneration" element={<MenuGeneration />} />
                
                <Route path="/MenuHistory" element={<MenuHistory />} />
                
                <Route path="/reset-password" element={<ResetPassword />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}