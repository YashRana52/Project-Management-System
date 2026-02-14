import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { deleteStudent, updateStudent } from "../../store/slices/adminSlice";
import {
  AlertTriangle,
  CheckCircle,
  Plus,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { toggleStudentModal } from "../../store/slices/popupSlice";
import AddStudent from "../../components/modal/AddStudent";

const ManageStudents = () => {
  const { users, projects } = useSelector((state) => state.admin);
  const { isCreateStudentModalOpen } = useSelector((state) => state.popup);
  console.log(users);

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const students = useMemo(() => {
    const studentsUsers = (users || []).filter(
      (u) => u?.role && u.role.toLowerCase() === "student",
    );

    return studentsUsers.map((student) => {
      const studentProjects = (projects || []).find(
        (p) => p?.student === student?._id,
      );

      return {
        ...student,
        projectTitle: student.project?.title || null,
        supervisor: student.supervisor || null,
        projectStatus: student.project?.status || null,
      };
    });
  }, [users, projects]);

  const departments = useMemo(() => {
    const set = new Set(
      (students || []).map((s) => s.department).filter(Boolean),
    );

    return Array.from(set);
  }, [students]);

  const filteresStudents = students.filter((student) => {
    const matchesSearch =
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterDepartment === "all" || student.department === filterDepartment;
    return matchesSearch && matchesFilter;
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      department: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingStudent) {
      dispatch(updateStudent({ id: editingStudent._id, data: formData }));
    }

    handleCloseModal();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      department: student.department,
    });
    setShowModal(true);
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      dispatch(deleteStudent(studentToDelete._id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="card-title">Manage Students</h1>
            <p className="card-subtitle">
              Add, edit and manage students accounts
            </p>
          </div>
          <button
            onClick={() => dispatch(toggleStudentModal())}
            className="btn-primary flex items-center space-x-2 mt-4 md:mt-0 "
          >
            <Plus className="w-5 h-5" />

            <span>Add new Student</span>
          </button>
        </div>
      </div>
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-md text-slate-600">Total Students</p>
              <p className="text-lg font-semibold text-slate-800">
                {students.length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-md text-slate-600">
                Completed Projects
              </p>
              <p className="text-lg font-semibold text-slate-800">
                {students.filter((s) => s.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TriangleAlert className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-md text-slate-600">Unassigned</p>
              <p className="text-lg font-semibold text-slate-800">
                {students.filter((s) => !s.supervisor).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-sky-700 mb-2">
              Search Students
            </label>

            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
            w-full
            h-11
            pl-10 pr-10
            rounded-xl
            border border-slate-300
            bg-white
            text-slate-900
            placeholder-slate-400
            outline-none
            transition
            focus:ring-2
            focus:ring-indigo-500
            focus:border-indigo-500
          "
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter */}
          <div className="w-full md:w-56">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter Department
            </label>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="
          w-full
          h-11
          px-4
          rounded-xl
          border border-slate-300
          bg-white
          text-slate-900
          outline-none
          transition
          focus:ring-2
          focus:ring-indigo-500
          focus:border-indigo-500
        "
            >
              <option value="all">All Departments</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Students List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Student Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Department & Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Supervisor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Project Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-200">
              {filteresStudents && filteresStudents.length > 0 ? (
                filteresStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {student.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {student.email}
                        </div>
                        {student.studentId && (
                          <div className="text-xs text-slate-400">
                            ID:{student.studentId}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {student.department || "---"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {student.createdAt
                          ? new Date(student.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              },
                            )
                          : "--"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.supervisor ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-green-800 bg-green-100 text-xs font-medium">
                          {student.supervisor.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-red-800 bg-red-100 text-xs font-medium">
                          {student.projectStatus === "rejected"
                            ? "Rejected"
                            : "Not Assigned"}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        {student.projectTitle || "---"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleEdit(student)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-blue-900"
                          onClick={() => handleDelete(student)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                // Centered fallback when no students
                <tr>
                  <td colSpan={5} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 11c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3zM8 21v-2c0-2.21 3.58-4 8-4s8 1.79 8 4v2H8zM6 11c1.656 0 3-1.344 3-3S7.656 5 6 5 3 6.344 3 8s1.344 3 3 3z"
                        />
                      </svg>

                      <p className="text-sm font-medium text-slate-600">
                        No students found
                      </p>
                      <p className="text-xs text-slate-400">
                        Try changing your search or add a new student
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit students modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              {/* modal ka header h ye */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Edit Students
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* input field */}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-s">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field w-full p-2 border-b border-slate-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-s">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input-field w-full p-2 border-b border-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-s">
                    Department
                  </label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="input-field w-full p-2 border-b border-slate-600 focus:outline-none"
                  >
                    <option value={"Computer Science"}>Computer Science</option>
                    <option value={"Software Engineering"}>
                      Software Engineering
                    </option>
                    <option value={"Information Technology"}>
                      Information Technology
                    </option>
                    <option value={"Data Science"}>Data Science</option>
                    <option value={"Mechanical Engineering"}>
                      Mechanical Engineering
                    </option>
                    <option value={"Civil Engineering"}>
                      Civil Engineering
                    </option>
                    <option value={"Bussiness Administration"}>
                      Bussiness Administration
                    </option>
                    <option value={"Economics"}>Economics</option>
                    <option value={"Psychology"}>Psychology</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-danger"
                  >
                    Cancel
                  </button>

                  <button type="submit" className="btn-primary">
                    Update Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scaleIn">
              {/* Header Icon */}
              <div className="flex justify-center mt-6">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center px-6 py-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  Delete Student
                </h3>

                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Are you sure you want to delete
                  <span className="font-semibold text-slate-900">
                    {" "}
                    {studentToDelete?.name}
                  </span>
                  ?
                  <br />
                  <span className="text-red-500 font-medium">
                    This action cannot be undone.
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-3 px-6 pb-6">
                <button
                  onClick={cancelDelete}
                  className="btn-secondary px-5 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn-danger px-5 py-2 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {isCreateStudentModalOpen && <AddStudent />}
      </div>
    </div>
  );
};

export default ManageStudents;
