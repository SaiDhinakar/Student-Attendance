import React, { useState } from 'react';

const BatchesTab = ({ 
  batches, 
  departments, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete,
  setSuccessMessage 
}) => {
  const [batchDept, setBatchDept] = useState("");
  const [batchYear, setBatchYear] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await onAdd("batches", {
        dept_name: batchDept,
        year: parseInt(batchYear),
      });
      if (result) {
        setBatchDept("");
        setBatchYear("");
        setSuccessMessage("Batch added successfully");
      }
    } catch (error) {
      console.error("Error adding batch:", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-2">
              Department
            </label>
            <select
              value={batchDept}
              onChange={(e) => setBatchDept(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.dept_name} value={dept.dept_name}>
                  {dept.dept_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-2">
              Year
            </label>
            <input
              type="number"
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
              max="4"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            Add Batch
          </button>
        </div>
      </form>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left text-gray-700">Department</th>
              <th className="p-3 text-left text-gray-700">Year</th>
              <th className="p-3 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.batch_id} className="border-b">
                <td className="p-3">{batch.dept_name}</td>
                <td className="p-3">{batch.year}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => onEdit("batches", batch)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600 disabled:bg-gray-400"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onDelete("batches", batch.batch_id, e)}
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

export default BatchesTab;
