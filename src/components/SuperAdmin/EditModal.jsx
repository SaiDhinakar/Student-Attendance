import React from 'react';

const EditModal = ({ 
  editModal, 
  setEditModal, 
  departments, 
  batches, 
  sections, 
  loading, 
  onUpdate, 
  error 
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdate(e);
  };

  const handleClose = () => {
    setEditModal({ isOpen: false, type: "", data: null });
  };

  if (!editModal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          Edit {editModal.type.slice(0, -1)}
        </h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {editModal.type === "departments" && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Department Name
              </label>
              <input
                type="text"
                value={editModal.data.dept_name}
                onChange={(e) =>
                  setEditModal({
                    ...editModal,
                    data: {
                      ...editModal.data,
                      dept_name: e.target.value,
                    },
                  })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
          )}

          {editModal.type === "batches" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Department
                </label>
                <select
                  value={editModal.data.dept_name}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: {
                        ...editModal.data,
                        dept_name: e.target.value,
                      },
                    })
                  }
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
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={editModal.data.year}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: {
                        ...editModal.data,
                        year: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="4"
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          {editModal.type === "sections" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Batch
                </label>
                <select
                  value={editModal.data.batch_id}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: {
                        ...editModal.data,
                        batch_id: parseInt(e.target.value),
                      },
                    })
                  }
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
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Section Name
                </label>
                <input
                  type="text"
                  value={editModal.data.section_name}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: {
                        ...editModal.data,
                        section_name: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          {editModal.type === "subjects" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={editModal.data.subject_code}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: {
                        ...editModal.data,
                        subject_code: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={editModal.data.subject_name}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: {
                        ...editModal.data,
                        subject_name: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Department
                </label>
                <select
                  value={editModal.data.dept_name}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: {
                        ...editModal.data,
                        dept_name: e.target.value,
                      },
                    })
                  }
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
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={editModal.data.year}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: {
                        ...editModal.data,
                        year: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="4"
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          {editModal.type === "students" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Register Number
                </label>
                <input
                  type="text"
                  value={editModal.data.register_number}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: {
                        ...editModal.data,
                        register_number: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editModal.data.name}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: { ...editModal.data, name: e.target.value },
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Section
                </label>
                <select
                  value={editModal.data.section_id}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: {
                        ...editModal.data,
                        section_id: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Select Section</option>
                  {sections.map((section) => (
                    <option
                      key={section.section_id}
                      value={section.section_id}
                    >
                      {section.section_name} (Batch {section.batch_id})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {editModal.type === "time-blocks" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Batch Year
                </label>
                <select
                  value={editModal.data.batch_year}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: {
                        ...editModal.data,
                        batch_year: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Period Number
                </label>
                <input
                  type="number"
                  value={editModal.data.block_number}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: {
                        ...editModal.data,
                        block_number: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  min="1"
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Start Time
                </label>
                <input
                  type="text"
                  value={editModal.data.start_time}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: {
                        ...editModal.data,
                        start_time: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                  title="Time format: HH:MM (24-hour)"
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  End Time
                </label>
                <input
                  type="text"
                  value={editModal.data.end_time}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: {
                        ...editModal.data,
                        end_time: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                  title="Time format: HH:MM (24-hour)"
                  disabled={loading}
                />
              </div>
            </>
          )}

          {editModal.type === "admins" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editModal.data.username}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: { ...editModal.data, username: e.target.value },
                    })
                  }
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
                  value={editModal.data.role}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: { ...editModal.data, role: e.target.value },
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editModal.data.password || ""}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: { ...editModal.data, password: e.target.value },
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-4 mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
