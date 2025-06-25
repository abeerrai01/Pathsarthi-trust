import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import MultiPhotoUpload from "./MultiPhotoUpload";
import PhotoUpload from "./PhotoUpload";

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
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // or your auth logic
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen">
      <AdminNavbar onLogout={handleLogout} />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white p-4 space-y-4">
          <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
          <Button onClick={() => setActiveSection("multi-upload")}>🖼️ Multi-Image Upload</Button>
          <Button onClick={() => setActiveSection("single-upload")}>📷 Single Photo Upload</Button>
          <Button onClick={() => setActiveSection("team")}>🧑‍🤝‍🧑 Team Members</Button>
          <Button onClick={() => setActiveSection("mission")}>🎯 Update Mission</Button>
          <Button onClick={() => setActiveSection("analytics")}>📊 Website Analytics</Button>
        </div>
        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {activeSection === "multi-upload" && <MultiPhotoUpload />}
          {activeSection === "single-upload" && <PhotoUpload />}
          {activeSection === "team" && <TeamMembers />}
          {activeSection === "mission" && <UpdateMission />}
          {activeSection === "analytics" && <AnalyticsPanel />}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 