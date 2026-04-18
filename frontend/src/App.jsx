import React, { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Recommendations from "./pages/Recommendations";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import History from "./pages/History";
import Navbar from "./components/Navbar";

export default function App() {
  const [currentView, setCurrentView] = useState("landing"); // PERBAIKAN: Default view
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setIsLoggedIn(true);
      setCurrentView("dashboard");
    }
  }, []);

  const navigate = (page) => {
    setCurrentView(page);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setCurrentView("landing"); // PERBAIKAN: Kembali ke landing saat logout
  };

  if (!isLoggedIn) {
    if (currentView === "register") return <Register navigate={navigate} />;
    if (currentView === "login") return <Login navigate={navigate} />;
    return <Landing navigate={navigate} />; // PERBAIKAN: Tampilkan Landing Page
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950">
      <Navbar
        currentView={currentView}
        navigate={navigate}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-4 pb-24 md:ml-64 md:p-8 overflow-y-auto h-screen">
        {currentView === "dashboard" && <Dashboard navigate={navigate} />}
        {currentView === "recommendations" && (
          <Recommendations navigate={navigate} />
        )}
        {currentView === "history" && <History navigate={navigate} />}
        {currentView === "progress" && <Progress navigate={navigate} />}
        {currentView === "profile" && <Profile navigate={navigate} />}
      </main>
    </div>
  );
}
