import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Dashboard from './pages/Dashboard';
import Signin from "./pages/signin";
import Signup from "./pages/signup";
import Milestones from './pages/Milestones';
import Settings from './pages/Settings';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="flex-col">
          <nav style={{ padding: "1rem", display: "flex", gap: "1rem", width: "100vw" }}>
            <Link to="/signin">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
          </nav>
          <main className="flex-grow container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/milestones" element={<Milestones />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
