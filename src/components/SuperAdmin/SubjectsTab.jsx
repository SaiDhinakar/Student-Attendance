import React, { useState } from 'react';

const SubjectsTab = ({ 
  subjects, 
  departments, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete,
  setSuccessMessage 
}) => {
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectDept, setSubjectDept] = useState("");
  const [subjectYear, setSubjectYear] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await onAdd("subjects", {
        subject_code: subjectCode,
        subject_name: subjectName,
        dept_name: subjectDept,
        year: parseInt(subjectYear),
      });
      if (result) {
        setSubjectCode("");
        setSubjectName("");
        setSubjectDept("");
        setSubjectYear("");
        setSuccessMessage("Subject added successfully");
      }
    } catch (error) {
      console.error("Error adding subject:", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 font-medium mb-2">
              Subject Code
            </label>
            <input
              type="text"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 font-medium mb-2">
              Subject Name
            </label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 font-medium mb-2">
              Department
            </label>
            <select
              value={subjectDept}
              onChange={(e) => setSubjectDept(e.target.value)}
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
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 font-medium mb-2">
              Year
            </label>
            <input
              type="number"
              value={subjectYear}
              onChange={(e) => setSubjectYear(e.target.value)}
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
            Add Subject
          </button>
        </div>
      </form>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left text-gray-700">Code</th>
              <th className="p-3 text-left text-gray-700">Name</th>
              <th className="p-3 text-left text-gray-700">Department</th>
              <th className="p-3 text-left text-gray-700">Year</th>
              <th className="p-3 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.subject_code} className="border-b">
                <td className="p-3">{subject.subject_code}</td>
                <td className="p-3">{subject.subject_name}</td>
                <td className="p-3">{subject.dept_name}</td>
                <td className="p-3">{subject.year}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() =>
                      onEdit("subjects", {
                        ...subject,
                        old_code: subject.subject_code,
                      })
                    }
                    className="px-3 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600 disabled:bg-gray-400"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onDelete("subjects", subject.subject_code, e)}
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

export default SubjectsTab;
