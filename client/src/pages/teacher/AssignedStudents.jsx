import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MessageSquare,
  CheckCircle,
  X,
  Loader2,
  AlertTriangle,
  Users,
} from "lucide-react";
import {
  addFeedback,
  getAssignedStudents,
  markComplete,
} from "../../store/slices/teacherSlice";
import { formatDateReadable } from "../../components/date/date";

const AssignedStudents = () => {
  const { assignedStudents, loading, error } = useSelector(
    (state) => state.teacher,
  );
  const [sortBy, setSortBy] = useState("name");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [feedbackData, setFeedbackData] = useState({
    title: "",
    message: "",
    type: "general",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAssignedStudents());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border border-green-300";
      case "approved":
        return "bg-blue-100 text-blue-700 border border-blue-300";

      default:
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
    }
  };

  const getStatusText = (status) => {
    if (status === "completed") return "Completed";
    if (status === "approved") return "Approved";
    return "Pending";
  };

  const handleFeedback = (student) => {
    setSelectedStudent(student);
    setFeedbackData({ title: "", message: "", type: "general" });
    setShowFeedbackModal(true);
  };
  const handleMarkComplete = (student) => {
    setSelectedStudent(student);
    setShowCompleteModal(true);
  };

  const closeModal = () => {
    setShowFeedbackModal(false);
    setShowCompleteModal(false);
    setSelectedStudent(null);
    setFeedbackData({ title: "", message: "", type: "general" });
  };

  const submitFeedback = () => {
    if (
      selectedStudent?.project?._id &&
      feedbackData.title &&
      feedbackData.message
    ) {
      dispatch(
        addFeedback({
          projectId: selectedStudent.project._id,
          payload: feedbackData,
        }),
      );
      closeModal();
    }
  };
  const confirmMarkComplete = () => {
    if (selectedStudent?.project?._id) {
      dispatch(markComplete(selectedStudent?.project?._id));
      closeModal();
    }
  };

  const sortedStudents = Array.isArray(assignedStudents)
    ? [...assignedStudents].sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "lastActivity":
            return (
              new Date(b.project?.updatedAt) - new Date(a.project?.updatedAt)
            );
          default:
            return 0;
        }
      })
    : [];

  const stats = [
    {
      label: "Total Students",
      value: sortedStudents.length,
      bg: "bg-blue-50",
      text: "text-blue-700",
      sub: "text-blue-600",
    },
    {
      label: "Projects Completed",
      value: sortedStudents.filter((s) => s.project?.status === "completed")
        .length,
      bg: "bg-green-50",
      text: "text-green-700",
      sub: "text-green-600",
    },
    {
      label: "In Progress",
      value: sortedStudents.filter((s) => s.project?.status === "in_progress")
        .length,
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      sub: "text-yellow-600",
    },
    {
      label: "Total Projects",
      value: sortedStudents.length,
      bg: "bg-purple-50",
      text: "text-purple-700",
      sub: "text-purple-600",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex gap-4">
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-bounce"></div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-sm">
          <div className="flex justify-center mb-3">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>

          <h2 className="text-lg font-semibold text-red-700">
            Failed to Load Students
          </h2>

          <p className="text-sm text-red-600 mt-2">
            Something went wrong while fetching assigned students. Please try
            again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Assigned Students</h1>
            <p className="card-subtitle">
              manage your assigned students and their projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((item) => (
              <div
                key={item.label}
                className={`${item.bg} p-5 rounded-xl border border-slate-200 
                transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
              >
                <p className={`text-sm font-medium ${item.sub}`}>
                  {item.label}
                </p>

                <p className={`mt-1 text-3xl font-bold ${item.text}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* STUDENTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedStudents.map((student) => (
            <div
              key={student._id}
              className="card hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 
                flex items-center justify-center shadow-sm"
                  >
                    <span className="text-blue-700 font-semibold text-sm">
                      {student?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {student.name}
                    </h3>
                    <p className="text-sm font-semibold text-slate-600">
                      {student.email}
                    </p>
                  </div>
                </div>
                {/* STATUS BADGE */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold 
  ${getStatusBadge(student.project?.status)}`}
                >
                  {getStatusText(student.project?.status)}
                </span>
              </div>
              <div className="mb-5">
                <h4 className="font-medium text-slate-700 mb-1">
                  {student.project.title || "NO Project Title"}
                </h4>
                <p className="text-xs text-slate-500">
                  Last Update:{" "}
                  {student.updatedAt
                    ? formatDateReadable(student.updatedAt)
                    : "—"}
                </p>
              </div>
              {/* Action */}
              <div className="flex gap-3">
                <button
                  disabled={student.project?.status === "completed"}
                  onClick={() => handleFeedback(student)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition
    active:scale-95
    ${
      student.project?.status === "completed"
        ? "bg-blue-300 text-white opacity-60 cursor-not-allowed"
        : "bg-blue-600 text-white hover:bg-blue-700"
    }
  `}
                >
                  <MessageSquare className="w-4 h-4" />
                  Feedback
                </button>

                <button
                  disabled={student.project?.status === "completed"}
                  onClick={() => handleMarkComplete(student)}
                  className={`flex items-center justify-center active:scale-95 gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg transition
    ${
      student.project?.status === "completed"
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-green-700"
    }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Complete
                </button>
              </div>
            </div>
          ))}

          {sortedStudents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                <Users className="w-7 h-7 text-blue-600" />
              </div>

              <h3 className="text-lg font-semibold text-slate-700">
                No Assigned Students
              </h3>

              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                You don’t have any students assigned yet. Once students are
                assigned, they will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Feedback model */}

        {showFeedbackModal && selectedStudent && (
          <div
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-slate-800">
                  Provide Feedback
                </h2>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 space-y-6">
                {/* PROJECT INFO */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-sm">
                  <div>
                    <p className="text-slate-500">Project</p>
                    <p className="font-medium text-slate-800">
                      {selectedStudent.project?.title || "No Title"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Student</p>
                    <p className="font-medium text-slate-800">
                      {selectedStudent.name}
                    </p>
                  </div>

                  {selectedStudent.project?.deadline && (
                    <div>
                      <p className="text-slate-500">Deadline</p>
                      <p className="font-medium text-slate-800">
                        {formatDateReadable(selectedStudent.project.deadline)}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-slate-500">Last Updated</p>
                    <p className="font-medium text-slate-800">
                      {formatDateReadable(selectedStudent.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* FEEDBACK FORM */}
                <div className="space-y-4">
                  {/* TITLE */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Feedback Title
                    </label>
                    <input
                      type="text"
                      value={feedbackData.title}
                      onChange={(e) =>
                        setFeedbackData({
                          ...feedbackData,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Eg. Project structure feedback"
                    />
                  </div>

                  {/* TYPE */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Feedback Type
                    </label>
                    <select
                      value={feedbackData.type}
                      onChange={(e) =>
                        setFeedbackData({
                          ...feedbackData,
                          type: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                    </select>
                  </div>

                  {/* MESSAGE */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Feedback Message
                    </label>
                    <textarea
                      rows={4}
                      value={feedbackData.message}
                      onChange={(e) =>
                        setFeedbackData({
                          ...feedbackData,
                          message: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg resize-none
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write detailed feedback for the student..."
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  disabled={!feedbackData.title || !feedbackData.message}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COMPLETE MODEL */}

        {showCompleteModal && selectedStudent && (
          <div
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">
                  Mark Project as Completed
                </h2>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Info Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Student</span>
                    <span className="text-slate-800 font-semibold">
                      {selectedStudent.name}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Project</span>
                    <span className="text-slate-800 font-semibold text-right">
                      {selectedStudent.project?.title || "No title"}
                    </span>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    Are you sure you want to mark this project as completed?
                    <br />
                    <span className="font-medium">
                      This action cannot be undone.
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmMarkComplete}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                  >
                    Yes, Mark Completed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AssignedStudents;
