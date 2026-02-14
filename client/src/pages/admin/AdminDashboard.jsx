import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import AddTeacher from "../../components/modal/AddTeacher";
import { toast } from "react-toastify";
import {
  getAllProjects,
  getDashboardData,
} from "../../store/slices/adminSlice";
import { getNotification } from "../../store/slices/notificationSlice";
import {
  AlertCircle,
  AlertTriangle,
  Box,
  FileTextIcon,
  Folder,
  PlusIcon,
  User,
  X,
} from "lucide-react";
import {
  toggleStudentModal,
  toggleTeacherModal,
} from "../../store/slices/popupSlice";

const BAR_COLORS = ["#1E3ABA", "#2563EB", "#3BB2F6", "#60A5FA", "#93C5FD"];

const AdminDashboard = () => {
  const { isCreateStudentModalOpen, isCreateTeacherModalOpen } = useSelector(
    (state) => state.popup,
  );

  const { stats, projects } = useSelector((state) => state.admin);
  const notifications = useSelector((state) => state.notification.list);

  const dispatch = useDispatch();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  useEffect(() => {
    dispatch(getDashboardData());
    dispatch(getNotification());
    dispatch(getAllProjects());
  }, [dispatch]);

  const nearingDeadlines = useMemo(() => {
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return (projects || []).filter((p) => {
      if (!p.deadline) return false;

      const d = new Date(p.deadline);
      return d >= now && d.getTime() - now.getTime() <= threeDays;
    }).length;
  }, [projects]);

  const files = useMemo(() => {
    return (projects || []).flatMap((p) =>
      (p.files || []).map((f) => ({
        projectId: p._id,
        originalName: f.originalName,
        uploadedAt: f.uploadedAt,
        fileUrl: f.fileUrl,
        projectTitle: p.title,
        studentName: p.student.name,
      })),
    );
  }, [projects]);

  const filterFiles = files.filter(
    (f) =>
      (f.originalName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (f.projectTitle || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (f.studentName || "").toLowerCase().includes(reportSearch.toLowerCase()),
  );

  const handleDownloadFile = (file) => {
    console.log("Downloading file:", file);
    const fileUrl = file?.fileUrl || file?.url;

    if (!fileUrl) {
      toast.error("File URL not found");
      return;
    }

    const downloadUrl = fileUrl.includes("/upload/")
      ? fileUrl.replace("/upload/", "/upload/fl_attachment/")
      : fileUrl;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = file.originalName || "file";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const supervisorBucket = useMemo(() => {
    const map = new Map();

    (projects || []).forEach((p) => {
      if (!p?.supervisor?.name) return;

      const name = p.supervisor.name;
      map.set(name, (map.get(name) || 0) + 1);
    });

    const arr = Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    arr.sort((a, b) => b.count - a.count);

    return arr;
  }, [projects]);

  const latestNotifications = useMemo(() => {
    return (notifications || []).slice(0, 6);
  }, [notifications]);

  const getBulletColor = (type, priority) => {
    const t = (type || "").toLowerCase();
    const p = (priority || "").toLowerCase();
    if (p === "high" && (t === "rejection" || t === "reject"))
      return "bg-red-600";
    if (p === "medium" && (t === "deadline" || t === "due"))
      return "bg-orange-500";
    if (p === "high") return "bg-red-500";
    if (p === "medium") return "bg-yellow-500";
    if (p === "low") return "bg-slate-400";
    // type-based fallback
    if (t === "approval" || t === "approved") return "bg-green-600";
    if (t === "request") return "bg-blue-600";
    if (t === "feedback") return "bg-purple-600";
    if (t === "meeting") return "bg-cyan-600";
    if (t === "system") return "bg-slate-600";
    return "bg-slate-400";
  };

  const getBadgeClasses = (kind, value) => {
    const v = (value || "").toLowerCase();
    if (kind === "type") {
      if (["rejection", "reject"].includes(v)) return "bg-red-100 text-red-800";
      if (["approval", "approved"].includes(v))
        return "bg-green-100 text-green-800";
      if (["deadline", "due"].includes(v))
        return "bg-orange-100 text-orange-800";
      if (v === "request") return "bg-blue-100 text-blue-800";
      if (v === "feedback") return "bg-purple-100 text-purple-800";
      if (v === "meeting") return "bg-cyan-100 text-cyan-800";
      if (v === "system") return "bg-slate-100 text-slate-800";
      return "bg-gray-100 text-gray-800";
    }
    // priority
    if (v === "high") return "bg-red-100 text-red-800";
    if (v === "medium") return "bg-yellow-100 text-yellow-800";
    if (v === "low") return "bg-gray-100 text-gray-800";
    return "bg-slate-100 text-slate-800";
  };

  const dashboardStats = [
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      bg: "bg-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      Icon: User,
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers ?? 0,
      bg: "bg-green-100",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      Icon: Box,
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequests ?? 0,
      bg: "bg-orange-100",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      Icon: AlertCircle,
    },
    {
      title: "Active Projects",
      value: stats?.totalProjects ?? 0,
      bg: "bg-yellow-100",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      Icon: Folder,
    },
    {
      title: "Nearing Deadlines",
      value: nearingDeadlines,
      bg: "bg-red-100",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      Icon: AlertTriangle,
    },
  ];

  const actionButtons = [
    {
      label: "Add Student",
      onClick: () => dispatch(toggleStudentModal()),
      btnClass: "btn-primary",
      Icon: PlusIcon,
    },
    {
      label: "Add Teacher",
      onClick: () => dispatch(toggleTeacherModal()),
      btnClass: "btn-secondary",
      Icon: PlusIcon,
    },
    {
      label: "View Reports",
      onClick: () => setIsReportModalOpen(true),
      btnClass: "btn-outline",
      Icon: FileTextIcon,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="font-bold text-2xl mb-2">Admin Dashboard</h1>
          <p className="text-blue-100">
            Manage the entire project management system and overall activities.
          </p>
        </div>
        {/* Sttas card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ">
          {dashboardStats.map((item, i) => (
            <div key={i} className={`${item.bg} rounded-lg p-4`}>
              <div className="flex items-center">
                <div className={`p-2 ${item.iconBg} rounded-lg`}>
                  <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <div className="ml-3">
                  <p className={`font-medium text-sm text-slate-600`}>
                    {item.title}
                  </p>
                  <p className={`text-sm font-medium text-slate-800`}>
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart & ACTIVITY */}
        <div className="grid grid-cols-1  lg:grid-cols-3 gap-6">
          {/* Charts  */}
          <div className="lg:col-span-2">
            <div className="card-header">
              <h3 className="card-title">Project Distribution by supervisor</h3>
            </div>

            <div className="p-4">
              {supervisorBucket.length === 0 ? (
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg text-slate-500 text-sm">
                  No Data Available
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={supervisorBucket}
                      margin={{ top: 8, right: 12, left: 8, bottom: 16 }}
                      barCategoryGap="25%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />

                      <XAxis
                        dataKey="name"
                        interval={0}
                        height={50}
                        dy={10}
                        tick={{ fontSize: 12, fill: "#334155" }}
                        axisLine={{ stroke: "#CBD5E1" }}
                        tickLine={{ stroke: "#CBD5E1" }}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: "#334155" }}
                        axisLine={{ stroke: "#CBD5E1" }}
                        tickLine={{ stroke: "#CBD5E1" }}
                      />

                      <Tooltip
                        cursor={{ fill: "rgba(99, 102, 241, 0.06)" }}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #E2E8F0",
                          backgroundColor: "#fff",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        }}
                        formatter={(value) => [value, "Projects Assigned"]}
                        labelFormatter={(label) => `Supervisor: ${label}`}
                      />

                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {supervisorBucket.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={BAR_COLORS[index % BAR_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {latestNotifications?.map((n) => (
                <div
                  key={n._id}
                  className="flex items-start gap-3 py-3 border-b last:border-b-0 text-sm"
                >
                  {/* Bullet */}
                  <span
                    className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${getBulletColor(
                      n.type,
                      n.priority,
                    )}`}
                  />

                  {/* Content */}
                  <div className="flex-1">
                    <p className="font-medium text-slate-700 leading-snug">
                      {n.message}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {/* Type Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium ${getBadgeClasses(
                          "type",
                          n.type,
                        )}`}
                      >
                        {n.type}
                      </span>

                      {/* Priority Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium ${getBadgeClasses(
                          "priority",
                          n.priority,
                        )}`}
                      >
                        {n.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {latestNotifications?.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No notifications available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick action */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Action</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actionButtons.map((btn, index) => (
              <button
                onClick={btn.onClick}
                key={index}
                className={`${btn.btnClass} flex items-center justify-center space-x-2`}
              >
                <btn.Icon className="w-5 h-5" />
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
          {isReportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-screen overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    All Files
                  </h3>
                  <button
                    onClick={() => setIsReportModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    className="input w-full "
                    placeholder="Search by name,project title,or student name"
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                  />
                </div>
                {filterFiles.length === 0 ? (
                  <div>No files found</div>
                ) : (
                  <div className="space-y-2">
                    {filterFiles.map((f, i) => {
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded"
                        >
                          <div>
                            <div className="font-medium text-slate-800">
                              {f.originalName}
                            </div>
                            <div className="text-sm text-slate-500">
                              {f.projectTitle} - {f.studentName}
                            </div>
                          </div>

                          <button
                            className="btn-outline btn-small"
                            onClick={() => handleDownloadFile(f)}
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
      </div>

      {isCreateStudentModalOpen && <AddStudent />}
      {isCreateTeacherModalOpen && <AddTeacher />}
    </>
  );
};

export default AdminDashboard;
