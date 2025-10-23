import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BuyPass from "./pages/BuyPass";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Payment from "./pages/Payment";
import AdminPanel from "./pages/AdminPanel";
import Users from "./pages/Users";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AllPasses from "./pages/AllPasses";
import AllTransactions from "./pages/AllTransactions";

// 👇 Custom wrapper to conditionally render Header + always Footer
function Layout() {
  //const location = useLocation();
  // Hide footer on Home, Login, and Logout routes
  //const hideFooter = ["/", "/login", "/logout"].includes(location.pathname);

  // Always render header for consistent chrome across pages

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - always visible */}
      <Header />

      {/* Main content expands to push footer down */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/buy-pass" element={<BuyPass />} />
          {/* Passenger routes */}
          <Route path="/passenger/dashboard" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* Manager Routes */}
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/passes" element={<AllPasses />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminPanel />} /> 
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/passes" element={<AllPasses />} />
          <Route path="/admin/transactions" element={<AllTransactions />} />
        </Routes>
      </main>

      {/* Footer conditionally visible */}
      {/*!hideFooter && <Footer />*/}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
