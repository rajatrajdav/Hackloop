import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Landing from "./pages/landing";
import Login from "./pages/login";
import StudentDashboard from "./pages/StudentDashboard";
import OrganizerDashboard from "./pages/organizersdashboard";

export default function App() {
  const [page, setPage] = useState("landing");
  const [userName, setUserName] = useState("");

  const handleLogin = (role, name) => {
    setUserName(name);
    setPage(role);
  };

  const handleLogout = () => {
    setPage("landing");
    setUserName("");
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
        <StudentDashboard key="student" onLogout={handleLogout} userName={userName} />
      )}
      {page === "organizer" && (
        <OrganizerDashboard key="organizer" onLogout={handleLogout} userName={userName} />
      )}
    </AnimatePresence>
  );
}
