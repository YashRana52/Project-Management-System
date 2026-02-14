import {
  AlertTriangle,
  CheckCircle2,
  FileDown,
  Folder,
  Plus,
  X,
} from "lucide-react";
import { formatDateReadable } from "../../components/date/date";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  approveProject,
  getProject,
  rejectProject,
} from "../../store/slices/adminSlice";

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSupervisor, setFilterSupervisor] = useState("all");
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);

  const [currentProject, setCurrentProject] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.admin);

  const supervisors = useMemo(() => {
    const set = new Set(
      projects.map((p) => p.supervisor?.name).filter(Boolean),
    );
    return Array.from(set);
  }, [projects]);

  //filter
  const filteredProjects = projects?.filter((project) => {
    const matchesSearch =
      (project.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.student?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || project.status === filterStatus;

    const matchesSupervisor =
      filterSupervisor === "all" ||
      project.supervisor?.name === filterSupervisor;

    return matchesSearch && matchesStatus && matchesSupervisor;
  });

  const files = useMemo(() => {
    return (projects || []).flatMap((p) =>
      (p.files || []).map((f) => ({
        projectId: p._id,
        fileId: f._id,
        fileUrl: f.fileUrl,
        originalName: f.originalName,
        uploadedAt: f.uploadedAt,
        projectTitle: p.title,
        studentName: p.student?.name,
      })),
    );
  }, [projects]);

  const filteredFiles = files?.filter((file) => {
    const search = reportSearch.toLowerCase();

    const matchesName =
      (file.originalName || "").toLowerCase().includes(search) ||
      (file.projectTitle || "").toLowerCase().includes(search) ||
      (file.studentName || "").toLowerCase().includes(search);

    return matchesName;
  });

  const handleDownloadFile = (file) => {
    if (!file?.fileUrl) {
      toast.error("File URL not found");
      return;
    }

    const downloadUrl = file.fileUrl.includes("/upload/")
      ? file.fileUrl.replace("/upload/", "/upload/fl_attachment/")
      : file.fileUrl;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = file.originalName || "file";
    link.target = "_blank";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Download started");
  };

  const handleStatusChange = async (projectId, newStatus) => {
    if (newStatus === "approved") {
      dispatch(approveProject(projectId));
    } else if (newStatus === "rejected") {
      dispatch(rejectProject(projectId));
    }
  };

  const projectStats = [
    {
      title: "Total Projects",
      value: projects.length,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
      Icon: Folder,
    },
    {
      title: "Pending Review",
      value: projects.filter((p) => p.status === "pending").length,
      bg: "bg-orange-100",
      iconColor: "text-orange-600",
      Icon: AlertTriangle,
    },
    {
      title: "Completed",
      value: projects.filter((p) => p.status === "completed").length,
      bg: "bg-green-100",
      iconColor: "text-green-600",
      Icon: CheckCircle2,
    },
    {
      title: "Rejected",
      value: projects.filter((p) => p.status === "rejected").length,
      bg: "bg-red-100",
      iconColor: "text-red-600",
      Icon: X,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title">All Projects</h1>
              <p className="card-subtitle">
                View and manage all student project across the plateform
              </p>
            </div>
            <button
              onClick={() => dispatch(setIsReportsOpen(true))}
              className="btn-primary flex items-center space-x-2 mt-4 md:mt-0 "
            >
              <FileDown className="w-5 h-5" />

              <span>Download Reports</span>
            </button>
          </div>
        </div>

        {/* Stats */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {projectStats.map((item, index) => (
            <div key={index} className="card">
              <div className="flex items-center ">
                <div className={`p-3 ${item.bg} rounded-lg `}>
                  <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">
                    {item.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-800">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* filters */}

        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Projects
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="Search by project title or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Status
              </label>

              <select
                className="input w-full"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Projects</option>
                <option value="pending">Pending Projects</option>
                <option value="approved">Approved Projects</option>
                <option value="completed">Completed Projects</option>
                <option value="rejected">Rejected project</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter Supervisors
              </label>

              <select
                className="input w-full"
                value={filterSupervisor}
                onChange={(e) => setFilterSupervisor(e.target.value)}
              >
                <option value="all">All Supervisors</option>
                {supervisors.map((supervisor) => (
                  <option key={supervisor} value={supervisor}>
                    {supervisor}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* projects table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Projects Overview</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Project Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Supervisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-200">
                {filteredProjects.length > 0 ? (
                  filteredProjects?.map((project) => (
                    <tr key={project._id}>
                      {/* Project Details */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {project.title}
                        </div>
                        <div className="text-sm text-slate-500 max-w-xs truncate">
                          {project.description}
                        </div>
                      </td>

                      {/* Student */}
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {project.student?.name}
                      </td>

                      {/* Supervisor */}
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {project.supervisor?.name || "Not Assigned"}
                      </td>

                      {/* Deadline */}
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {project.deadline
                          ? formatDateReadable(project.deadline)
                          : "N/A"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            project.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : project.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-sm font-medium  whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={async () => {
                              const res = await dispatch(
                                getProject(project._id),
                              );
                              if (!getProject.fulfilled.match(res)) return;
                              const detail =
                                res.payload?.project || res.payload;
                              setCurrentProject(detail);
                              setShowViewModal(true);
                            }}
                            className="btn-primary"
                          >
                            View
                          </button>

                          {project.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(project._id, "approved")
                                }
                                className="btn-secondary"
                              >
                                Approve
                              </button>

                              <button
                                onClick={() =>
                                  handleStatusChange(project._id, "rejected")
                                }
                                className="btn-danger"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
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
                          No projects found
                        </p>
                        <p className="text-xs text-slate-400">
                          Try changing your search or add a new project
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* VIEW MODAL */}

        {showViewModal && currentProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] shadow-2xl overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="text-2xl font-semibold text-slate-900">
                  Project Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Project Info */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">
                      Title
                    </label>
                    <div className="bg-slate-50 rounded-lg px-4 py-2 text-slate-800 font-medium">
                      {currentProject?.title}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">
                      Status
                    </label>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                        currentProject.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : currentProject.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {currentProject?.status || "-"}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">
                    Description
                  </label>
                  <div className="bg-slate-50 rounded-lg px-4 py-3 text-slate-800 whitespace-pre-line">
                    {currentProject?.description}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">
                      Student
                    </label>
                    <div className="bg-slate-50 rounded-lg px-4 py-2 text-slate-800">
                      {currentProject?.student?.name || "-"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">
                      Supervisor
                    </label>
                    <div className="bg-slate-50 rounded-lg px-4 py-2 text-slate-800">
                      {currentProject?.supervisor?.name || "Not Assigned"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">
                      Deadline
                    </label>
                    <div className="bg-slate-50 rounded-lg px-4 py-2 text-slate-800">
                      {formatDateReadable(currentProject?.deadline)}
                    </div>
                  </div>
                </div>

                {/* Files Section */}
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-2 block">
                    Files
                  </label>
                  {currentProject.files?.length === 0 ? (
                    <div className="text-slate-400 text-sm">
                      No files uploaded
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentProject.files.map((file) => (
                        <div
                          key={file._id || file.fileUrl}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg shadow-sm hover:shadow-md transition"
                        >
                          <div className="flex items-center space-x-3">
                            <Folder className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-slate-800 font-medium">
                                {file.originalName}
                              </p>
                              <p className="text-sm text-slate-500">
                                {currentProject.title}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="btn-outline btn-small px-3 py-1 rounded-lg text-sm hover:bg-slate-100 transition"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report MODAL */}

        {isReportsOpen && currentProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen shadow-xl overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  All Files
                </h3>
                <button
                  onClick={() => setIsReportsOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Search by file name, project title or student name"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                />
              </div>

              {filteredFiles.length === 0 ? (
                <div className="text-slate-500">No files found.</div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((f) => {
                    return (
                      <div
                        key={`${f.projectId}-${f.fileId}`}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded"
                      >
                        <div>
                          <div className="font-medium text-slate-800">
                            {f.originalName}
                          </div>
                          <div className="text-sm text-slate-500">
                            {f.projectTitle}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadFile(f)}
                          className="btn-outline btn-small"
                        >
                          Download
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectsPage;
