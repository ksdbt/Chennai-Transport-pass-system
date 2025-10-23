import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa"; // Profile icon

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    logout();
    setIsOpen(false);
    alert("Logged out successfully.");
    navigate("/");
  };

  const isLoggedIn = !!user;
  const isHome = location.pathname === "/";

  const navLinkStyle = "py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-blue-100 hover:scale-105 focus:bg-blue-100 focus:outline-none";

  return (
    <header className={`shadow-md ${isHome ? "bg-gradient-to-r from-blue-700 to-blue-900 text-white" : "bg-white text-blue-800"}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center relative">
        
        {/* Logo */}
         <Link to="/" className="flex items-center text-2xl font-bold hover:opacity-90 transition-opacity">
          <span className="text-3xl mr-2">🚍</span>
          <span>Chennai Transport Pass</span>
        </Link>

        {/* Hamburger menu only if not on Home */}
        {!isHome && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-2xl focus:outline-none"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isOpen ? "✕" : "☰"}
          </button>
        )}


        {/* Desktop Navigation */}
        <nav className={`hidden md:flex space-x-4 ${isHome ? "hidden" : ""}`}>
          {!isLoggedIn && (
            <>
              {/* <Link to="/" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                Home
              </Link> */}
              <Link to="/about" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                About us
              </Link>
              <Link to="/contact" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                Contact Us
              </Link>
            </>
          )}

          {isLoggedIn && user.role === "Passenger" && (
            <>
              <Link to="/buy-pass" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                Buy Pass
              </Link>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                Dashboard
              </Link>
              <Link to="/history" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                History
              </Link>
              <Link to="/transactions" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                Transactions
              </Link>
            </>
          )}

          {isLoggedIn && user.role === "TransportManager" && (
            <>
              <Link to="/manager/dashboard" onClick={() => setIsOpen(false)} className={navLinkStyle}>
               Dashboard
              </Link>
              <Link to="/passes" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                View Passes
              </Link>
              <Link to="/transactions" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                Transactions
              </Link>
            </>
          )}

          {isLoggedIn && user.role === "Admin" && (
            <>
              <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                Dashboard
              </Link>
              <Link to="/admin/users" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                Users
              </Link>
              <Link to="/admin/passes" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                Passes
              </Link>
              <Link to="/admin/transactions" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                Transactions
              </Link>
            </>
          )}

          {isLoggedIn && (
            <>
              <Link to="/profile" onClick={() => setIsOpen(false)} className={navLinkStyle + " flex items-center"}>
                <FaUserCircle size={20} className="mr-2" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="py-2 px-4 rounded-md text-red-600 hover:bg-red-100 transition-all duration-200 ease-in-out focus:bg-red-100 focus:outline-none"
              >
                Logout
              </button>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        {isOpen && !isHome && (
          <nav className="md:hidden absolute top-full left-0 w-full bg-white text-blue-800 shadow-lg animate-slide-down">
            <div className="flex flex-col space-y-2 p-4">
              {!isLoggedIn && (
                <>
                  <Link to="/" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                    Home
                  </Link>
                  <Link to="/login" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                    Sign Up
                  </Link>
                </>
              )}

              {isLoggedIn && user.role === "Passenger" && (
                <>
                  <Link to="/buy-pass" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                    Buy Pass
                  </Link>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                    Dashboard
                  </Link>
                  <Link to="/history" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                    History
                  </Link>
                  <Link to="/transactions" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                    Transactions
                  </Link>
                </>
              )}

              {isLoggedIn && user.role === "TransportManager" && (
                <>
                  <Link to="/manager/dashboard" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                    Manager Dashboard
                  </Link>
                  <Link to="/passes" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                    View Passes
                  </Link>
                  <Link to="/transactions" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                    Transactions
                  </Link>
                </>
              )}

              {isLoggedIn && user.role === "Admin" && (
                <>
                  <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/users" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                    All Users
                  </Link>
                  <Link to="/admin/passes" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                    All Passes
                  </Link>
                  <Link to="/admin/transactions" onClick={() => setIsOpen(false)} className={navLinkStyle}>
                    All Transactions
                  </Link>
                </>
              )}

              {isLoggedIn && (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className={navLinkStyle + " flex items-center"}>
                    <FaUserCircle size={20} className="mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="py-2 px-4 rounded-md text-red-600 hover:bg-red-100 transition-all duration-200 ease-in-out focus:bg-red-100 focus:outline-none text-left"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
