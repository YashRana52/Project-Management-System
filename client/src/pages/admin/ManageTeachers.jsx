import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddTeacher from "../../components/modal/AddTeacher";
import { deleteTeacher, updateTeacher } from "../../store/slices/adminSlice";
import { toggleTeacherModal } from "../../store/slices/popupSlice";
import { BadgeCheck, Plus, TriangleAlert, Users, X } from "lucide-react";

const ManageTeachers = () => {
  const dispatch = useDispatch();

  const { users = [] } = useSelector((state) => state.admin);
  const { isCreateTeacherModalOpen } = useSelector((state) => state.popup);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    experties: "",
    maxStudents: 10,
  });

  /* -------------------- DATA -------------------- */

  const teachers = useMemo(() => {
    return (users || []).filter((u) => u?.role?.toLowerCase() === "teacher");
  }, [users]);

  const departments = useMemo(() => {
    return Array.from(
      new Set(teachers.map((t) => t.department).filter(Boolean)),
    );
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchesSearch =
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept =
        filterDepartment === "all" || t.department === filterDepartment;

      return matchesSearch && matchesDept;
    });
  }, [teachers, searchTerm, filterDepartment]);

  /* -------------------- EDIT -------------------- */

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name || "",
      email: teacher.email || "",
      department: teacher.department || "",
      experties: Array.isArray(teacher.experties)
        ? teacher.experties.join(", ")
        : teacher.experties || "",
      maxStudents: teacher.maxStudents || 10,
    });
    setShowEditModal(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    dispatch(
      updateTeacher({
        id: editingTeacher._id,
        data: {
          ...formData,
          experties: formData.experties.split(",").map((e) => e.trim()),
        },
      }),
    );

    closeEditModal();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTeacher(null);
  };

  /* -------------------- DELETE -------------------- */

  const handleDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    dispatch(deleteTeacher(teacherToDelete._id));
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div>
            <h1 className="card-title">Manage Teachers</h1>
            <p className="card-subtitle">Add, edit and manage teachers</p>
          </div>

          <button
            onClick={() => dispatch(toggleTeacherModal())}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center gap-4">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-sm text-slate-600">Total Teachers</p>
            <p className="text-lg font-semibold">{teachers.length}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <BadgeCheck className="w-8 h-8 text-purple-600" />
          <div>
            <p className="text-sm text-slate-600">Assigned Students</p>
            <p className="text-lg font-semibold">
              {teachers.reduce(
                (sum, t) => sum + (t.assignedStudents?.length || 0),
                0,
              )}
            </p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <TriangleAlert className="w-8 h-8 text-yellow-600" />
          <div>
            <p className="text-sm text-slate-600">Departments</p>
            <p className="text-lg font-semibold">{departments.length}</p>
          </div>
        </div>
      </div>
      {/* Search & Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Teachers
            </label>
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-300
                   focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Department Filter */}
          <div className="w-full md:w-56">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter Department
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-300
                   focus:ring-2 focus:ring-indigo-500 outline-none"
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

      {/* Teachers Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left">Teacher</th>
              <th className="px-6 py-3 text-left">Department</th>
              <th className="px-6 py-3 text-left">Experties</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filteredTeachers && filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{teacher.name}</div>
                    <div className="text-sm text-slate-500">
                      {teacher.email}
                    </div>
                  </td>

                  <td className="px-6 py-4">{teacher.department || "---"}</td>

                  <td className="px-6 py-4">
                    {Array.isArray(teacher.experties)
                      ? teacher.experties.join(", ")
                      : teacher.experties || "---"}
                  </td>

                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(teacher)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-16">
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
                      No teachers found
                    </p>

                    <p className="text-xs text-slate-400">
                      Try changing your search or add a new teacher
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Edit Teacher
              </h3>
              <button
                onClick={closeEditModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 border-b border-slate-600 focus:outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-2 border-b border-slate-600 focus:outline-none"
                />
              </div>

              {/* Experties */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Experties
                </label>
                <input
                  type="text"
                  placeholder="Comma separated"
                  value={formData.experties}
                  onChange={(e) =>
                    setFormData({ ...formData, experties: e.target.value })
                  }
                  className="w-full p-2 border-b border-slate-600 focus:outline-none"
                />
              </div>

              {/* Max Students */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Max Students
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={formData.maxStudents}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxStudents: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border-b border-slate-600 focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn-danger"
                >
                  Cancel
                </button>

                <button type="submit" className="btn-primary">
                  Update Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 text-center">
            <TriangleAlert className="mx-auto text-red-600 w-8 h-8" />
            <p className="mt-4">
              Delete <strong>{teacherToDelete?.name}</strong>?
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={cancelDelete} className="btn-secondary">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateTeacherModalOpen && <AddTeacher />}
    </div>
  );
};

export default ManageTeachers;
