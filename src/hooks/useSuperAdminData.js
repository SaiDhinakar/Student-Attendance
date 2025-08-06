import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axiosInstance';

export const useSuperAdminData = () => {
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Edit modal state
  const [editModal, setEditModal] = useState({
    isOpen: false,
    type: "",
    data: null,
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [
          deptRes,
          batchRes,
          sectionRes,
          subjectRes,
          studentRes,
          adminRes,
          timeBlockRes,
        ] = await Promise.all([
          api.get("/departments"),
          api.get("/batches"),
          api.get("/sections"),
          api.get("/subjects"),
          api.get("/students"),
          api.get("/admins"),
          api.get("/time-blocks"),
        ]);
        
        setDepartments(deptRes.data);
        setBatches(batchRes.data);
        setSections(sectionRes.data);
        setSubjects(subjectRes.data);
        setStudents(studentRes.data);
        setAdmins(adminRes.data);
        setTimeBlocks(timeBlockRes.data);
      } catch (error) {
        setError(
          "Failed to load data: " +
            (error.response?.data?.detail || error.message)
        );
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if we don't already have data
    if (departments.length === 0 && batches.length === 0 && !loading) {
      fetchData();
    }
  }, [departments.length, batches.length, loading]);

  // CRUD Handlers
  const handleAdd = useCallback(async (type, payload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/${type}`, payload);

      // Update state without changing active tab
      switch (type) {
        case "departments":
          setDepartments(prev => [...prev, response.data]);
          break;
        case "batches":
          setBatches(prev => [...prev, response.data]);
          break;
        case "sections":
          setSections(prev => [...prev, response.data]);
          break;
        case "subjects":
          setSubjects(prev => [...prev, response.data]);
          break;
        case "students":
          setStudents(prev => [...prev, response.data]);
          break;
        case "admins":
          setAdmins(prev => [...prev, response.data]);
          break;
        case "time-blocks":
          setTimeBlocks(prev => [...prev, response.data]);
          break;
      }
      
      return response.data;
    } catch (error) {
      setError(
        "Failed to add: " + (error.response?.data?.detail || error.message)
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit = useCallback((type, data) => {
    setEditModal({
      isOpen: true,
      type,
      data,
    });
  }, []);

  const handleUpdate = useCallback(async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const { type, data } = editModal;
      let endpoint = `/${type}`;
      let updateData = { ...data };

      // Handle specific update endpoints and data formatting
      switch (type) {
        case "departments":
          endpoint = `/departments/${data.old_name || data.dept_name}`;
          break;
        case "batches":
          endpoint = `/batches/${data.batch_id}`;
          break;
        case "sections":
          endpoint = `/sections/${data.section_id}`;
          break;
        case "subjects":
          endpoint = `/subjects/${data.old_code || data.subject_code}`;
          break;
        case "students":
          endpoint = `/students/${data.register_number}`;
          break;
        case "admins":
          endpoint = `/admins/${data.id}`;
          // Don't include password if it's empty
          if (!data.password) {
            delete updateData.password;
          }
          break;
        case "time-blocks":
          endpoint = `/time-blocks/${data.time_block_id}`;
          break;
      }

      const response = await api.put(endpoint, updateData);

      // Update state
      switch (type) {
        case "departments":
          setDepartments(prev => prev.map(item => 
            item.dept_name === (data.old_name || data.dept_name) ? response.data : item
          ));
          break;
        case "batches":
          setBatches(prev => prev.map(item => 
            item.batch_id === data.batch_id ? response.data : item
          ));
          break;
        case "sections":
          setSections(prev => prev.map(item => 
            item.section_id === data.section_id ? response.data : item
          ));
          break;
        case "subjects":
          setSubjects(prev => prev.map(item => 
            item.subject_code === (data.old_code || data.subject_code) ? response.data : item
          ));
          break;
        case "students":
          setStudents(prev => prev.map(item => 
            item.register_number === data.register_number ? response.data : item
          ));
          break;
        case "admins":
          setAdmins(prev => prev.map(item => 
            item.id === data.id ? response.data : item
          ));
          break;
        case "time-blocks":
          setTimeBlocks(prev => prev.map(item => 
            item.time_block_id === data.time_block_id ? response.data : item
          ));
          break;
      }

      setEditModal({ isOpen: false, type: "", data: null });
      setSuccessMessage(`${type.slice(0, -1)} updated successfully`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setError(
        "Failed to update: " + (error.response?.data?.detail || error.message)
      );
    } finally {
      setLoading(false);
    }
  }, [editModal]);

  const handleDelete = useCallback(async (type, id, e) => {
    e.preventDefault();
    
    if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/${type}/${id}`);

      // Update state
      switch (type) {
        case "departments":
          setDepartments(prev => prev.filter(item => item.dept_name !== id));
          break;
        case "batches":
          setBatches(prev => prev.filter(item => item.batch_id !== id));
          break;
        case "sections":
          setSections(prev => prev.filter(item => item.section_id !== id));
          break;
        case "subjects":
          setSubjects(prev => prev.filter(item => item.subject_code !== id));
          break;
        case "students":
          setStudents(prev => prev.filter(item => item.register_number !== id));
          break;
        case "admins":
          setAdmins(prev => prev.filter(item => item.id !== id));
          break;
        case "time-blocks":
          setTimeBlocks(prev => prev.filter(item => item.time_block_id !== id));
          break;
      }

      setSuccessMessage(`${type.slice(0, -1)} deleted successfully`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setError(
        "Failed to delete: " + (error.response?.data?.detail || error.message)
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCsvUpload = useCallback(async (csvFile, csvDept, csvYear) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append("file", csvFile);
      formData.append("dept_name", csvDept);
      formData.append("year", csvYear);

      const response = await api.post("/students/upload-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh students data
      const studentsRes = await api.get("/students");
      setStudents(studentsRes.data);
      
      setSuccessMessage("CSV uploaded successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      return response.data;
    } catch (error) {
      setError(
        "Failed to upload CSV: " + (error.response?.data?.detail || error.message)
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    departments,
    batches,
    sections,
    subjects,
    students,
    timeBlocks,
    admins,
    loading,
    error,
    successMessage,
    editModal,
    
    // Setters
    setSuccessMessage,
    setEditModal,
    
    // Handlers
    handleAdd,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleCsvUpload,
  };
};
