import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Landing from "./pages/landing";
import Login from "./pages/login";
import StudentDashboard from "./pages/StudentDashboard";
import OrganizerDashboard from "./pages/organizersdashboard";

export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);

  const handleLogin = (role, name, userData) => {
    setUser(userData || { role, name });
    setPage(role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setPage("landing");
    setUser(null);
  };

  return (
    <AnimatePresence mode="wait">
      {page === "landing" && (
        <Landing key="landing" onLoginClick={() => setPage("login")} />
      )}
      {page === "login" && (
        <Login key="login" onLogin={handleLogin} onBack={() => setPage("landing")} />
      )}
      {page === "student" && (
        <StudentDashboard key="student" onLogout={handleLogout} user={user} />
      )}
      {page === "organizer" && (
        <OrganizerDashboard key="organizer" onLogout={handleLogout} user={user} />
      )}
    </AnimatePresence>
  );
}
