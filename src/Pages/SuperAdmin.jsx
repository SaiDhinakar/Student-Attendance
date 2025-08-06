import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSuperAdminData } from "../hooks/useSuperAdminData";

// Import tab components
import DepartmentsTab from "../components/SuperAdmin/DepartmentsTab";
import BatchesTab from "../components/SuperAdmin/BatchesTab";
import SectionsTab from "../components/SuperAdmin/SectionsTab";
import SubjectsTab from "../components/SuperAdmin/SubjectsTab";
import StudentsTab from "../components/SuperAdmin/StudentsTab";
import AdminsTab from "../components/SuperAdmin/AdminsTab";
import TimeBlocksTab from "../components/SuperAdmin/TimeBlocksTab";
import EditModal from "../components/SuperAdmin/EditModal";

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState("departments");
  
  const {
    // State
    departments,
    batches,
    sections,
    subjects,
    students,
    timeBlocks,
    admins,
    loading,
    error,
    successMessage,
    editModal,
    
    // Setters
    setSuccessMessage,
    setEditModal,
    
    // Handlers
    handleAdd,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleCsvUpload,
  } = useSuperAdminData();

  const tabs = ["departments", "batches", "sections", "subjects", "students", "admins", "time-blocks"];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    const commonProps = {
      loading,
      onAdd: handleAdd,
      onEdit: handleEdit,
      onDelete: handleDelete,
      setSuccessMessage,
    };

    switch (activeTab) {
      case "departments":
        return (
          <DepartmentsTab
            departments={departments}
            {...commonProps}
          />
        );
      case "batches":
        return (
          <BatchesTab
            batches={batches}
            departments={departments}
            {...commonProps}
          />
        );
      case "sections":
        return (
          <SectionsTab
            sections={sections}
            batches={batches}
            {...commonProps}
          />
        );
      case "subjects":
        return (
          <SubjectsTab
            subjects={subjects}
            departments={departments}
            {...commonProps}
          />
        );
      case "students":
        return (
          <StudentsTab
            students={students}
            sections={sections}
            departments={departments}
            onCsvUpload={handleCsvUpload}
            {...commonProps}
          />
        );
      case "admins":
        return (
          <AdminsTab
            admins={admins}
            {...commonProps}
          />
        );
      case "time-blocks":
        return (
          <TimeBlocksTab
            timeBlocks={timeBlocks}
            {...commonProps}
          />
        );
      default:
        return <div>Invalid tab</div>;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-28px)] bg-gray-100 p-3 md:p-6 mt-[100px]">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 md:mb-6">
          Super Admin Panel
        </h1>
        
        {loading && (
          <div className="text-center mb-4">
            <svg
              className="animate-spin h-5 w-5 text-blue-600 inline-block"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
              />
            </svg>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        )}
        
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg transition-opacity duration-500 z-50">
            {successMessage}
          </div>
        )}

        <div className="flex flex-wrap gap-2 md:gap-4 mb-6 border-b border-gray-200 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 md:px-4 py-2 font-medium text-sm md:text-base whitespace-nowrap ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="bg-white p-3 md:p-6 rounded-lg shadow-lg mx-auto">
          {renderTabContent()}
        </div>

        <EditModal
          editModal={editModal}
          setEditModal={setEditModal}
          departments={departments}
          batches={batches}
          sections={sections}
          loading={loading}
          onUpdate={handleUpdate}
          error={error}
        />
      </div>
      <Footer />
    </>
  );
}
