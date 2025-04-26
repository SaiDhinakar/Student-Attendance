import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Filter, ChevronDown, ChevronUp, ChevronRight, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AdminPage() {
  const [filters, setFilters] = useState({
    dept_name: "",
    year: "",
    section_name: "",
    subject_code: "",
    date: null,
  });

  const [attendanceData, setAttendanceData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [groupedData, setGroupedData] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});

  // Fetch departments on component mount
  useEffect(() => {
    axios
      .get("http://localhost:8000/departments")
      .then((response) => setDepartments(response.data))
      .catch((error) => console.error("Error fetching departments:", error));
  }, []);

  // Fetch years when department changes
  useEffect(() => {
    if (filters.dept_name) {
      axios
        .get(`http://localhost:8000/years/${filters.dept_name}`)
        .then((response) => setYears(response.data))
        .catch((error) => console.error("Error fetching years:", error));

      setFilters((prev) => ({
        ...prev,
        year: "",
        section_name: "",
        subject_code: "",
      }));
      setSections([]);
      setSubjects([]);
    }
  }, [filters.dept_name]);

  // Fetch sections and subjects when year changes
  useEffect(() => {
    if (filters.dept_name && filters.year) {
      axios
        .get(`http://localhost:8000/sections/${filters.dept_name}/${filters.year}`)
        .then((response) => setSections(response.data))
        .catch((error) => console.error("Error fetching sections:", error));

      axios
        .get(`http://localhost:8000/subjects/${filters.dept_name}/${filters.year}`)
        .then((response) => setSubjects(response.data))
        .catch((error) => console.error("Error fetching subjects:", error));

      setFilters((prev) => ({
        ...prev,
        section_name: "",
        subject_code: "",
      }));
    }
  }, [filters.dept_name, filters.year]);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date changes via DatePicker
  const handleDateChange = (date) => {
    setFilters((prev) => ({ ...prev, date }));
  };

  // Apply filters to fetch attendance data
  const handleApplyFilters = async () => {
    setLoading(true);
    setError(null);

    if (!filters.dept_name && !filters.year && !filters.section_name && !filters.subject_code && !filters.date) {
      setError("Please select at least one filter");
      setLoading(false);
      return;
    }

    const params = new URLSearchParams();
    if (filters.dept_name) params.append("dept_name", filters.dept_name);
    if (filters.year) params.append("year", filters.year);
    if (filters.section_name) params.append("section_name", filters.section_name);
    if (filters.subject_code) params.append("subject_code", filters.subject_code);
    if (filters.date) {
      const formattedDate = filters.date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
      params.append("date", formattedDate);
    }

    try {
      const response = await axios.get(`http://localhost:8000/attendance?${params.toString()}`);
      if (!response.data) {
        setError("No attendance records found for the selected filters");
        setAttendanceData([]);
        setGroupedData({});
        return;
      }

      setAttendanceData(response.data);
      groupAttendanceData(response.data);
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError(err.response?.data?.detail || "Failed to fetch attendance data. Please try different filters.");
      setAttendanceData([]);
      setGroupedData({});
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      dept_name: "",
      year: "",
      section_name: "",
      subject_code: "",
      date: null,
    });
    setYears([]);
    setSections([]);
    setSubjects([]);
  };

  // Group attendance data hierarchically: Department -> Year -> Section -> Date -> Period (Subject)
  const groupAttendanceData = (data) => {
    const attendanceRecords = data.attendance || data;

    if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      console.error("No valid attendance records found in data:", data);
      setGroupedData({});
      return;
    }

    console.log("Raw attendance records:", attendanceRecords);

    const grouped = {};

    attendanceRecords.forEach((record, index) => {
      if (!record) {
        console.warn(`Record at index ${index} is null or undefined`);
        return;
      }

      // Use filters as fallback to prevent skipping records
      const dept_name = record.dept_name || filters.dept_name || "Unknown";
      const year = record.year ? String(record.year) : filters.year || "Not Specified";
      const section_name = record.section_name || filters.section_name || "A";
      const date = record.date || new Date().toISOString().split("T")[0];
      const subject_code = record.subject_code || filters.subject_code || "Unknown";

      console.log(`Processing record ${index}:`, {
        dept_name,
        year,
        section_name,
        date,
        subject_code,
        original_record: record,
      });

      if (!grouped[dept_name]) grouped[dept_name] = {};
      if (!grouped[dept_name][year]) grouped[dept_name][year] = {};
      if (!grouped[dept_name][year][section_name]) grouped[dept_name][year][section_name] = {};
      if (!grouped[dept_name][year][section_name][date]) grouped[dept_name][year][section_name][date] = {};
      if (!grouped[dept_name][year][section_name][date][subject_code]) {
        grouped[dept_name][year][section_name][date][subject_code] = {
          students: [],
        };
      }

      if (record.register_number || record.roll_number || record.id) {
        grouped[dept_name][year][section_name][date][subject_code].students.push({
          register_number: record.register_number || record.roll_number || record.id,
          name: record.name || record.student_name || "Unknown",
          is_present: record.is_present === 1 || record.status === "Present",
          timestamp: record.timestamp || record.time || new Date().toLocaleTimeString(),
        });
      } else {
        console.warn(`Record at index ${index} missing student identifier:`, record);
      }
    });

    console.log("Grouped data:", grouped);
    console.log("Years in grouped data:", Object.values(grouped).flatMap((dept) => Object.keys(dept)));

    if (Object.keys(grouped).length === 0) {
      console.error("No valid groups could be created from data");
      setError("Could not process attendance data. Format may be incorrect or no valid records found.");
      setGroupedData({});
      return;
    }

    setGroupedData(grouped);

    const initialExpandedState = {};
    const depts = Object.keys(grouped);
    depts.forEach((dept, deptIndex) => {
      initialExpandedState[dept] = deptIndex === 0;
      Object.keys(grouped[dept] || {}).forEach((year, yearIndex) => {
        initialExpandedState[`${dept}-${year}`] = deptIndex === 0 && yearIndex === 0;
        Object.keys(grouped[dept][year] || {}).forEach((section, sectionIndex) => {
          initialExpandedState[`${dept}-${year}-${section}`] = deptIndex === 0 && yearIndex === 0 && sectionIndex === 0;
          Object.keys(grouped[dept][year][section] || {}).forEach((date, dateIndex) => {
            initialExpandedState[`${dept}-${year}-${section}-${date}`] =
              deptIndex === 0 && yearIndex === 0 && sectionIndex === 0 && dateIndex === 0;
            Object.keys(grouped[dept][year][section][date] || {}).forEach((subject) => {
              initialExpandedState[`${dept}-${year}-${section}-${date}-${subject}`] =
                deptIndex === 0 && yearIndex === 0 && sectionIndex === 0 && dateIndex === 0;
            });
          });
        });
      });
    });

    setExpandedGroups(initialExpandedState);
  };

  // Toggle group expansion
  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Render table rows hierarchically
  const renderTableRows = useMemo(() => {
    const rows = [];

    Object.entries(groupedData).forEach(([dept, years]) => {
      const deptId = dept;
      const isDeptExpanded = expandedGroups[deptId];

      rows.push(
        <tr key={deptId} className="bg-blue-100 font-semibold text-gray-800">
          <td colSpan={6} className="px-4 py-4 rounded-t-lg">
            <button
              onClick={() => toggleGroup(deptId)}
              className="flex items-center hover:text-blue-700 transition-colors duration-200 w-full text-left"
            >
              {isDeptExpanded ? (
                <ChevronDown size={20} className="mr-2 transition-transform duration-200" />
              ) : (
                <ChevronRight size={20} className="mr-2 transition-transform duration-200" />
              )}
              <span className="text-base">Department: {dept}</span>
            </button>
          </td>
        </tr>
      );

      if (!isDeptExpanded) return;

      Object.entries(years).forEach(([year, sections]) => {
        const yearId = `${deptId}-${year}`;
        const isYearExpanded = expandedGroups[yearId];

        rows.push(
          <tr key={yearId} className="bg-teal-50 font-medium text-gray-700">
            <td colSpan={6} className="px-6 py-3">
              <button
                onClick={() => toggleGroup(yearId)}
                className="flex items-center hover:text-teal-600 transition-colors duration-200 w-full text-left"
              >
                {isYearExpanded ? (
                  <ChevronDown size={18} className="mr-2 transition-transform duration-200" />
                ) : (
                  <ChevronRight size={18} className="mr-2 transition-transform duration-200" />
                )}
                <span className="text-sm">Year: {year || "Not Specified"}</span>
              </button>
            </td>
          </tr>
        );

        if (!isYearExpanded) return;

        Object.entries(sections).forEach(([section, dates]) => {
          const sectionId = `${yearId}-${section}`;
          const isSectionExpanded = expandedGroups[sectionId];

          rows.push(
            <tr key={sectionId} className="bg-green-50">
              <td colSpan={6} className="px-8 py-3">
                <button
                  onClick={() => toggleGroup(sectionId)}
                  className="flex items-center hover:text-green-600 transition-colors duration-200 w-full text-left"
                >
                  {isSectionExpanded ? (
                    <ChevronDown size={18} className="mr-2 transition-transform duration-200" />
                  ) : (
                    <ChevronRight size={18} className="mr-2 transition-transform duration-200" />
                  )}
                  <span className="text-sm">Section: {section}</span>
                </button>
              </td>
            </tr>
          );

          if (!isSectionExpanded) return;

          Object.entries(dates).forEach(([date, subjects]) => {
            const dateId = `${sectionId}-${date}`;
            const isDateExpanded = expandedGroups[dateId];

            rows.push(
              <tr key={dateId} className="bg-gray-100">
                <td colSpan={6} className="px-10 py-3">
                  <button
                    onClick={() => toggleGroup(dateId)}
                    className="flex items-center hover:text-gray-700 transition-colors duration-200 w-full text-left"
                  >
                    {isDateExpanded ? (
                      <ChevronDown size={18} className="mr-2 transition-transform duration-200" />
                    ) : (
                      <ChevronRight size={18} className="mr-2 transition-transform duration-200" />
                    )}
                    <span className="text-sm">Date: {formatDate(date)}</span>
                  </button>
                </td>
              </tr>
            );

            if (!isDateExpanded) return;

            Object.entries(subjects).forEach(([subject, { students }]) => {
              const subjectId = `${dateId}-${subject}`;
              const isSubjectExpanded = expandedGroups[subjectId];

              rows.push(
                <tr key={subjectId} className="bg-white border-t border-gray-200">
                  <td colSpan={6} className="px-12 py-3">
                    <button
                      onClick={() => toggleGroup(subjectId)}
                      className="flex items-center hover:text-blue-600 transition-colors duration-200 w-full text-left"
                    >
                      {isSubjectExpanded ? (
                        <ChevronDown size={18} className="mr-2 transition-transform duration-200" />
                      ) : (
                        <ChevronRight size={18} className="mr-2 transition-transform duration-200" />
                      )}
                      <span className="text-sm">Period: {subject}</span>
                    </button>
                  </td>
                </tr>
              );

              if (!isSubjectExpanded) return;

              students.forEach((student, idx) => {
                rows.push(
                  <tr
                    key={`${subjectId}-${student.register_number}`}
                    className={`${
                      idx % 2 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 transition-colors duration-150`}
                  >
                    <td className="px-14 py-3 text-sm text-gray-800">{student.register_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.is_present ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.is_present ? "Present" : "Absent"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{student.timestamp || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600"></td>
                    <td className="px-4 py-3 text-sm text-gray-600"></td>
                  </tr>
                );
              });

              const presentCount = students.filter((s) => s.is_present).length;
              const totalCount = students.length;
              rows.push(
                <tr
                  key={`${subjectId}-summary`}
                  className="bg-gray-200 font-medium text-gray-700 border-t border-gray-200"
                >
                  <td colSpan={2} className="px-14 py-2 text-sm">
                    Summary
                  </td>
                  <td className="px-4 py-2 text-sm text-center">
                    Present: {presentCount} / Absent: {totalCount - presentCount}
                  </td>
                  <td colSpan={3} className="px-4 py-2 text-sm"></td>
                </tr>
              );
            });
          });
        });
      });
    });

    return rows;
  }, [groupedData, expandedGroups]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto p-4 lg:p-6 mt-28 mb-16">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Attendance Records</h2>
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition"
            >
              <Filter size={18} className="mr-1" />
              {isFilterVisible ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {isFilterVisible && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="dept_name"
                    value={filters.dept_name}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option
                        key={typeof dept === "string" ? dept : dept.dept_name}
                        value={typeof dept === "string" ? dept : dept.dept_name}
                      >
                        {typeof dept === "string" ? dept : dept.dept_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    disabled={!filters.dept_name}
                  >
                    <option value="">All Years</option>
                    {years.map((year) => (
                      <option
                        key={typeof year === "string" || typeof year === "number" ? year : year.year}
                        value={typeof year === "string" || typeof year === "number" ? year : year.year}
                      >
                        {typeof year === "string" || typeof year === "number" ? year : year.year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <select
                    name="section_name"
                    value={filters.section_name}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    disabled={!filters.year}
                  >
                    <option value="">All Sections</option>
                    {sections.map((section) => (
                      <option
                        key={typeof section === "string" ? section : section.section_name || section.section_id}
                        value={typeof section === "string" ? section : section.section_name}
                      >
                        {typeof section === "string" ? section : section.section_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                  <select
                    name="subject_code"
                    value={filters.subject_code}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    disabled={!filters.year}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject.subject_code || subject.id} value={subject.subject_code}>
                        {subject.subject_name || subject.subject_code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <div className="relative">
                    <DatePicker
                      selected={filters.date}
                      onChange={handleDateChange}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                      placeholderText="All Dates"
                      dateFormat="MM/dd/yyyy"
                      isClearable
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Reset
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Apply Filters
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 p-4 text-center">{error}</div>
          ) : Object.keys(groupedData).length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100">
                <Calendar size={28} className="text-gray-500" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No attendance records</h3>
              <p className="mt-1 text-sm text-gray-500">
                {error || "Use the filters above to search for attendance records."}
              </p>
              <div className="mt-6">
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Search Records
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">{renderTableRows}</tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}