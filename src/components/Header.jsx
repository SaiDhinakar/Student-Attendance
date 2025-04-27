import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // for logout navigation and location
import { Menu, X, Home, FileText, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom"; // Remove if not using routing

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // state to hold current role and update on navigation
  const [role, setRole] = useState(localStorage.getItem('role')?.toLowerCase());
  useEffect(() => {
    setRole(localStorage.getItem('role')?.toLowerCase());
  }, [location]);

  const { pathname } = location;
  // Define navigation links based on current page and role
  let desktopLinks = [];
  if (pathname === "/") {
    // Home page: show only Login
    desktopLinks = [{ to: "/admin-login", label: "Login" }];
  } else if (pathname === "/admin-login") {
    // Admin login page: show only Home
    desktopLinks = [{ to: "/", label: "Home" }];
  } else if (role === 'admin' || role === 'superadmin') {
    // Admin pages: show Home and Logout, plus Admin link for superadmin
    desktopLinks = [{ to: "/", label: "Home" }];
    if (role === 'superadmin') desktopLinks.push({ to: "/superadmin", label: "Admin" });
    desktopLinks.push({ logout: true, label: "Logout" });
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-white shadow-md h-24">
        <div className="flex items-center justify-between max-w-[1200px] w-[90%] mx-auto py-3">
          
          {/* Sidebar Toggle (mobile only) */}  
          <button
            className="md:hidden text-gray-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Logo */}
          <div className="hidden md:block">
            <img
              src="/image.png"
              alt="College Logo"
              className="h-20 mx-auto"
            />
          </div>

          {/* College Info */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-xl md:text-2xl text-green-800 font-bold leading-tight">
              SRI SHAKTHI INSTITUTE OF ENGINEERING AND TECHNOLOGY
            </h1>
            <p className="text-sm text-gray-700 font-semibold">Student Attendance System</p>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex gap-6 text-gray-800 font-medium">
            {desktopLinks.map((link) =>
              link.logout ? (
                <button key="logout" onClick={handleLogout} className="hover:text-green-700 transition-colors">
                  {link.label}
                </button>
              ) : (
                <Link key={link.to} to={link.to} className="hover:text-green-700 transition-colors">
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>
      </header>

      {/* Sidebar (Mobile) */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-green-700">Menu</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-4 text-gray-800">
          {desktopLinks.map((link) =>
            link.logout ? (
              <button key="logout" onClick={() => { setSidebarOpen(false); handleLogout(); }} className="flex items-center gap-2">
                {link.label}
              </button>
            ) : (
              <Link key={link.to} to={link.to} className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                {link.label}
              </Link>
            )
          )}
        </nav>
      </aside>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-opacity-40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
