import React, { useState } from 'react';

const AdminsTab = ({ 
  admins, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete,
  setSuccessMessage 
}) => {
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminRole, setAdminRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!adminUsername || !adminPassword || !adminRole) {
      alert("Username, password, and role are required");
      return;
    }
    
    try {
      const result = await onAdd("admins", {
        username: adminUsername,
        password: adminPassword,
        role: adminRole
      });
      
      if (result) {
        setAdminUsername("");
        setAdminPassword("");
        setAdminRole("");
        setSuccessMessage("Admin added successfully");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Admin Roles
        </h2>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Role
              </label>
              <select
                value={adminRole}
                onChange={(e) => setAdminRole(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 mt-2"
            disabled={loading}
          >
            Add Admin
          </button>
        </form>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left text-gray-700">Username</th>
                <th className="p-3 text-left text-gray-700">Role</th>
                <th className="p-3 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b">
                  <td className="p-3">{admin.username}</td>
                  <td className="p-3">{admin.role}</td>
                  <td className="p-3">
                    <button
                      onClick={() => onEdit("admins", {
                        ...admin,
                        password: ""
                      })}
                      className="px-3 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => onDelete("admins", admin.id, e)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminsTab;
