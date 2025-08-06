import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from "lucide-react";

const StudentsTab = ({ 
  students, 
  sections, 
  departments,
  loading, 
  onAdd, 
  onEdit, 
  onDelete,
  onCsvUpload,
  setSuccessMessage 
}) => {
  const [studentRegNum, setStudentRegNum] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentSection, setStudentSection] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [csvDept, setCsvDept] = useState("");
  const [csvYear, setCsvYear] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [collapsedDepts, setCollapsedDepts] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await onAdd("students", {
        register_number: studentRegNum,
        name: studentName,
        section_id: parseInt(studentSection),
      });
      if (result) {
        setStudentRegNum("");
        setStudentName("");
        setStudentSection("");
        setSuccessMessage("Student added successfully");
      }
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile || !csvDept || !csvYear) {
      alert("Please select department, year, and CSV file");
      return;
    }
    
    try {
      await onCsvUpload(csvFile, csvDept, csvYear);
      setCsvFile(null);
      setCsvDept("");
      setCsvYear("");
      // Reset file input
      e.target.reset();
    } catch (error) {
      console.error("Error uploading CSV:", error);
    }
  };

  const toggleDept = (dept) => {
    setCollapsedDepts((prev) => ({
      ...prev,
      [dept]: !prev[dept],
    }));
  };

  const toggleSection = (dept, year, section) => {
    const key = `${dept}|${year}|${section}`;
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter students based on search
  const filteredStudents = students.filter((student) => {
    if (!studentSearch) return true;
    const search = studentSearch.toLowerCase();
    return (
      student.register_number?.toLowerCase().includes(search) ||
      student.name?.toLowerCase().includes(search)
    );
  });

  // Group filtered students by department, year, and section
  const groupedStudents = filteredStudents.reduce((acc, student) => {
    const section = sections.find(s => s.section_id === student.section_id);
    if (!section) return acc;

    const dept = section.dept_name || "Unknown";
    const year = section.year || "Unknown";
    const sectionName = section.section_name || "Unknown";

    if (!acc[dept]) acc[dept] = {};
    if (!acc[dept][year]) acc[dept][year] = {};
    if (!acc[dept][year][sectionName]) acc[dept][year][sectionName] = [];

    acc[dept][year][sectionName].push(student);
    return acc;
  }, {});

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 font-medium mb-2">
              Register Number
            </label>
            <input
              type="text"
              value={studentRegNum}
              onChange={(e) => setStudentRegNum(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 font-medium mb-2">
              Section
            </label>
            <select
              value={studentSection}
              onChange={(e) => setStudentSection(e.target.value)}
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
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            Add Student
          </button>
        </div>
      </form>

      {/* CSV Upload Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          Upload Students via CSV
        </h3>
        <form onSubmit={handleCsvUpload} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 font-medium mb-2">
              Department
            </label>
            <select
              value={csvDept}
              onChange={(e) => setCsvDept(e.target.value)}
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
            <select
              value={csvYear}
              onChange={(e) => setCsvYear(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="">Select Year</option>
              {[1, 2, 3, 4].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 font-medium mb-2">
              CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              className="w-full p-2 border rounded-lg"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            disabled={loading}
          >
            Upload CSV
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Notes:</strong></p>
          <ul className="list-disc pl-5">
            <li>
              The CSV must contain the columns: <code>RegisterNumber</code>, <code>Name</code>, and <code>Section</code>.
            </li>
            <li>
              Example:
              <pre className="bg-gray-200 p-2 rounded mt-1">
                RegisterNumber,Name,Section<br />
                CS1A001,Alice,A<br />
                CS1A002,Bob,B
              </pre>
            </li>
            <li>
              <code>Section</code> must match existing section names for the selected department and year.
            </li>
            <li>
              Existing students with matching <code>RegisterNumber</code> will be updated; new ones will be added.
            </li>
          </ul>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          placeholder="Search by register # or name…"
          className="w-full max-w-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Students List */}
      <div className="mt-4">
        {Object.entries(groupedStudents).map(([dept, years]) => (
          <div key={dept} className="bg-white rounded-lg shadow p-4 mb-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleDept(dept)}
            >
              <h2 className="text-2xl font-semibold">{dept}</h2>
              {collapsedDepts[dept] ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
            {!collapsedDepts[dept] &&
              Object.entries(years).map(([year, sections]) => (
                <div key={year} className="border-l-4 border-blue-100 pl-4 mt-4">
                  <h3 className="text-xl font-medium">{year} Year</h3>
                  {Object.entries(sections).map(([section, studs]) => {
                    const key = `${dept}|${year}|${section}`;
                    return (
                      <div key={section} className="ml-4 mt-2">
                        <div
                          className="flex justify-between items-center cursor-pointer p-2 bg-gray-50 rounded"
                          onClick={() => toggleSection(dept, year, section)}
                        >
                          <h4 className="text-lg font-medium">
                            Section {section} ({studs.length} students)
                          </h4>
                          {collapsedSections[key] ? (
                            <ChevronRight size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </div>
                        {!collapsedSections[key] && (
                          <div className="ml-4 mt-2">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="p-2 text-left">Register #</th>
                                  <th className="p-2 text-left">Name</th>
                                  <th className="p-2 text-left">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {studs.map((student) => (
                                  <tr key={student.register_number} className="border-b">
                                    <td className="p-2">{student.register_number}</td>
                                    <td className="p-2">{student.name}</td>
                                    <td className="p-2">
                                      <button
                                        onClick={() => onEdit("students", student)}
                                        className="px-2 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600 text-xs"
                                        disabled={loading}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={(e) => onDelete("students", student.register_number, e)}
                                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
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
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default StudentsTab;
