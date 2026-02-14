import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTeacherDashboardStats } from "../../store/slices/teacherSlice";
import {
  CheckCircle,
  Clock,
  Icon,
  Loader2,
  MoveDiagonal,
  Users,
} from "lucide-react";

const TeacherDashboard = () => {
  const dispatch = useDispatch();

  const { dashboardStats, loading } = useSelector((state) => state.teacher);

  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTeacherDashboardStats());
  }, [dispatch]);
  console.log("dashboardStats", dashboardStats);

  const statsCards = [
    {
      title: "Assigned Students",
      value: authUser?.assignedStudents?.length || 0,
      loading,
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Pending Requests",
      value: dashboardStats?.totalPendingRequests || 0,
      loading,
      icon: Clock,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
    },
    {
      title: "Completed Projects",
      value: dashboardStats?.completedProjects || 0,
      loading,
      icon: CheckCircle,
      bg: "bg-green-100",
      color: "text-green-600",
    },
  ];

  const formatDateReadable = (date) => {
    if (!date) return "";

    const d = new Date(date);

    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* hero section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 p-8 md:p-10 shadow-2xl shadow-emerald-900/30 text-white">
          {/* Optional subtle background pattern / overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12)_0%,transparent_50%)] pointer-events-none" />

          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-white animate-fade-in">
                  Teacher Dashboard
                </h1>

                <p className="text-lg md:text-xl text-emerald-100/90 font-medium mb-1">
                  Welcome back,{" "}
                  <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-white font-semibold shadow-inner">
                    {authUser?.name || "Professor"}
                  </span>
                </p>

                <p className="text-emerald-50/80 text-base md:text-lg max-w-3xl leading-relaxed">
                  Guide your students, track project milestones, provide
                  feedback, and shape tomorrow's innovators — all in one place.
                </p>
              </div>

              {/* Optional quick action buttons or avatar - modern touch */}
              <div className="flex items-center gap-4 self-start md:self-center">
                <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Quick Stats
                </button>

                <button className="px-6 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                  New Announcement
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {statsCards?.map((d) => {
              const Icon = d.icon;

              return (
                <div key={d.title} className="card transition hover:shadow-md">
                  <div className="p-1 flex items-center gap-4">
                    {/* ICON */}
                    <div className={`p-4 rounded-xl ${d.bg}`}>
                      <Icon className={`w-6 h-6 ${d.color}`} />
                    </div>

                    {/* TEXT */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {d.title}
                      </p>
                      <p className="text-2xl font-semibold text-slate-800">
                        {d.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Recent activity */}

        <div className="card bg-white dark:bg-gray-800/80 dark:border-gray-700 border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="card-header px-6 py-5 border-b border-slate-200 dark:border-gray-700/70 bg-slate-50/80 dark:bg-gray-900/40">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Recent Activity
                </h2>
                <p className="card-subtitle text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Latest student updates, submissions & supervision notes
                </p>
              </div>
              {/*refresh or filter icon */}
              <button className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1 px-4 py-2 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-gray-600">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2
                  size={32}
                  className="animate-spin text-emerald-600 dark:text-emerald-500"
                />
              </div>
            ) : dashboardStats?.recentNotifications?.length > 0 ? (
              dashboardStats.recentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className="group flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-all duration-200 border-l-4 border-transparent hover:border-emerald-500/70"
                >
                  {/* Icon with colored bg */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="p-2.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                      <MoveDiagonal className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {formatDateReadable(notification.createdAt)}
                    </p>
                  </div>

                  <div className="flex-shrink-0 self-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                  </div>
                </div>
              ))
            ) : (
              /* Empty State*/
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center mb-4 shadow-inner">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-slate-400 dark:text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  No recent activity yet
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  When students submit projects, request guidance, or you add
                  supervision notes — they'll show up here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherDashboard;
