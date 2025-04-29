import React, { useState, useEffect, useMemo } from "react";
import { Filter, ChevronDown, ChevronUp, ChevronRight, Calendar, FileText, Download, Edit2, Save, X, Check } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function AdminPage() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isSuperuser = role === "superadmin"; // Check if user is a superuser
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
  const [editingRow, setEditingRow] = useState(null); // Track which row is being edited
  const [successMessage, setSuccessMessage] = useState('');
  const [editedData, setEditedData] = useState({}); // Store edited values

  // Fetch departments on component mount
  useEffect(() => {
    api
      .get("/departments")
      .then((response) => setDepartments(response.data))
      .catch((error) => console.error("Error fetching departments:", error));
  }, []);

  // Fetch years when department changes
  useEffect(() => {
    if (filters.dept_name) {
      api
        .get(`/years/${filters.dept_name}`)
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
      api
        .get(`/sections/${filters.dept_name}/${filters.year}`)
        .then((response) => setSections(response.data))
        .catch((error) => console.error("Error fetching sections:", error));

      api
        .get(`/subjects/${filters.dept_name}/${filters.year}`)
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
    setSuccessMessage('');

    // Always allow filtering with no specific filters - this will show all attendance records
    // Instead of requiring at least one filter
    
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
      console.log("Fetching attendance with params:", Object.fromEntries(params.entries()));
      const response = await api.get(`/attendance?${params.toString()}`);
      if (!response.data || !response.data.attendance || response.data.attendance.length === 0) {
        setError("No attendance records found for the selected filters");
        setAttendanceData([]);
        setGroupedData({});
        setLoading(false);
        return;
      }

      setAttendanceData(response.data.attendance);
      groupAttendanceData(response.data.attendance);
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
          attendance_id: record.attendance_id, // Ensure attendance_id is preserved
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
            const formattedDate = formatDate(date);

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
                    <span className="text-sm">Date: {formattedDate}</span>
                  </button>
                </td>
              </tr>
            );

            if (!isDateExpanded) return;
            
            // New date-centric display with subjects as columns
            // Gather all subjects for this date
            const allSubjects = Object.keys(subjects).sort();
            
            // Generate the table header row with subjects
            rows.push(
              <tr key={`${dateId}-header`} className="bg-indigo-50">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 w-28">Register Number</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 w-32">Name</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 w-24 hidden sm:table-cell">Department</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 w-16 hidden sm:table-cell">Year</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 w-16 hidden sm:table-cell">Section</th>
                {allSubjects.map(subject => (
                  <th 
                    key={`${dateId}-header-${subject}`}
                    className="px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[60px] max-w-[80px]"
                  >
                    <div className="truncate" title={subject}>{subject}</div>
                  </th>
                ))}
              </tr>            
            );
            // Collect all unique students for this date across all subjects
            const studentsMap = {};
            
            Object.entries(subjects).forEach(([subject, { students }]) => {
              students.forEach(student => {
                const key = student.register_number;
                if (!studentsMap[key]) {
                  studentsMap[key] = {
                    register_number: student.register_number,
                    name: student.name,
                    subjects: {}
                  };
                }
                
                // Store attendance for this subject
                studentsMap[key].subjects[subject] = {
                  is_present: student.is_present,
                  time: student.timestamp || "-"
                };
              });
            });
            
            // Sort students by register number
            const sortedStudents = Object.values(studentsMap).sort((a, b) => 
              a.register_number.localeCompare(b.register_number)
            );
            
            // Generate rows for each student with attendance for each subject
            sortedStudents.forEach((student, idx) => {
              const rowId = `${dateId}-student-${student.register_number}`;
              const isEditing = editingRow === rowId;
              
                rows.push(
                <tr 
                  key={rowId} 
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} ${isEditing ? "bg-blue-50" : ""} relative group`}
                >
                  {/* Responsive cell widths and padding */}
                  <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-800 whitespace-nowrap">{student.register_number}</td>
                  <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-800 max-w-[100px] sm:max-w-none truncate">{student.name}</td>
                  <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-800 hidden sm:table-cell">{dept}</td>
                  <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-800 hidden sm:table-cell">{year}</td>
                  <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-800 hidden sm:table-cell">{section}</td>
                  
                  {/* For each subject, show attendance status and time */}
                  {allSubjects.map(subject => {
                  const attendance = student.subjects[subject];
                  return (
                    <React.Fragment key={`${dateId}-student-${student.register_number}-${subject}`}>
                    <td className="px-1 sm:px-2 py-1 sm:py-2 text-xs text-center">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-center">
                      {attendance ? (
                        isEditing ? (
                        <select 
                          className={`w-full px-1 sm:px-2 py-0.5 sm:py-1 text-xs rounded-md border ${
                          editedData[`${student.register_number}-${subject}`] !== undefined ? 
                            editedData[`${student.register_number}-${subject}`] ? "border-green-500" : "border-red-500" :
                            attendance.is_present ? "border-green-500" : "border-red-500"
                          }`}
                          value={(editedData[`${student.register_number}-${subject}`] !== undefined) ? 
                          editedData[`${student.register_number}-${subject}`] : attendance.is_present}
                          onChange={(e) => {
                          const newValue = e.target.value === "true";
                          setEditedData(prev => ({
                            ...prev,
                            [`${student.register_number}-${subject}`]: newValue
                          }));
                          }}
                        >
                          <option value="true">Present</option>
                          <option value="false">Absent</option>
                        </select>
                        ) : (
                        <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                          attendance.is_present ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {attendance.is_present ? "P" : "A"}
                          <span className="hidden sm:inline">
                          {attendance.is_present ? "resent" : "bsent"}
                          </span>
                        </span>
                        )
                      ) : (
                        <span className="text-gray-400 text-[10px] sm:text-xs">N/A</span>
                      )}
                      </div>
                    </td>
                    </React.Fragment>
                  );
                  })}
                </tr>
                );
            });
            
            // Add a summary row for this date
            rows.push(
              <tr key={`${dateId}-summary`} className="bg-gray-200 font-medium text-gray-700 border-t border-gray-200">
                <td colSpan={5} className="px-4 py-2 text-sm">
                  Summary for {formattedDate}
                </td>
                
                {allSubjects.map(subject => {
                  const subjectStudents = subjects[subject]?.students || [];
                  const presentCount = subjectStudents.filter(s => s.is_present).length;
                  const totalCount = subjectStudents.length;
                  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
                  
                  return (
                    <React.Fragment key={`${dateId}-summary-${subject}`}>
                      <td colSpan={2} className="px-2 py-2 text-xs text-center border-r border-gray-300">
                        Present: {presentCount}/{totalCount} ({percentage}%)
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            );
          });
        });
      });
    });

    return rows;
  }, [groupedData, expandedGroups]);

  // Function to export data as XLSX with each date on a separate sheet
  const exportToXLSX = () => {
    if (Object.keys(groupedData).length === 0) {
      setError("No data to export");
      return;
    }
    
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Process data by dates for separate sheets
      const dateSheets = {};
      
      // Collect data for each date
      Object.entries(groupedData).forEach(([dept, years]) => {
        Object.entries(years).forEach(([year, sections]) => {
          Object.entries(sections).forEach(([section, dates]) => {
            Object.entries(dates).forEach(([date, subjects]) => {
              // Format the date for the sheet name
              const dateObj = new Date(date);
              const formattedDate = dateObj.toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              }).replace(/\//g, "-");
              
              // Initialize the date sheet if it doesn't exist
              if (!dateSheets[formattedDate]) {
                // Start with summary information
                dateSheets[formattedDate] = [
                  ["Attendance Report - " + formattedDate],
                  ["Department: " + dept, "Year: " + year, "Section: " + section],
                  [], // Empty row for spacing
                  // Header row
                  ["Register Number", "Name", "Department", "Year", "Section"]
                ];
                
                // Add each subject as additional columns in the header row
                const allSubjects = Object.keys(subjects).sort();
                allSubjects.forEach(subject => {
                  dateSheets[formattedDate][3].push(subject);
                });
              }
              
              // Create a map of students to make it easier to organize data
              const studentsMap = {};
              
              // Process all students for this date
              Object.entries(subjects).forEach(([subject, { students }]) => {
                students.forEach(student => {
                  const regNum = student.register_number;
                  
                  if (!studentsMap[regNum]) {
                    studentsMap[regNum] = {
                      register_number: regNum,
                      name: student.name,
                      department: dept,
                      year: year,
                      section: section,
                      attendance: {}
                    };
                  }
                  
                  // Record attendance for this subject
                  studentsMap[regNum].attendance[subject] = student.is_present ? "Present" : "Absent";
                });
              });
              
              // Get all subjects for this date to ensure we have complete rows
              const allSubjects = Object.keys(subjects).sort();
              
              // Sort students by register number
              const sortedStudents = Object.values(studentsMap).sort((a, b) => 
                a.register_number.localeCompare(b.register_number)
              );
              
              // Add each student as a row
              sortedStudents.forEach(student => {
                const row = [
                  student.register_number,
                  student.name,
                  student.department,
                  student.year,
                  student.section
                ];
                
                // Add attendance status for each subject
                allSubjects.forEach(subject => {
                  row.push(student.attendance[subject] || "N/A");
                });
                
                dateSheets[formattedDate].push(row);
              });
              
              // Add summary information at the bottom
              const summaryRow = ["SUMMARY", "", "", "", ""];
              allSubjects.forEach(subject => {
                const subjectStudents = subjects[subject]?.students || [];
                const presentCount = subjectStudents.filter(s => s.is_present).length;
                const totalCount = subjectStudents.length;
                const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
                
                summaryRow.push(`${presentCount}/${totalCount} (${percentage}%)`);
              });
              
              dateSheets[formattedDate].push([]);  // Empty row for spacing
              dateSheets[formattedDate].push(summaryRow);
            });
          });
        });
      });
      
      // Create a worksheet for each date and add it to the workbook
      Object.entries(dateSheets).forEach(([dateStr, rows]) => {
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        
        // Apply styling to the worksheet
        
        // Set column widths
        const columnWidths = [
          { wch: 15 }, // Register Number
          { wch: 25 }, // Name
          { wch: 15 }, // Department
          { wch: 8 },  // Year
          { wch: 10 }, // Section
        ];
        
        // Add column widths for each subject column
        const subjectCount = rows[3].length - 5;  // Count the subject columns
        for (let i = 0; i < subjectCount; i++) {
          columnWidths.push({ wch: 12 }); // Each subject column
        }
        
        worksheet['!cols'] = columnWidths;
        
        // Apply styles to the header row and title
        const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
        if (worksheet[titleCell]) {
          worksheet[titleCell].s = {
            font: { bold: true, sz: 14, color: { rgb: "000000" } }
          };
        }
        
        // Style the summary info row
        const infoRowCells = ["A2", "B2", "C2"];
        infoRowCells.forEach(cell => {
          if (worksheet[cell]) {
            worksheet[cell].s = {
              font: { bold: true, color: { rgb: "000000" } }
            };
          }
        });
        
        // Style the headers
        const headerRange = { s: { r: 3, c: 0 }, e: { r: 3, c: rows[3].length - 1 } };
        for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
          const headerCell = XLSX.utils.encode_cell({ r: 3, c: C });
          if (worksheet[headerCell]) {
            worksheet[headerCell].s = {
              fill: { fgColor: { rgb: "4682B4" } },
              font: { color: { rgb: "FFFFFF" }, bold: true },
              alignment: { horizontal: "center" }
            };
          }
        }
        
        // Style the summary row
        const lastRowIndex = rows.length - 1;
        for (let C = 0; C <= rows[lastRowIndex].length - 1; ++C) {
          const summaryCell = XLSX.utils.encode_cell({ r: lastRowIndex, c: C });
          if (worksheet[summaryCell]) {
            worksheet[summaryCell].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "EEEEEE" } }
            };
          }
        }
        
        // Add auto-filter for the data rows
        worksheet['!autofilter'] = { ref: XLSX.utils.encode_range({ r: 3, c: 0 }, { r: lastRowIndex - 2, c: rows[3].length - 1 }) };
        
        // Add the worksheet to the workbook with a sheet name based on the date
        XLSX.utils.book_append_sheet(workbook, worksheet, `Date ${dateStr}`);
      });
      
      // Create filename with date for uniqueness
      const currentDate = new Date().toISOString().split('T')[0];
      let filename = `attendance_report_${currentDate}`;
      if (filters.dept_name) filename += `_${filters.dept_name}`;
      if (filters.year) filename += `_Year${filters.year}`;
      if (filters.section_name) filename += `_${filters.section_name}`;
      if (filters.subject_code) filename += `_${filters.subject_code}`;
      
      // Write the workbook and trigger download
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      
    } catch (error) {
      console.error("Error exporting XLSX:", error);
      setError("Failed to export XLSX file");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto p-4 lg:p-6 mt-28 mb-16">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Attendance Records</h2>
            <div className="flex items-center gap-2">
              {/* Export buttons - only show when we have data */}
              {Object.keys(groupedData).length > 0 && (
                <div className="flex gap-2 mr-4">
                  <button
                    onClick={exportToXLSX}
                    className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    title="Export to XLSX"
                  >
                    <FileText size={16} className="mr-1" />
                    XLSX
                  </button>
                </div>
              )}
              <button
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="flex items-center text-blue-600 hover:text-blue-800 transition"
              >
                <Filter size={18} className="mr-1" />
                {isFilterVisible ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
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