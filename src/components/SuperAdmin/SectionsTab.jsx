import React, { useState } from 'react';

const SectionsTab = ({ 
  sections, 
  batches, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete,
  setSuccessMessage 
}) => {
  const [sectionBatch, setSectionBatch] = useState("");
  const [sectionName, setSectionName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await onAdd("sections", {
        batch_id: parseInt(sectionBatch),
        section_name: sectionName,
      });
      if (result) {
        setSectionBatch("");
        setSectionName("");
        setSuccessMessage("Section added successfully");
      }
    } catch (error) {
      console.error("Error adding section:", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-2">
              Batch
            </label>
            <select
              value={sectionBatch}
              onChange={(e) => setSectionBatch(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="">Select Batch</option>
              {batches.map((batch) => (
                <option key={batch.batch_id} value={batch.batch_id}>
                  {batch.dept_name} - Year {batch.year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-2">
              Section Name
            </label>
            <input
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
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
            Add Section
          </button>
        </div>
      </form>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left text-gray-700">Batch</th>
              <th className="p-3 text-left text-gray-700">Section</th>
              <th className="p-3 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <tr key={section.section_id} className="border-b">
                <td className="p-3">
                  {batches.find((b) => b.batch_id === section.batch_id)
                    ?.dept_name || "N/A"}{" "}
                  - Year{" "}
                  {batches.find((b) => b.batch_id === section.batch_id)
                    ?.year || "N/A"}
                </td>
                <td className="p-3">{section.section_name}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => onEdit("sections", section)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600 disabled:bg-gray-400"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onDelete("sections", section.section_id, e)}
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

export default SectionsTab;
