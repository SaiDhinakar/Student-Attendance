import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Download, X, ChevronDown, ChevronUp } from "lucide-react";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api/axiosInstance";

export default function AttendanceReport() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    dept_name: "",
    year: "",
    section_name: "",
    date: null, // Changed to null for the DatePicker
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [expandedPeriods, setExpandedPeriods] = useState({});
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [sections, setSections] = useState([]);
  const [error, setError] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // Changed to false to show content by default
  const [formData, setFormData] = useState({ dept_name: "", date: "" });
  const [debug, setDebug] = useState({ apiCalled: false, dataReceived: false, recordCount: 0 });

  // Fetch departments on mount and load form data from sessionStorage
  useEffect(() => {
    // Load form data from sessionStorage
    const storedForm = sessionStorage.getItem("attendanceForm");
    if (storedForm) {
      const parsedForm = JSON.parse(storedForm);
      setFormData({
        dept_name: parsedForm.dept_name || "",
        date: parsedForm.date || "",
      });
    }

    // Fetch departments first
    api
      .get("/departments")
      .then((response) => {
        console.log("Departments loaded:", response.data);
        setDepartments(response.data);
        
        // After departments are loaded, try to fetch attendance
        fetchInitialAttendance();
      })
      .catch((err) => {
        console.error("Failed to fetch departments:", err);
        setError("Failed to fetch departments");
      });
  }, []);

  // Function to fetch initial attendance data
  const fetchInitialAttendance = async () => {
    try {
      console.log("Fetching initial attendance data");
      const response = await api.get("/attendance");
      
      console.log("Initial attendance data:", response.data);
      
      if (response.data.attendance && response.data.attendance.length > 0) {
        processAttendanceData(response.data.attendance);
      } else {
        console.log("No initial attendance data found");
        setAttendanceData([]);
      }
    } catch (err) {
      console.error("Error fetching initial attendance:", err);
      setError("Could not load attendance data. Please try again.");
    }
  };

  // Function to process attendance data
  const processAttendanceData = (attendanceRecords) => {
    // Process the attendance data
    const processedData = [];
    const uniquePeriods = {};
    
    attendanceRecords.forEach(record => {
      const key = `${record.date}-${record.subject_code}-${record.start_time}-${record.end_time}`;
      
      if (!uniquePeriods[key]) {
        uniquePeriods[key] = {
          timetable_id: key,
          date: record.date,
          subject_code: record.subject_code,
          subject_name: record.subject_name,
          section_name: record.section_name,
          start_time: record.start_time,
          end_time: record.end_time,
          records: []
        };
        processedData.push(uniquePeriods[key]);
      }
      
      uniquePeriods[key].records.push(record);
    });
    
    console.log("Processed attendance data:", processedData);
    setAttendanceData(processedData);
    
    // Set all periods to expanded by default
    const newExpandedPeriods = {};
    processedData.forEach(period => {
      newExpandedPeriods[period.timetable_id] = true;
    });
    setExpandedPeriods(newExpandedPeriods);
    
    // Update debug state
    setDebug(prev => ({
      ...prev, 
      dataReceived: true,
      recordCount: attendanceRecords.length
    }));
  };

  // Fetch years when dept_name changes
  useEffect(() => {
    if (filters.dept_name) {
      api
        .get(`/years/${filters.dept_name}`)
        .then((response) => {
          setYears(response.data);
          // Reset dependent fields
          setFilters((prev) => ({
            ...prev,
            year: "",
            section_name: "",
          }));
          // Clear sections when department changes
          setSections([]);
        })
        .catch((err) => setError("Failed to fetch years"));
    } else {
      // Clear years and sections when no department is selected
      setYears([]);
      setSections([]);
    }
  }, [filters.dept_name]);

  // Fetch sections when year changes
  useEffect(() => {
    if (filters.dept_name && filters.year) {
      api
        .get(`/sections/${filters.dept_name}/${filters.year}`)
        .then((response) => {
          setSections(response.data);
          // Reset section when year changes
          setFilters((prev) => ({ ...prev, section_name: "" }));
        })
        .catch((err) => setError("Failed to fetch sections"));
    } else if (filters.dept_name) {
      // Clear sections when no year is selected
      setSections([]);
    }
  }, [filters.dept_name, filters.year]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  // Add a specific handler for date changes
  const handleDateChange = (date) => {
    setFilters((prev) => ({
      ...prev,
      date: date,
    }));
    setError(null);
  };

  // Add a useEffect to monitor the filters state for debugging purposes
  useEffect(() => {
    console.log("Current filters:", filters);
  }, [filters]);

  const handleApplyFilters = async () => {
    try {
      console.log("Applying filters:", filters);
      setError(null);
      setDebug(prev => ({ ...prev, apiCalled: true }));
      
      // Construct query parameters
      const params = {};
      
      if (filters.dept_name) {
        params.dept_name = filters.dept_name;
      }
      
      if (filters.year) {
        params.year = parseInt(filters.year, 10);
      }
      
      if (filters.section_name) {
        params.section_name = filters.section_name;
      }
      
      if (filters.date) {
        // Format the date for the API
        params.date = filters.date.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        });
      }
      
      console.log("Sending request with params:", params);
      
      // Make the API call using axios
      const response = await api.get("/attendance", { params });
      console.log("API Response received:", response.data);
      
      
      // Check if we have any attendance records - direct access to attendance array
      const attendanceRecords = response.data.attendance || [];
      
      if (attendanceRecords.length === 0) {
        console.log("No attendance data found");
        setAttendanceData([]);
        setError("No attendance records found for the selected filters");
        return;
      }
      
      console.log(`Found ${attendanceRecords.length} attendance records`);
      
      // Update debug state
      setDebug(prev => ({
        ...prev, 
        dataReceived: true,
        recordCount: attendanceRecords.length
      }));
      
      // Update UI with department and date info
      setFormData({
        dept_name: filters.dept_name || "All Departments",
        date: params.date || "All Dates",
      });
      
      // Group the attendance by unique combinations
      const uniquePeriods = {};
      
      attendanceRecords.forEach(record => {
        // Create composite key using subject, date, and time
        const key = `${record.date}-${record.subject_code}-${record.start_time}-${record.end_time}`;
        
        // Create a new period group if it doesn't exist
        if (!uniquePeriods[key]) {
          uniquePeriods[key] = {
            timetable_id: key, // Use this as a unique identifier
            subject_code: record.subject_code,
            subject_name: record.subject_name,
            section_name: record.section_name,
            date: record.date,
            start_time: record.start_time,
            end_time: record.end_time,
            records: []
          };
        }
        
        // Add this attendance record to the appropriate group
        uniquePeriods[key].records.push(record);
      });
      
      // Convert the grouped object to an array
      const processedData = Object.values(uniquePeriods);
      console.log("Processed data:", processedData);
      
      // Update state with the processed data
      setAttendanceData(processedData);
      
      // Set all periods to expanded by default
      const newExpandedPeriods = {};
      processedData.forEach(period => {
        newExpandedPeriods[period.timetable_id] = true;
      });
      setExpandedPeriods(newExpandedPeriods);
      
      // Close the filter modal
      setIsFilterModalOpen(false);
      
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError("Failed to fetch attendance data. Please check your connection and try again.");
      setAttendanceData([]);
    }
  };

  const togglePeriod = (timetable_id) => {
    setExpandedPeriods((prev) => ({
      ...prev,
      [timetable_id]: !prev[timetable_id],
    }));
  };

  const handleExport = () => {
    const data = [];
    attendanceData.forEach((period) => {
      // Add period header
      data.push({
        Period: `Subject: ${period.subject_name} (${period.subject_code})`,
        Time: `${period.start_time} - ${period.end_time}`,
        Date: period.date
      });
      // Add attendance records
      period.records.forEach((record) => {
        data.push({
          "Register Number": record.register_number,
          Name: record.name,
          Subject: record.subject_name,
          Date: record.date,
          Time: `${record.start_time} - ${record.end_time}`,
          Status: record.is_present ? "Present" : "Absent",
        });
      });
      // Add empty row for separation
      data.push({});
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

    // Generate appropriate filename based on filters applied
    let filename = "Attendance_Report";
    if (filters.dept_name) filename += `_${filters.dept_name}`;
    if (filters.date) {
      filename += `_${filters.date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }).replace(/\//g, "-")}`;
    }
    filename += ".xlsx";

    XLSX.writeFile(workbook, filename);
  };

  const resetFilters = () => {
    console.log("Resetting all filters");
    setFilters({
      dept_name: "",
      year: "",
      section_name: "",
      date: null,
    });
    
    // Close the filter modal if it's open
    setIsFilterModalOpen(false);
    
    // Fetch all attendance data without filters
    api.get("/attendance")
      .then(response => {
        console.log("Reset: fetched all attendance data", response.data);
        if (response.data.attendance && response.data.attendance.length > 0) {
          processAttendanceData(response.data.attendance);
          setFormData({ dept_name: "All Departments", date: "All Dates" });
        } else {
          setAttendanceData([]);
          setError("No attendance records found");
        }
      })
      .catch(err => {
        console.error("Error resetting filters:", err);
        setError("Failed to fetch attendance data after reset");
      });
  };

  // For debugging - display information about state
  // Will be removed in production
  const showDebugInfo = () => {
    return (
      <div className="bg-yellow-100 p-3 mb-4 text-xs">
        <h4>Debug Info:</h4>
        <ul>
          <li>API Called: {debug.apiCalled ? "Yes" : "No"}</li>
          <li>Data Received: {debug.dataReceived ? "Yes" : "No"}</li>
          <li>Records Count: {debug.recordCount}</li>
          <li>Periods Count: {attendanceData.length}</li>
          <li>Filter Modal Open: {isFilterModalOpen ? "Yes" : "No"}</li>
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto p-6 mt-28 mb-16">
        {/* Debug Info - REMOVE IN PRODUCTION */}
        {showDebugInfo()}
        
        {/* Filter Modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md animate-slideIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Filter size={20} /> Select Filters
                </h2>
                <button
                  onClick={() => {
                    setIsFilterModalOpen(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    name="dept_name"
                    value={filters.dept_name}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.dept_name} value={dept.dept_name}>
                        {dept.dept_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Year
                  </label>
                  <select
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Year</option>
                    {years.map((y) => (
                      <option key={y.year} value={y.year}>
                        {y.year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Section
                  </label>
                  <select
                    name="section_name"
                    value={filters.section_name}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Section</option>
                    {sections.map((s) => (
                      <option key={s.section_id} value={s.section_name}>
                        {s.section_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <DatePicker
                    selected={filters.date}
                    onChange={handleDateChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    placeholderText="MM/DD/YYYY"
                    dateFormat="MM/dd/yyyy"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {!filters.dept_name && !filters.year && !filters.section_name && !filters.date
                    ? "Show All Records"
                    : "Apply Filters"}
                </button>
                <button
                  onClick={resetFilters}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Attendance Records
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <Filter size={16} />
                Change Filters
              </button>
              {attendanceData.length > 0 && (
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Download size={16} />
                  Export to Excel
                </button>
              )}
            </div>
          </div>

          {/* Display Selected Department and Date */}
          {(formData.dept_name || formData.date) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg animate-slideIn">
              <div className="flex gap-6">
                {formData.dept_name && (
                  <p className="text-gray-700">
                    <span className="font-medium">Department:</span>{" "}
                    {formData.dept_name}
                  </p>
                )}
                {formData.date && (
                  <p className="text-gray-700">
                    <span className="font-medium">Date:</span> {formData.date}
                  </p>
                )}
              </div>
            </div>
          )}

          {attendanceData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No attendance records found. Try different filters or show all records.
              </p>
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Open Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {attendanceData.map((period) => {
                const isExpanded = expandedPeriods[period.timetable_id];
                const presentCount = period.records.filter(
                  (r) => r.is_present
                ).length;
                const totalCount = period.records.length;
                return (
                  <div
                    key={period.timetable_id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-50 p-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {period.subject_name} ({period.subject_code})
                        </h3>
                        <p className="text-gray-600">
                          Date: {period.date} • Time: {period.start_time} - {period.end_time}
                        </p>
                      </div>
                      <button
                        onClick={() => togglePeriod(period.timetable_id)}
                        className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-200 transition"
                        aria-label={isExpanded ? "Collapse period" : "Expand period"}
                      >
                        {isExpanded ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="p-4 animate-slideIn">
                        <div className="mb-4 flex gap-4">
                          <span className="text-sm text-gray-600">
                            Present: <span className="text-green-600">{presentCount}</span>
                          </span>
                          <span className="text-sm text-gray-600">
                            Absent: <span className="text-red-600">{totalCount - presentCount}</span>
                          </span>
                          <span className="text-sm text-gray-600">
                            Total: {totalCount}
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="py-3 px-4 text-gray-700 font-semibold">
                                  Register Number
                                </th>
                                <th className="py-3 px-4 text-gray-700 font-semibold">
                                  Name
                                </th>
                                {/* Time column removed
                                <th className="py-3 px-4 text-gray-700 font-semibold">
                                  Time
                                </th>
                                */}
<th className="py-3 px-4 text-gray-700 font-semibold">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {period.records.map((record) => (
                                <tr
                                  key={record.attendance_id}
                                  className="border-t border-gray-200 hover:bg-gray-50"
                                >
                                  <td className="py-3 px-4">{record.register_number}</td>
                                  <td className="py-3 px-4">{record.name}</td>
                                  <td className="py-3 px-4">
                                    {record.is_present ? (
                                      <span className="text-green-600 font-medium">
                                        Present
                                      </span>
                                    ) : (
                                      <span className="text-red-600 font-medium">
                                        Absent
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Custom Animation */}
      <style>
        {`
          .animate-slideIn {
            animation: slideIn 0.3s ease-in-out;
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
      <Footer />
    </div>
  );
}