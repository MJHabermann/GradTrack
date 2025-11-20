import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Dashboard from './pages/Dashboard';
import Signin from "./pages/signin";
import Signup from "./pages/signup";
import Milestones from './pages/Milestones';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import Courses from './pages/Courses';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RemindersPage from './pages/RemindersPage';
import AdminDocumentReview from './pages/AdminDocumentReview';
import CoursePlanner from './pages/coursePlanner';

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
                        <Route path="/" element={<Dashboard />} /> // TODO: Change to Sign in page when done
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/faculty-dashboard" element={<FacultyDashboard />} /> // TODO: MAKE protected route
                        <Route path="/admin-dashboard" element={<AdminDashboard />} /> 
                        <Route path="/admin/documents" element={<AdminDocumentReview />} />
                        <Route path="/signin" element={<Signin />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/milestones" element={<Milestones />} />
                        <Route path="/documents" element={<Documents />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/reminders" element={<RemindersPage />} />
                        <Route path="/course-planner" element={<CoursePlanner />} />
                        {/* <Route path="/profile" element={<UserProfile />} />
                        <Route path="/admin" element={<AdminPanel />} /> */}
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
        </UserProvider>
    );
}

export default App;
