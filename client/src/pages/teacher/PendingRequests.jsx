import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptRequest,
  getRequests,
  rejectRequest,
} from "../../store/slices/teacherSlice";

const PendingRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingMap, setLoadingMap] = useState({});

  const dispatch = useDispatch();

  const { list } = useSelector((state) => state.teacher);

  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getRequests(authUser._id));
  }, [dispatch, authUser._id]);

  const setLoading = (id, key, value) => {
    setLoadingMap((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [key]: value },
    }));
  };
  //accept
  const handleAccept = async (request) => {
    const id = request._id;
    setLoading(id, "accepting", true);
    try {
      await dispatch(acceptRequest(id)).unwrap();
    } finally {
      setLoading(id, "accepting", false);
    }
  };

  // reject
  const handleReject = async (request) => {
    const id = request._id;
    setLoading(id, "rejecting", true);
    try {
      await dispatch(rejectRequest(id)).unwrap();
    } finally {
      setLoading(id, "rejecting", false);
    }
  };

  const filteredRequests = useMemo(() => {
    return list.filter((r) => {
      const matchesSearch =
        r?.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r?.latestProject?.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "all" || r.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus, list]);

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
        {/* header */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Pending Supervision Request</h1>
            <p className="card-subtitle">
              Review and respond to student supervision request
            </p>
          </div>
          {/* Search & Filter */}

          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by student name or project title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-300
                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                 outline-none transition"
              />
            </div>

            {/* Status Filter */}
            <div className="relative md:w-56">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-11 appearance-none px-4 pr-10 rounded-xl
               border border-slate-300 bg-white text-slate-700
               focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
               outline-none transition"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Custom Arrow */}
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                ▼
              </div>
            </div>
          </div>

          {/* Request */}
          <div className="space-y-4">
            {filteredRequests.map((req) => {
              const id = req._id;
              const project = req.latestProject;
              const projectStatus = project?.status?.toLowerCase() || "pending";
              const supervisorAssign = !!project?.supervisor;

              const canAccept =
                projectStatus === "approved" && !supervisorAssign;

              const canReject = req.status === "pending";

              const lm = loadingMap[id] || {};

              let bgClass = "bg-white border-slate-200";
              let statusMessage = "";

              if (projectStatus === "approved" && supervisorAssign) {
                bgClass = "bg-blue-50 border-blue-300";
                statusMessage = "Supervisor already assigned";
              } else if (projectStatus === "rejected") {
                bgClass = "bg-red-50 border-red-300";
                statusMessage = "Project proposal rejected";
              } else if (projectStatus === "pending") {
                bgClass = "bg-yellow-50 border-yellow-300";
                statusMessage = "Project proposal pending";
              }

              return (
                <div
                  key={id}
                  className={`card border ${bgClass} transition-all`}
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {req?.student?.name || "Unknown"}
                        </h3>

                        <span
                          className={`px-2 py-0.5 text-xs rounded-full font-medium
    ${
      req.status === "pending"
        ? "bg-yellow-100 text-yellow-700"
        : req.status === "approved"
          ? "bg-green-100 text-green-700"
          : req.status === "completed"
            ? "bg-blue-100 text-blue-700"
            : "bg-red-100 text-red-700"
    }`}
                        >
                          {req.status.charAt(0).toUpperCase() +
                            req.status.slice(1)}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mb-1">
                        {req?.student?.email || "No email"}
                      </p>

                      <h4 className="font-medium text-slate-700 mb-2">
                        {project?.title || "No project title"}
                      </h4>

                      <p className="text-xs text-slate-700">
                        Submitted:{" "}
                        {req?.createdAt
                          ? formatDateReadable(req.createdAt)
                          : "-"}
                      </p>

                      {statusMessage && (
                        <p className="mt-2 text-sm font-medium text-slate-700">
                          {statusMessage}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {req.status === "pending" && (
                      <div className="flex items-center gap-3">
                        {/* Accept */}
                        <button
                          onClick={() => handleAccept(req)}
                          disabled={lm?.accepting || !canAccept}
                          className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors duration-200
                  ${
                    canAccept
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 text-white cursor-not-allowed"
                  }`}
                        >
                          {lm?.accepting ? "Accepting..." : "Accept"}
                        </button>

                        {/* Reject */}
                        <button
                          onClick={() => handleReject(req)}
                          disabled={lm?.rejecting || !canReject}
                          className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors duration-200
                  ${
                    canReject
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-300 text-white cursor-not-allowed"
                  }`}
                        >
                          {lm?.rejecting ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {/* No request */}
            {filteredRequests.length === 0 && (
              <div className="flex items-center justify-center min-h-[300px]">
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
                    No Requests Found
                  </p>
                  <p className="text-xs text-slate-400">
                    Try changing your search or filter
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PendingRequests;
