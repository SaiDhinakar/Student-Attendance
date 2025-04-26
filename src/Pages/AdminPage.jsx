import React, { useState, useEffect } from "react";
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
    axios.get("http://localhost:8000/departments")
      .then(response => setDepartments(response.data))
      .catch(error => console.error("Error fetching departments:", error));
  }, []);

  // Fetch years when department changes
  useEffect(() => {
    if (filters.dept_name) {
      axios.get(`http://localhost:8000/years/${filters.dept_name}`)
        .then(response => setYears(response.data))
        .catch(error => console.error("Error fetching years:", error));
      
      // Reset year and section when department changes
      setFilters(prev => ({
        ...prev,
        year: "",
        section_name: "",
        subject_code: ""
      }));
      setSections([]);
      setSubjects([]);
    }
  }, [filters.dept_name]);

  // Fetch sections when year changes
  useEffect(() => {
    if (filters.dept_name && filters.year) {
      axios.get(`http://localhost:8000/sections/${filters.dept_name}/${filters.year}`)
        .then(response => setSections(response.data))
        .catch(error => console.error("Error fetching sections:", error));
      
      // Fetch subjects for the department and year
      axios.get(`http://localhost:8000/subjects/${filters.dept_name}/${filters.year}`)
        .then(response => setSubjects(response.data))
        .catch(error => console.error("Error fetching subjects:", error));
      
      // Reset section when year changes
      setFilters(prev => ({
        ...prev,
        section_name: "",
        subject_code: ""
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
    setFilters(prev => ({
      ...prev,
      date: date
    }));
  };
  
  // Apply filters to fetch attendance data
  const handleApplyFilters = async () => {
    setLoading(true);
    setError(null);

    // Check if we have at least one filter
    if (!filters.dept_name && !filters.year && !filters.section_name && 
        !filters.subject_code && !filters.date) {
      setError("Please select at least one filter");
      setLoading(false);
      return;
    }

    // Prepare query parameters
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
      
      console.log("API Response:", response.data);
      
      if (!response.data) {
        setError("No attendance records found for the selected filters");
        setAttendanceData([]);
        setGroupedData({});
        return;
      }
      
      // Store the raw data
      setAttendanceData(response.data);
      
      // Process the data - handle both array and object formats
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
  
  // Group and organize attendance data
  // const groupAttendanceData = (data) => {
  //   // Check if data is wrapped in an attendance property
  //   const attendanceRecords = data.attendance || data;
    
  //   if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
  //     console.error("No valid attendance records found in data:", data);
  //     setGroupedData({});
  //     return;
  //   }
    
  //   console.log("Processing attendance records:", attendanceRecords.length);
    
  //   const grouped = {};
    
  //   // Process each attendance record
  //   attendanceRecords.forEach(record => {
  //     if (!record) return;
      
  //     // Get required fields with fallbacks
  //     const date = record.date || new Date().toISOString().split('T')[0];
  //     const dept_name = record.dept_name || filters.dept_name || "Unknown";
  //     const year = record.year || filters.year || "1";
  //     const section_name = record.section_name || filters.section_name || "A";
  //     const subject_code = record.subject_code || filters.subject_code || "Unknown";
      
  //     // Create structure if it doesn't exist
  //     if (!grouped[date]) grouped[date] = {};
  //     if (!grouped[date][year]) grouped[date][year] = {};
  //     if (!grouped[date][year][dept_name]) grouped[date][year][dept_name] = {};
  //     if (!grouped[date][year][dept_name][section_name]) {
  //       grouped[date][year][dept_name][section_name] = {
  //         subject: subject_code,
  //         students: []
  //       };
  //     }
      
  //     // Add this student to the appropriate section
  //     if (record.register_number || record.roll_number || record.id) {
  //       grouped[date][year][dept_name][section_name].students.push({
  //         register_number: record.register_number || record.roll_number || record.id,
  //         name: record.name || record.student_name || "Unknown",
  //         is_present: record.is_present === 1 || record.status === 'Present',
  //         timestamp: record.timestamp || record.time || new Date().toLocaleTimeString()
  //       });
  //     }
  //   });
    
  //   // Check if we've built any valid groups
  //   if (Object.keys(grouped).length === 0) {
  //     console.error("No valid groups could be created from data");
  //     setError("Could not process attendance data. Format may be incorrect.");
  //     setGroupedData({});
  //     return;
  //   }
    
  //   console.log("Grouped data:", grouped);
  //   setGroupedData(grouped);
    
  //   // Initialize all groups as collapsed, except first date which we'll expand
  //   const initialExpandedState = {};
  //   const dates = Object.keys(grouped);
    
  //   dates.forEach((date, index) => {
  //     // Expand the first date by default
  //     initialExpandedState[date] = index === 0;
      
  //     Object.keys(grouped[date] || {}).forEach(year => {
  //       initialExpandedState[`${date}-${year}`] = index === 0;
        
  //       Object.keys(grouped[date][year] || {}).forEach(dept => {
  //         initialExpandedState[`${date}-${year}-${dept}`] = index === 0;
          
  //         Object.keys(grouped[date][year][dept] || {}).forEach(section => {
  //           initialExpandedState[`${date}-${year}-${dept}-${section}`] = index === 0;
  //         });
  //       });
  //     });
  //   });
    
  //   setExpandedGroups(initialExpandedState);
  // };
  // Updated groupAttendanceData function with better year handling
const groupAttendanceData = (data) => {
  // Check if data is wrapped in an attendance property
  const attendanceRecords = data.attendance || data;
  
  if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
    console.error("No valid attendance records found in data:", data);
    setGroupedData({});
    return;
  }
  
  console.log("Processing attendance records:", attendanceRecords.length);
  
  const grouped = {};
  
  // Process each attendance record
  attendanceRecords.forEach(record => {
    if (!record) return;
    
    // Get required fields with fallbacks - use year directly from the record
    const date = record.date || new Date().toISOString().split('T')[0];
    const dept_name = record.dept_name || filters.dept_name || "Unknown";
    
    // Important: Extract the year directly from the record without fallback
    // This ensures we use the actual year value from the database
    const year = record.year ? String(record.year) : filters.year || "Unknown";
    
    const section_name = record.section_name || filters.section_name || "A";
    const subject_code = record.subject_code || filters.subject_code || "Unknown";
    
    // Create structure if it doesn't exist
    if (!grouped[date]) grouped[date] = {};
    if (!grouped[date][year]) grouped[date][year] = {};
    if (!grouped[date][year][dept_name]) grouped[date][year][dept_name] = {};
    if (!grouped[date][year][dept_name][section_name]) {
      grouped[date][year][dept_name][section_name] = {
        subject: subject_code,
        students: []
      };
    }
    
    // Add this student to the appropriate section
    if (record.register_number || record.roll_number || record.id) {
      grouped[date][year][dept_name][section_name].students.push({
        register_number: record.register_number || record.roll_number || record.id,
        name: record.name || record.student_name || "Unknown",
        is_present: record.is_present === 1 || record.status === 'Present',
        timestamp: record.timestamp || record.time || new Date().toLocaleTimeString()
      });
    }
  });
  
  // Debug logging for year values
  console.log("Years detected in data:", Object.keys(grouped).flatMap(date => 
    Object.keys(grouped[date]).map(year => ({ date, year }))
  ));
  
  if (Object.keys(grouped).length === 0) {
    console.error("No valid groups could be created from data");
    setError("Could not process attendance data. Format may be incorrect.");
    setGroupedData({});
    return;
  }
  
  console.log("Grouped data:", grouped);
  setGroupedData(grouped);
  
  // Initialize all groups as collapsed, except first date which we'll expand
  const initialExpandedState = {};
  const dates = Object.keys(grouped);
  
  dates.forEach((date, index) => {
    // Expand the first date by default
    initialExpandedState[date] = index === 0;
    
    Object.keys(grouped[date] || {}).forEach(year => {
      initialExpandedState[`${date}-${year}`] = index === 0;
      
      Object.keys(grouped[date][year] || {}).forEach(dept => {
        initialExpandedState[`${date}-${year}-${dept}`] = index === 0;
        
        Object.keys(grouped[date][year][dept] || {}).forEach(section => {
          initialExpandedState[`${date}-${year}-${dept}-${section}`] = index === 0;
        });
      });
    });
  });
  
  setExpandedGroups(initialExpandedState);
};
  
  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const sortTimeBlocks = (blocks) => {
    return [...blocks].sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      if (timeA[0] === timeB[0]) return timeA[1] - timeB[1];
      return timeA[0] - timeB[0];
    });
  };
  
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="dept_name"
                    value={filters.dept_name}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={typeof dept === 'string' ? dept : dept.dept_name} 
                              value={typeof dept === 'string' ? dept : dept.dept_name}>
                        {typeof dept === 'string' ? dept : dept.dept_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    disabled={!filters.dept_name}
                  >
                    <option value="">All Years</option>
                    {years.map((year) => (
                      <option key={typeof year === 'string' || typeof year === 'number' ? year : year.year} 
                              value={typeof year === 'string' || typeof year === 'number' ? year : year.year}>
                        {typeof year === 'string' || typeof year === 'number' ? year : year.year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <select
                    name="section_name"
                    value={filters.section_name}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    disabled={!filters.year}
                  >
                    <option value="">All Sections</option>
                    {sections.map((section) => (
                      <option key={typeof section === 'string' ? section : section.section_name || section.section_id} 
                              value={typeof section === 'string' ? section : section.section_name}>
                        {typeof section === 'string' ? section : section.section_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Code
                  </label>
                  <select
                    name="subject_code"
                    value={filters.subject_code}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    disabled={!filters.year}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject.subject_code || subject.id} 
                              value={subject.subject_code}>
                        {subject.subject_name || subject.subject_code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
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
            <div className="overflow-x-auto">
              <div className="space-y-6">
                {Object.keys(groupedData).map(date => (
                  <div key={date} className="border rounded-lg overflow-hidden">
                    <div 
                      className="bg-blue-50 p-3 cursor-pointer flex items-center"
                      onClick={() => toggleGroup(date)}
                    >
                      {expandedGroups[date] ? (
                        <ChevronDown size={20} className="text-blue-700 mr-2" />
                      ) : (
                        <ChevronRight size={20} className="text-blue-700 mr-2" />
                      )}
                      <h3 className="text-lg font-medium text-blue-800">
                        {formatDate(date)}
                      </h3>
                    </div>
                    
                    {expandedGroups[date] && (
                      <div className="p-2 space-y-4">
                        {Object.keys(groupedData[date])
                          .sort((a, b) => parseInt(a) - parseInt(b))
                          .map(year => (
                            <div key={`${date}-${year}`} className="border rounded-lg overflow-hidden ml-4">
                              <div 
                                className="bg-indigo-50 p-2 cursor-pointer flex items-center"
                                onClick={() => toggleGroup(`${date}-${year}`)}
                              >
                                {expandedGroups[`${date}-${year}`] ? (
                                  <ChevronDown size={18} className="text-indigo-700 mr-2" />
                                ) : (
                                  <ChevronRight size={18} className="text-indigo-700 mr-2" />
                                )}
                                <h4 className="font-medium text-indigo-800">
                                  Year {year}
                                </h4>
                              </div>
                              
                              {expandedGroups[`${date}-${year}`] && (
                                <div className="p-2 space-y-3">
                                  {Object.keys(groupedData[date][year]).map(dept => (
                                    <div key={`${date}-${year}-${dept}`} className="border rounded-lg overflow-hidden ml-4">
                                      <div 
                                        className="bg-purple-50 p-2 cursor-pointer flex items-center"
                                        onClick={() => toggleGroup(`${date}-${year}-${dept}`)}
                                      >
                                        {expandedGroups[`${date}-${year}-${dept}`] ? (
                                          <ChevronDown size={16} className="text-purple-700 mr-2" />
                                        ) : (
                                          <ChevronRight size={16} className="text-purple-700 mr-2" />
                                        )}
                                        <h5 className="font-medium text-purple-800">
                                          {dept} Department
                                        </h5>
                                      </div>
                                      
                                      {expandedGroups[`${date}-${year}-${dept}`] && (
                                        <div className="p-2 space-y-2">
                                          {Object.keys(groupedData[date][year][dept]).map(section => {
                                            // Get section data safely
                                            const sectionData = groupedData[date][year][dept][section];
                                            
                                            return (
                                              <div key={`${date}-${year}-${dept}-${section}`} className="border rounded-lg overflow-hidden ml-4">
                                                <div 
                                                  className="bg-teal-50 p-2 cursor-pointer flex items-center"
                                                  onClick={() => toggleGroup(`${date}-${year}-${dept}-${section}`)}
                                                >
                                                  {expandedGroups[`${date}-${year}-${dept}-${section}`] ? (
                                                    <ChevronDown size={16} className="text-teal-700 mr-2" />
                                                  ) : (
                                                    <ChevronRight size={16} className="text-teal-700 mr-2" />
                                                  )}
                                                  <h5 className="font-medium text-teal-800">
                                                    Section {section}
                                                  </h5>
                                                </div>
                                                
                                                {expandedGroups[`${date}-${year}-${dept}-${section}`] && (
                                                  <div className="overflow-x-auto p-3">
                                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                                                      <thead className="bg-gray-100">
                                                        <tr>
                                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                            Roll No
                                                          </th>
                                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                            Student Name
                                                          </th>
                                                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                            Status
                                                          </th>
                                                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                            Time
                                                          </th>
                                                        </tr>
                                                      </thead>
                                                      <tbody className="bg-white divide-y divide-gray-200">
                                                        {sectionData.students && sectionData.students.length > 0 ? (
                                                          sectionData.students.map((student, idx) => (
                                                            <tr key={`${student.register_number}-${idx}`} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {student.register_number}
                                                              </td>
                                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                {student.name}
                                                              </td>
                                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                                <span 
                                                                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                                                    student.is_present
                                                                      ? 'bg-green-100 text-green-800' 
                                                                      : 'bg-red-100 text-red-800'
                                                                  }`}
                                                                >
                                                                  {student.is_present ? 'Present' : 'Absent'}
                                                                </span>
                                                              </td>
                                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                                                                {student.timestamp || '-'}
                                                              </td>
                                                            </tr>
                                                          ))
                                                        ) : (
                                                          <tr>
                                                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                                              No student records found
                                                            </td>
                                                          </tr>
                                                        )}
                                                      </tbody>
                                                    </table>

                                                    {/* Summary Statistics */}
                                                    {sectionData.students && sectionData.students.length > 0 && (
                                                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                        <div className="flex flex-wrap gap-4">
                                                          <div className="text-sm">
                                                            <span className="font-medium text-gray-600">Total Students:</span>{" "}
                                                            <span className="text-gray-800">{sectionData.students.length}</span>
                                                          </div>
                                                          <div className="text-sm">
                                                            <span className="font-medium text-gray-600">Present:</span>{" "}
                                                            <span className="text-green-600">
                                                              {sectionData.students.filter(s => s.is_present).length}
                                                            </span>
                                                          </div>
                                                          <div className="text-sm">
                                                            <span className="font-medium text-gray-600">Absent:</span>{" "}
                                                            <span className="text-red-600">
                                                              {sectionData.students.filter(s => !s.is_present).length}
                                                            </span>
                                                          </div>
                                                          <div className="text-sm">
                                                            <span className="font-medium text-gray-600">Attendance Rate:</span>{" "}
                                                            <span className="text-blue-600">
                                                              {Math.round((sectionData.students.filter(s => s.is_present).length / 
                                                                sectionData.students.length) * 100)}%
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}