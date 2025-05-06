import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, UserCog, LogIn, LogOut, FileTextIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { MdAdminPanelSettings } from "react-icons/md";

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

  // Function to check if user is superadmin
  const isSuperAdmin = () => {
    return role === "superadmin" || role === "SUPERADMIN";
  };

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
      
      // Always show Report option for logged in users
      if (pathname !== "/report") {
        links.push({ to: "/report", label: "Report", icon: <FileTextIcon size={20} /> });
      }
      
      // Show SuperAdmin option ONLY for superadmin users
      if (isSuperAdmin() && pathname !== "/superadmin") {
        links.push({ to: "/superadmin", label: "SuperAdmin", icon: <UserCog size={20} /> });
        links.push({ to: "http://192.168.8.86:5045/gallery-manager", label: "Gallery Manager", icon: <MdAdminPanelSettings size={20} /> });
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
      <header className="fixed top-0 z-50 w-full bg-white shadow-md">
        <div className="flex items-center justify-between max-w-[1200px] w-[95%] sm:w-[90%] mx-auto py-2 sm:py-3">
          {/* Left section with menu and logo */}
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle (mobile only) - Now on left */}  
            <button
              className="sm:hidden text-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
            
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/image.png"
                alt="College Logo"
                className="h-12 sm:h-16 md:h-20"
              />
            </Link>
          </div>

          {/* College Info - Responsive text sizes */}
          <div className="flex-1 text-center px-2 sm:px-4">
            <h1 className="text-lg sm:text-xl md:text-2xl text-green-800 font-bold leading-tight">
              SRI SHAKTHI INSTITUTE OF ENGINEERING AND TECHNOLOGY
            </h1>
            <p className="text-xs sm:text-sm text-gray-700 font-semibold">Student Attendance System</p>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden sm:flex gap-4 md:gap-4 text-gray-800 font-medium">
            {navLinks.map((link) =>
              link.logout ? (
                <button 
                  key="logout" 
                  onClick={handleLogout} 
                  className="flex items-center gap-1 md:gap-2 text-sm md:text-base hover:text-green-700 transition-colors"
                >
                  {link.icon}
                  {link.label}
                </button>
              ) : (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className="flex items-center gap-1 md:gap-2 text-sm md:text-base hover:text-green-700 transition-colors"
                >
                  {link.icon}
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>
      </header>

      {/* Sidebar (Mobile) - Enhanced clean design */}
      <aside
        className={`fixed top-0 left-0 h-full w-56 bg-white shadow-xl z-40 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out sm:hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-green-50">
          <div className="flex items-center gap-3">
            <img src="/image.png" alt="Logo" className="h-10 w-auto" />
            <h2 className="text-lg font-bold text-green-800">Navigation</h2>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Sidebar Links */}
        <nav className="p-5 space-y-3 text-gray-800">
          {navLinks.map((link) =>
            link.logout ? (
              <button 
                key="logout" 
                onClick={() => { setSidebarOpen(false); handleLogout(); }} 
                className="flex items-center gap-3 py-3 w-full hover:bg-gray-100 rounded px-4 text-base font-medium transition-colors"
              >
                {link.icon}
                {link.label}
              </button>
            ) : (
              <Link 
                key={link.to} 
                to={link.to} 
                className="flex items-center gap-3 py-3 w-full hover:bg-gray-100 rounded px-4 text-base font-medium transition-colors" 
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
          className="fixed inset-0 bg-none bg-opacity-50 z-30 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}