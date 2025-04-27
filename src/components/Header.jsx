import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, UserCog, LogIn, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  
  // Get user role and update when location changes
  const [role, setRole] = useState(localStorage.getItem('role')?.toLowerCase());
  useEffect(() => {
    setRole(localStorage.getItem('role')?.toLowerCase());
  }, [location]);

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Generate navigation links based on auth state and role
  const getNavLinks = () => {
    // Always show home except on login page
    const links = [];
    
    if (pathname !== "/") {
      links.push({ to: "/", label: "Home", icon: <Home size={20} /> });
    }
    
    // Auth state specific links
    if (!role) {
      // Not logged in - show login link if not on login page
      if (pathname !== "/admin-login") {
        links.push({ to: "/admin-login", label: "Admin Login", icon: <LogIn size={20} /> });
      }
    } else {
      // Logged in - show role-specific links
      if (role === 'superadmin') {
        links.push({ to: "/superadmin", label: "Admin Dashboard", icon: <UserCog size={20} /> });
      } else if (role === 'admin') {
        links.push({ to: "/report", label: "Admin Dashboard", icon: <UserCog size={20} /> });
      }
      
      // Always show logout for authenticated users
      links.push({ logout: true, label: "Logout", icon: <LogOut size={20} /> });
    }
    
    return links;
  };

  const navLinks = getNavLinks();

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
          <Link to="/" className="hidden md:block">
            <img
              src="/image.png"
              alt="College Logo"
              className="h-20 mx-auto"
            />
          </Link>

          {/* College Info */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-xl md:text-2xl text-green-800 font-bold leading-tight">
              SRI SHAKTHI INSTITUTE OF ENGINEERING AND TECHNOLOGY
            </h1>
            <p className="text-sm text-gray-700 font-semibold">Student Attendance System</p>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex gap-6 text-gray-800 font-medium">
            {navLinks.map((link) =>
              link.logout ? (
                <button 
                  key="logout" 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 hover:text-green-700 transition-colors"
                >
                  {link.icon}
                  {link.label}
                </button>
              ) : (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className="flex items-center gap-2 hover:text-green-700 transition-colors"
                >
                  {link.icon}
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
          {navLinks.map((link) =>
            link.logout ? (
              <button 
                key="logout" 
                onClick={() => { setSidebarOpen(false); handleLogout(); }} 
                className="flex items-center gap-2 py-2 w-full hover:bg-gray-100 rounded px-2"
              >
                {link.icon}
                {link.label}
              </button>
            ) : (
              <Link 
                key={link.to} 
                to={link.to} 
                className="flex items-center gap-2 py-2 w-full hover:bg-gray-100 rounded px-2" 
                onClick={() => setSidebarOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            )
          )}
        </nav>
      </aside>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
