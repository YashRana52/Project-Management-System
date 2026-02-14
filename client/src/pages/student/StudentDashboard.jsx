import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardStats,
  getFeedback,
} from "../../store/slices/studentSlice";
import { Link } from "react-router-dom";
import { Bell, MessageCircle, MessageCircleWarning } from "lucide-react";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { dashboardStats, feedback } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const project = dashboardStats?.project || {};
  const supervisorName = dashboardStats?.supervisorName || "N/A";
  const upcomingDeadlines = dashboardStats?.upcomingDeadlines || [];
  const topNotifications = dashboardStats?.topNotifications || [];
  const feedbackList = feedback?.slice(-2).reverse() || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";

    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case "upcoming":
  //       return "badge-pending";
  //     case "completed":
  //       return "badge-approved";
  //     case "overdue":
  //       return "badge-rejected";
  //     default:
  //       return "badge-pending";
  //   }
  // };

  useEffect(() => {
    if (project?._id) {
      dispatch(getFeedback({ projectId: project._id }));
    }
  }, [dispatch, project]);

  return (
    <>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {authUser?.name || "Students"}
          </h1>
          <p className="text-blue-100">
            Here is your project overview and recent updates
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Project Title */}
          <div className="card p-4 shadow-sm rounded-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg text-xl">📝</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Project Title
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {project?.title || "No Project"}
                </p>
              </div>
            </div>
          </div>

          {/* Supervisor */}
          <div className="card p-4 shadow-sm rounded-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg text-xl">✍️</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Supervisor</p>
                <p className="text-lg font-semibold text-slate-800">
                  {project?.supervisor?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Next Deadline */}
          <div className="card p-4 shadow-sm rounded-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg text-xl">🧭</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Next Deadline
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {project?.deadline ? formatDate(project.deadline) : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="card p-4 shadow-sm rounded-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg text-xl">🎬</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Recent Feedback
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {feedbackList?.length
                    ? `${feedbackList[0]?.comment || ""} (${formatDate(feedbackList[0]?.createdAt)})`
                    : "No feedback yet"}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-6">
          {/* project overview */}
          <div className="card p-6 shadow-md rounded-xl border border-gray-100 bg-white">
            <div className="mb-6 border-b border-gray-200 pb-3">
              <h2 className="text-xl font-semibold text-slate-800">
                Project Overview
              </h2>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Title
                </label>
                <p className="text-slate-800 font-medium text-lg">
                  {project?.title || "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Description
                </label>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {project?.description || "No description provided"}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-600">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                    project?.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : project?.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : project?.status === "rejected"
                          ? "bg-red-100 text-rose-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {project?.status || "Unknown"}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Submission Deadline
                </label>
                <p className="text-slate-800 font-medium text-sm">
                  {project?.deadline ? formatDate(project.deadline) : "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/* Latest feedback */}
          <div className="card bg-white shadow-md rounded-xl border border-gray-100">
            <div className="card-header flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Latest Feedback
              </h2>
              <Link
                to={"/student/feedback"}
                className="text-white text-sm bg-blue-500 px-3 py-1 rounded-full font-medium hover:bg-blue-600 transition-colors duration-300"
              >
                View All
              </Link>
            </div>

            {feedbackList && feedbackList.length > 0 ? (
              <div className="space-y-4 p-4">
                {feedbackList.map((feedback, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5 text-blue-500" />
                        <h3 className="font-medium text-slate-800 text-sm">
                          {feedback.title || "Supervisor Feedback"}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500">
                        {formatDate(feedback.createdAt)}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {feedback.message || "No message provided"}
                      </p>
                    </div>

                    <div className="flex justify-end mt-3">
                      <p className="text-xs text-slate-500">
                        - {feedback.supervisorName || "Supervisor"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  No feedback available yet
                </p>
              </div>
            )}
          </div>
        </div>
        {/* upcomming deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="card bg-white shadow-md rounded-xl border border-gray-100">
            <div className="card-header p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Upcoming Deadlines
              </h2>
            </div>

            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              <div className="space-y-3 p-4">
                {upcomingDeadlines.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:shadow-md transition-shadow duration-300"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {d.title || "Untitled"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {d.deadline ? formatDate(d.deadline) : "No deadline"}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      Upcoming
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircleWarning className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  No upcoming deadlines yet
                </p>
              </div>
            )}
          </div>

          {/* Recent notification */}
          <div className="card bg-white shadow-md rounded-xl border border-gray-100">
            <div className="card-header p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Recent Notifications
              </h2>
            </div>

            {topNotifications && topNotifications.length > 0 ? (
              <div className="space-y-3 p-4">
                {topNotifications.map((n, i) => (
                  <div
                    key={i}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-300 flex gap-3"
                  >
                    {/* 🔵 Blue Dot */}
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1 flex-shrink-0"></span>

                    {/* Content */}
                    <div>
                      <p className="font-medium text-slate-800 text-sm">
                        {n.message || "No message"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {n.createdAt ? formatDate(n.createdAt) : "Unknown date"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  No notifications available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
