import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeadline } from "../../store/slices/deadlineSlice";
import { X } from "lucide-react";

const DeadlinesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    projectTitle: "",
    studentName: "",
    supervisor: "",
    deadlineDate: "",
    description: "",
  });

  const [selectedProject, setSelectedProject] = useState(null);
  const [query, setQuery] = useState("");

  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.admin);

  const [viewProjects, setViewProjects] = useState([]);

  /* -------------------- SYNC PROJECTS -------------------- */
  useEffect(() => {
    setViewProjects(projects || []);
  }, [projects]);

  /* -------------------- TABLE DATA -------------------- */
  const projectRows = useMemo(() => {
    return (viewProjects || []).map((p) => ({
      _id: p._id,
      title: p.title,
      studentName: p.student?.name || "-",
      studentEmail: p.student?.email || "-",
      studentDept: p.student?.department || "-", // ✅ safe access
      supervisor: p.supervisor || "-",
      deadline: p.deadline
        ? new Date(p.deadline).toISOString().slice(0, 10)
        : "-",
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "-",
      raw: p,
    }));
  }, [viewProjects]);

  /* -------------------- SEARCH -------------------- */
  const filteredProjects = useMemo(() => {
    return projectRows.filter((row) => {
      return (
        row.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [projectRows, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProject || !formData.deadlineDate) return;

    const deadlineData = {
      name: selectedProject?.student?.name,
      dueDate: formData.deadlineDate,
    };

    try {
      await dispatch(
        createDeadline({
          id: selectedProject._id,
          data: deadlineData,
        }),
      ).unwrap();

      setViewProjects((prev) =>
        prev.map((p) =>
          p._id === selectedProject._id
            ? { ...p, deadline: formData.deadlineDate }
            : p,
        ),
      );
    } catch (error) {
      console.error("Deadline creation failed:", error);
    } finally {
      setShowModal(false);
      setFormData({
        projectTitle: "",
        studentName: "",
        supervisor: "",
        deadlineDate: "",
        description: "",
      });
      setSelectedProject(null);
      setQuery("");
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title">Manage Deadlines</h1>
              <p className="card-subtitle">
                Create and monitor project deadline
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary mt-4 md:mt-0 active:scale-95 "
            >
              Create / Update Deadline
            </button>
          </div>

          {/* filters */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search Deadlines
                </label>
                <input
                  type="text"
                  placeholder="Search by project or student..."
                  className="input-field w-full focus:outline-none focus:ring-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Project Deadlines</h2>
          </div>
          <div className="overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    project title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    supervisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredProjects.map((row) => {
                  const formatDate = (dateString) => {
                    const date = new Date(dateString);
                    const options = {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    };
                    return date.toLocaleDateString("en-GB", options); // "12 June 2025"
                  };

                  return (
                    <tr key={row._id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {row.studentName}
                          </div>
                          <div className="text-sm text-slate-500">
                            {row.studentEmail}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3">{row.title}</td>

                      <td className="px-6 py-3">
                        {row?.supervisor ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {row.supervisor.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3">{formatDate(row.deadline)}</td>
                      <td className="px-6 py-3">{formatDate(row.updatedAt)}</td>
                    </tr>
                  );
                })}

                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center gap-3">
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
                            d="M9 12h6m-6 4h6M7 8h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>

                        <p className="text-sm font-medium text-slate-600">
                          No projects found
                        </p>

                        <p className="text-xs text-slate-400">
                          Try changing your search or add a new deadline
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredProjects.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6M7 8h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>

                  <p className="font-medium text-slate-600">
                    No projects found
                  </p>

                  <p className="text-xs text-slate-400">
                    Try changing your search or add a new deadline
                  </p>
                </div>
              </td>
            </tr>
          )}
        </div>

        {/* Modal  */}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-screen overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Create or update Deadlines
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Project Title</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Start typing to search projects"
                    value={query}
                    onChange={(e) => {
                      const value = e.target.value;

                      setQuery(value);
                      setSelectedProject(null);
                      setFormData((prev) => ({
                        ...prev,
                        projectTitle: value,
                      }));
                    }}
                  />
                  {query.trim() && !selectedProject && (
                    <div className="mt-2 border border-slate-200 rounded-md max-h-56 overflow-y-auto">
                      {(projects || [])
                        .filter((p) =>
                          (p.title || "")
                            .toLowerCase()
                            .includes(query.toLowerCase()),
                        )
                        .slice(0, 8)
                        .map((p) => (
                          <button
                            type="button"
                            key={p._id}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50"
                            onClick={() => {
                              setSelectedProject(p);
                              setQuery(p.title);

                              setFormData((prev) => ({
                                ...prev,
                                projectTitle: p.title,
                                deadlineDate: p.deadline
                                  ? new Date(p.deadline)
                                      .toISOString()
                                      .slice(0, 10)
                                  : "",
                              }));
                            }}
                            title={p.title}
                          >
                            <div className="text-sm font-medium text-slate-800 truncate">
                              {p.title}
                            </div>

                            <div className="text-xs text-slate-500 truncate">
                              {p.student?.name || "No student"} ·{" "}
                              {p.supervisor?.name || "No supervisor"}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">Deadline</label>
                  <input
                    type="date"
                    className="input-field w-full"
                    disabled={!selectedProject}
                    value={formData.deadlineDate}
                    onChange={(e) =>
                      setFormData({ ...formData, deadlineDate: e.target.value })
                    }
                  />
                </div>
                {selectedProject && (
                  <div className="mt-4 border border-slate-200 rounded-lg p-4 bg-slate-50 ">
                    <div className="mt-2">
                      <div className="text-sm font-semibold text-slate-900">
                        Project Details
                      </div>
                      <div
                        className="text-sm truncate text-slate-900"
                        title={selectedProject.description || ""}
                      >
                        {(selectedProject.description || "").length > 160
                          ? `${selectedProject.description.slice(0, 160)}...`
                          : selectedProject.description}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs to-slate-500">Status</div>
                        <div className="text-sm font-medium text-slate-800">
                          {selectedProject.status || "unknown"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Supervisor</div>
                        <div className="text-sm font-medium text-slate-800">
                          {selectedProject.supervisor?.name || "Not Assigned"}
                        </div>
                      </div>

                      <div className="md:col-span-2 ">
                        <div className="text-xs to-slate-500">Student</div>
                        <div className="text-sm font-medium text-slate-800">
                          {selectedProject.student?.name || "-"}
                          {selectedProject.student?.email || "-"}
                          {selectedProject.student?.department || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button className="btn-primary" type="submit">
                    Save Deadline
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DeadlinesPage;
