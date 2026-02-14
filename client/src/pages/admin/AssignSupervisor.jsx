import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  assignSupervisor as assignSupervisorThunk,
  getAllUsers,
} from "../../store/slices/adminSlice";
import { AlertTriangle, CheckCircle, Users } from "lucide-react";

const AssignSupervisor = () => {
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [pendingFor, setPendingFor] = useState(null);

  const { projects, users } = useSelector((state) => state.admin);

  const formatDate = (dateString) => {
    if (!dateString || dateString === "-") return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  /* FETCH USERS */
  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(getAllUsers());
    }
  }, [dispatch, users]);

  /* TEACHERS */
  const teachers = useMemo(() => {
    return (users || [])
      .filter((u) => (u.role || "").toLowerCase() === "teacher")
      .map((t) => {
        const assigned = Array.isArray(t.assignedStudents)
          ? t.assignedStudents.length
          : 0;
        const max = t.maxStudents ?? 0;

        return {
          ...t,
          assignedCount: assigned,
          capacityLeft: Math.max(max - assigned, 0),
        };
      });
  }, [users]);

  /* STUDENT PROJECTS */
  const studentProjects = useMemo(() => {
    return (projects || [])
      .filter((p) => !!p.student?._id)
      .map((p) => ({
        projectId: p._id,
        title: p.title,
        status: p.status,

        supervisor: p.supervisor?.name || "",
        supervisorId: p.supervisor?._id || null,

        studentId: p.student?._id,
        studentName: p.student?.name || "",
        studentEmail: p.student?.email || "",

        deadline: p.deadline || "-",
        updatedAt: p.updatedAt || "-",

        isApproved: p.status === "approved",
      }));
  }, [projects]);

  /* FILTER */
  const filtered = useMemo(() => {
    return studentProjects.filter((row) => {
      const matchesSearch =
        row.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.studentName.toLowerCase().includes(searchTerm.toLowerCase());

      const status = row.supervisor ? "assigned" : "unassigned";
      const matchesFilter = filterStatus === "all" || status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [studentProjects, searchTerm, filterStatus]);

  /* SELECT SUPERVISOR */
  const handleSupervisorSelect = (projectId, supervisorId) => {
    setSelectedSupervisor((prev) => ({
      ...prev,
      [projectId]: supervisorId,
    }));
  };

  /* ASSIGN */
  const handleAssign = async (studentId, projectStatus, projectId) => {
    const supervisorId = selectedSupervisor[projectId];

    if (!studentId || !supervisorId) {
      toast.error("Please select a supervisor first");
      return;
    }

    if (projectStatus === "rejected") {
      toast.error("Cannot assign supervisor to a rejected project");
      return;
    }

    setPendingFor(projectId);

    const res = await dispatch(
      assignSupervisorThunk({ studentId, supervisorId }),
    );

    setPendingFor(null);

    if (assignSupervisorThunk.fulfilled.match(res)) {
      toast.success("Supervisor assigned successfully");

      setSelectedSupervisor((prev) => {
        const copy = { ...prev };
        delete copy[projectId];
        return copy;
      });

      dispatch(getAllUsers());
    } else {
      toast.error("Failed to assign supervisor");
    }
  };

  /* BADGE */
  const Badge = ({ color, children }) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {children}
    </span>
  );

  const dashboardCards = [
    {
      title: "Assigned Students",
      value: studentProjects.filter((r) => !!r.supervisor).length,
      icon: CheckCircle,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Unassigned Students",
      value: studentProjects.filter((r) => !r.supervisor).length,
      icon: AlertTriangle,
      bg: "bg-red-100",
      color: "text-red-600",
    },
    {
      title: "Available Teachers",
      value: teachers.filter(
        (t) => (t.assignedCount ?? 0) < (t.maxStudents ?? 0),
      ).length,
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* LEFT : TITLE */}
              <div>
                <h1 className="card-title">Assign Supervisor</h1>
                <p className="card-subtitle">
                  Manage supervisor assignment for student and projects
                </p>
              </div>

              {/* RIGHT : SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                {dashboardCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <div key={index} className="card min-w-[180px] p-4">
                      <div className="flex items-center">
                        <div className={`p-3 ${card.bg} rounded-lg`}>
                          <Icon className={`w-6 h-6 ${card.color}`} />
                        </div>

                        <div className="ml-4">
                          <p className="text-xs font-medium text-slate-600">
                            {card.title}
                          </p>
                          <p className="text-lg font-semibold text-slate-800">
                            {card.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex flex-col md:flex-row md:items-end gap-5">
              {/* SEARCH */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Search Students
                </label>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by student name or project title..."
                    className="input-field w-full pl-4 pr-4 h-11
          focus:outline-none focus:ring-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* FILTER */}
              <div className="w-full md:w-52">
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Filter Status
                </label>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-300
        bg-white text-slate-700
        focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="all">All Students</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0 z-10">
                <tr>
                  {[
                    "Student",
                    "Project Title",
                    "Supervisor",
                    "Deadline",
                    "Updated",
                    "Assign Supervisor",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-200">
                {filtered.map((row) => {
                  const disableAssign =
                    pendingFor === row.projectId ||
                    !!row.supervisor ||
                    row.status === "rejected" ||
                    !row.isApproved;

                  return (
                    <tr
                      key={row.projectId}
                      className="transition hover:bg-slate-100"
                    >
                      {/* STUDENT */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {row.studentName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {row.studentEmail}
                        </div>
                      </td>

                      {/* PROJECT */}
                      <td className="px-6 py-4 text-slate-700">{row.title}</td>

                      {/* SUPERVISOR */}
                      <td className="px-6 py-4">
                        {row.supervisor ? (
                          <Badge color="bg-green-100 text-green-800">
                            {row.supervisor}
                          </Badge>
                        ) : (
                          <Badge color="bg-red-100 text-red-800">
                            {row.status === "rejected"
                              ? "Rejected"
                              : "Not Assigned"}
                          </Badge>
                        )}
                      </td>

                      {/* DEADLINE */}
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(row.deadline)}
                      </td>

                      {/* UPDATED */}
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(row.updatedAt)}
                      </td>

                      {/* SELECT SUPERVISOR */}
                      <td className="px-6 py-4">
                        <select
                          className="input-field w-full text-sm"
                          value={selectedSupervisor[row.projectId] || ""}
                          disabled={disableAssign}
                          onChange={(e) =>
                            handleSupervisorSelect(
                              row.projectId,
                              e.target.value,
                            )
                          }
                        >
                          <option value="" disabled>
                            Select supervisor
                          </option>

                          {teachers.map((t) => (
                            <option
                              key={t._id}
                              value={t._id}
                              disabled={t.capacityLeft <= 0}
                            >
                              {t.name}
                              {t.department ? ` - ${t.department}` : ""} (
                              {t.capacityLeft} slots left)
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4">
                        <button
                          className={`text-sm w-40 btn-primary
    ${
      !row.isApproved && row.status !== "rejected"
        ? "bg-slate-300 text-slate-600 cursor-not-allowed hover:bg-slate-300"
        : ""
    }
  `}
                          disabled={disableAssign}
                          onClick={() =>
                            handleAssign(
                              row.studentId,
                              row.status,
                              row.projectId,
                            )
                          }
                        >
                          {pendingFor === row.projectId
                            ? "Assigning..."
                            : row.status === "rejected"
                              ? "Rejected"
                              : !row.isApproved
                                ? "Not approved"
                                : "Assign"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
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

                        <p className="font-medium text-slate-600">
                          No Student found
                        </p>
                        <p className="text-xs text-slate-400">
                          Try changing your search
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignSupervisor;
