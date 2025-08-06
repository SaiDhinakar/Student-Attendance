import React, { useState } from 'react';

const DepartmentsTab = ({ 
  departments, 
  setDepartments, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete,
  setSuccessMessage 
}) => {
  const [deptName, setDeptName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await onAdd("departments", { dept_name: deptName });
      if (result) {
        setDeptName("");
        setSuccessMessage("Department added successfully");
      }
    } catch (error) {
      console.error("Error adding department:", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-2">
              Department Name
            </label>
            <input
              type="text"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            Add Department
          </button>
        </div>
      </form>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left text-gray-700">Name</th>
              <th className="p-3 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.dept_name} className="border-b">
                <td className="p-3">{dept.dept_name}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() =>
                      onEdit("departments", {
                        ...dept,
                        old_name: dept.dept_name,
                      })
                    }
                    className="px-3 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600 disabled:bg-gray-400"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onDelete("departments", dept.dept_name, e)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
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
    </>
  );
};

export default DepartmentsTab;
