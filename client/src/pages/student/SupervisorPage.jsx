import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSupervisor,
  fetchProject,
  getSupervisor,
  requestSupervisor,
} from "../../store/slices/studentSlice";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const SupervisorPage = () => {
  const dispatch = useDispatch();

  const { authUser } = useSelector((state) => state.auth);
  const { project, supervisors, supervisor } = useSelector(
    (state) => state.student,
  );

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  useEffect(() => {
    dispatch(fetchProject());
    dispatch(getSupervisor());
    dispatch(fetchAllSupervisor());
  }, [dispatch]);

  const hashSupervisor = useMemo(() => {
    return !!(supervisor && supervisor._id);
  }, [supervisor]);

  const hashProject = useMemo(() => {
    return !!(project && project._id);
  }, [project]);

  //date formate
  const formatDeadline = (dateStr) => {
    if (!dateStr) return "-";

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";

    const day = date.getDate();

    // Ordinal suffix logic
    let suffix = "th";
    if (day % 10 === 1 && day % 100 !== 11) suffix = "st";
    else if (day % 10 === 2 && day % 100 !== 12) suffix = "nd";
    else if (day % 10 === 3 && day % 100 !== 13) suffix = "rd";

    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    return `${day}${suffix} ${month} ${year}`;
  };

  const handleOpenRequest = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setShowRequestModal(true);
  };

  const submitRequest = async () => {
    if (!selectedSupervisor) return;

    const message =
      requestMessage?.trim() ||
      `${authUser?.name || "The student"} has requested ${
        selectedSupervisor?.name
      } to be their project supervisor.`;

    try {
      await dispatch(
        requestSupervisor({
          teacherId: selectedSupervisor._id,
          message,
        }),
      ).unwrap();

      setShowRequestModal(false);
      toast.success("Request sent successfully");
    } catch (error) {
      toast.error(error || "Request failed");
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* current supervisor */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Current Supervisor</h1>
            {hashSupervisor && (
              <span className="Badge badge-approved">Assigned</span>
            )}
          </div>
          {/* Supervisor details */}
          {hashSupervisor ? (
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full shadow-md flex items-center justify-center bg-slate-200 text-slate-800 text-2xl font-bold">
                  {supervisor?.profileImage ? (
                    <img
                      src={supervisor.profileImage}
                      alt={supervisor?.name || "Supervisor"}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>
                      {supervisor?.name
                        ? supervisor.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "--"}
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {supervisor?.name || "-"}
                    </h3>
                    <p className="text-lg text-slate-600">
                      {supervisor?.department || "-"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Email
                    </label>
                    <p className="text-slate-800 font-medium">
                      {supervisor?.email || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Experties
                    </label>
                    <p className="text-slate-800 font-medium">
                      {Array.isArray(supervisor?.experties)
                        ? supervisor.experties.join(", ")
                        : supervisor?.experties || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-slate-600 text-lg">
                Supervisor not assigned yet.
              </p>
            </div>
          )}
        </div>

        {/* Project Details - Only show if project exist */}
        {hashProject && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Project Details</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Project Title
                    </label>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {project?.title || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full font-medium capitalize text-sm ${project.status === "approved" ? "bg-gray-100 text-gray-800" : project.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                      >
                        {project.status || "Invalid"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Deadline
                    </label>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {project?.deadline
                        ? formatDeadline(project.deadline)
                        : "No deadline set"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Created
                    </label>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {project.createdAt
                        ? formatDeadline(project.createdAt)
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
              {project?.description && (
                <div>
                  <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    Description
                  </label>
                  <p className="text-slate-700 mt-2 leading-relaxed">
                    {project?.description || "-"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* if No Project  */}

        {!hashProject && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Project Required</h2>
            </div>
            <div className="p-6 text-center">
              <p className="text-slate-600 text-lg">
                You have't submitted any project proposal yet. so you can't
                request a supervisor.
              </p>
            </div>
          </div>
        )}

        {/* Available Supervisor ||only whem project exist and no supervisor assigned */}
        {hashProject && !hashSupervisor && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Available Supervisors</h2>
              <p className="card-subtitle">
                Browse and request supervision from available faculty members
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-4">
              {supervisors &&
                supervisors.map((sup) => (
                  <div
                    key={sup._id}
                    className="border border-slate-200 rounded-xl p-4
                       hover:shadow-lg hover:border-slate-300
                       transition-all duration-200 bg-white"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center
                           bg-gradient-to-br from-indigo-500 to-purple-600
                           shadow-md shrink-0"
                      >
                        <span className="text-sm font-semibold text-white">
                          {(sup?.name || "Unknown")
                            .split(" ")
                            .slice(0, 2)
                            .map((word) => word[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate">
                          {sup.name}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {sup.department || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-5">
                      <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                          Email
                        </label>
                        <p className="text-sm font-medium text-slate-700 break-all">
                          {sup.email || "-"}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                          Experties
                        </label>
                        <p className="text-sm text-slate-700 line-clamp-2">
                          {Array.isArray(sup?.experties)
                            ? sup.experties.join(", ")
                            : sup?.experties || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => handleOpenRequest(sup)}
                      className="btn-primary w-full"
                    >
                      Request Supervisor
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* REQUEST SUPERVISOR MODAL */}
        {showRequestModal && selectedSupervisor && (
          <div className="modal-overlay">
            <div className="modal-content max-w-md w-full">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Request Supervisor
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedSupervisor(null);
                      setShowRequestModal(false);
                      setRequestMessage("");
                    }}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Supervisor Info */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center
                         bg-gradient-to-br from-indigo-500 to-purple-600"
                    >
                      <span className="text-sm font-semibold text-white">
                        {(selectedSupervisor?.name || "U")
                          .split(" ")
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {selectedSupervisor?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedSupervisor?.department || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="label">Message to Supervisor</label>
                    <textarea
                      className="input min-h-[120px]"
                      required
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Introduce yourself and explain why you want this professor to supervise your project"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setSelectedSupervisor(null);
                        setShowRequestModal(false);
                        setRequestMessage("");
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!requestMessage.trim()}
                      onClick={submitRequest}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SupervisorPage;
