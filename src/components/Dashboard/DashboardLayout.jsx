import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import MultiPhotoUpload from "./MultiPhotoUpload";
import PhotoUpload from "./PhotoUpload";
import GalleryManager from "./GalleryManager";

const Button = ({ children, onClick, className = "", variant = "ghost" }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 rounded transition font-medium ${
      variant === "outline"
        ? "border border-white text-white hover:bg-gray-700"
        : "bg-transparent hover:bg-gray-700 text-white"
    } ${className}`}
  >
    {children}
  </button>
);

const TeamMembers = () => <div>Team Members Section (Coming Soon)</div>;
const UpdateMission = () => <div>Update Mission Section (Coming Soon)</div>;
const AnalyticsPanel = () => <div>Analytics Panel Section (Coming Soon)</div>;

const DashboardLayout = () => {
  const [activeSection, setActiveSection] = useState("multi-upload");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // or your auth logic
    navigate("/login");
  };

  const handleMenuClick = () => setSidebarOpen((open) => !open);
  const handleNav = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <AdminNavbar onLogout={handleLogout} onMenuClick={handleMenuClick} />
      <div className="flex flex-1 relative">
        {/* Sidebar as drawer on mobile */}
        <div>
          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}
          <div
            className={`fixed z-40 top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 space-y-4 transform transition-transform duration-200 md:static md:translate-x-0 md:block ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
            <Button onClick={() => handleNav("multi-upload")}>🖼️ Multi-Image Upload</Button>
            <Button onClick={() => handleNav("single-upload")}>📷 Single Photo Upload</Button>
            <Button onClick={() => handleNav("gallery-manager")}>🗑️ Manage Gallery</Button>
            <Button onClick={() => handleNav("team")}>🧑‍🤝‍🧑 Team Members</Button>
            <Button onClick={() => handleNav("mission")}>🎯 Update Mission</Button>
            <Button onClick={() => handleNav("analytics")}>📊 Website Analytics</Button>
            <Link
              to="/admin/certificates"
              className="block w-full text-left px-4 py-2 rounded transition font-medium bg-green-600 hover:bg-green-700 text-white mt-2"
            >
              🏅 Certificate Generator
            </Link>
            {/* Logout button for mobile */}
            <Button
              variant="outline"
              className="mt-10 md:hidden"
              onClick={handleLogout}
            >
              🔒 Logout
            </Button>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {activeSection === "multi-upload" && <MultiPhotoUpload />}
          {activeSection === "single-upload" && <PhotoUpload />}
          {activeSection === "gallery-manager" && <GalleryManager />}
          {activeSection === "team" && <TeamMembers />}
          {activeSection === "mission" && <UpdateMission />}
          {activeSection === "analytics" && <AnalyticsPanel />}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 