import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowDownToLine,
  FileArchive,
  FileIcon,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  List,
} from "lucide-react";
import { getFiles } from "../../store/slices/teacherSlice";
import { toast } from "react-toastify";
import { formatDateReadable } from "../../components/date/date";

const TeacherFiles = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();
  const filesFromStore = useSelector((state) => state.teacher.files) || [];

  useEffect(() => {
    dispatch(getFiles());
  }, [dispatch]);

  const deriveTypeFormatName = (name) => {
    if (!name) return "other";
    const parts = name.split(".");
    return (parts[parts.length - 1] || "").toLowerCase();
  };

  const normalizeFile = (f) => {
    const type = deriveTypeFormatName(f.originalName) || f.fileType || "other";

    let category = "other";

    if (["pdf", "doc", "docx", "txt"].includes(type)) {
      category = "report";
    } else if (["ppt", "pptx"].includes(type)) {
      category = "presentation";
    } else if (["zip", "rar", "7z"].includes(type)) {
      category = "code";
    } else if (["js", "ts", "html", "css", "json"].includes(type)) {
      category = "code";
    } else if (["jpeg", "jpg", "png", "avif", "gif"].includes(type)) {
      category = "image";
    }

    return {
      id: f._id,
      name: f.originalName,
      originalName: f.originalName,
      fileUrl: f.fileUrl,
      publicId: f.publicId,
      type: type.toUpperCase(),
      size: f?.size || "-",
      student: f.studentName || "-",
      uploadedAt: f.uploadedAt || f.createdAt,
      category,
      projectId: f.projectId,
      fileId: f._id,
    };
  };

  const files = useMemo(
    () => (filesFromStore || []).map(normalizeFile),
    [filesFromStore],
  );

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="w-8 h-8 text-blue-500" />;
      case "ppt":
      case "pptx":
        return <FileSpreadsheet className="w-8 h-8 text-orange-500" />;
      case "zip":
      case "rar":
        return <FileArchive className="w-8 h-8 text-yellow-500" />;
      case "image": // <-- add this
        return <FileIcon className="w-8 h-8 text-pink-500" />;
      default:
        return <FileIcon className="w-8 h-8 text-slate-500" />; // safe fallback
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesType =
      filterType === "all" ? true : file.category === filterType;

    const matchesSearch = file.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesSearch && matchesType;
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

  const fileStats = [
    {
      label: "Total Files",
      count: files.length,
      bg: "bg-blue-50",
      text: "text-blue-600",
      value: "text-blue-700",
    },
    {
      label: "Reports",
      count: files.filter((f) => f.category === "report").length,
      bg: "bg-green-50",
      text: "text-green-600",
      value: "text-green-700",
    },
    {
      label: "Presentations",
      count: files.filter((f) => f.category === "presentation").length,
      bg: "bg-orange-50",
      text: "text-orange-600",
      value: "text-orange-700",
    },
    {
      label: "Code Files",
      count: files.filter((f) => f.category === "code").length,
      bg: "bg-purple-50",
      text: "text-purple-600",
      value: "text-purple-700",
    },
    {
      label: "Images",
      count: files.filter((f) => f.category === "image").length,
      bg: "bg-pink-50",
      text: "text-pink-600",
      value: "text-pink-700",
    },
  ];

  const tableHeadData = [
    "File Name",
    "Student",
    "Type",
    "Upload Date",
    "Actions",
  ];

  //  handle view file
  const handleViewFile = (file) => {
    if (!file?.fileUrl) {
      toast.error("File URL not found");
      return;
    }

    // direct open (no download)
    window.open(file.fileUrl, "_blank", "noopener,noreferrer");
  };

  const canViewFile = (file) => {
    if (!file?.type) return false;

    const nonViewable = ["zip", "rar", "7z"];
    return !nonViewable.includes(file.type.toLowerCase());
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <h1 className="text-lg font-semibold text-slate-800">
                Student Files
              </h1>
              <p className="text-sm text-slate-500">
                Manage files received from students
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Left controls */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <select
                  className="input w-full sm:w-48"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Files</option>
                  <option value="report">Reports</option>
                  <option value="presentation">Presentations</option>
                  <option value="code">Code</option>
                  <option value="image">Images</option>
                </select>

                <input
                  type="text"
                  className="input w-full sm:w-56"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* file Stats */}

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6 p-2">
            {fileStats.map((item, i) => {
              return (
                <div key={i} className={`${item.bg} p-4 rounded-lg`}>
                  <p className={`text-sm ${item.text}`}>{item.label}</p>
                  <p className={`text-2xl ${item.value} font-bold`}>
                    {item.count}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* files show krni yha sari */}

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* File Icon */}
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-xl bg-slate-100 group-hover:bg-blue-50 transition">
                    {getFileIcon(file.type)}
                  </div>
                </div>

                {/* File Name */}
                <h3
                  className="text-sm font-semibold text-slate-800 text-center truncate"
                  title={file.name}
                >
                  {file.name}
                </h3>

                {/* Student */}
                <p className="text-xs text-slate-500 text-center mt-1">
                  {file.student}
                </p>

                {/* Meta Info */}
                <div className="flex justify-between text-xs text-slate-500 mt-4">
                  <span>{file.size}</span>
                  <span>{formatDateReadable(file.uploadedAt)}</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-200 my-4" />

                {/* Download Button */}
                <div className="flex gap-2">
                  {canViewFile(file) && (
                    <button
                      onClick={() => handleViewFile(file)}
                      className="w-full rounded-xl border border-slate-300 text-slate-700 py-2 text-sm
       hover:bg-slate-100 transition"
                    >
                      👁 View
                    </button>
                  )}

                  <button
                    onClick={() => handleDownloadFile(file)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600
     text-white py-2 text-sm font-medium hover:bg-blue-700 transition"
                  >
                    ⬇ Download
                  </button>
                </div>

                {/* Hover Badge */}
                <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {file.type}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10">
                  <tr>
                    {tableHeadData.map((t) => (
                      <th
                        key={t}
                        className="px-5 py-3 text-left font-semibold tracking-wide"
                      >
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredFiles.map((file) => (
                    <tr
                      key={file.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* File */}
                      <td className="px-5 py-4 flex items-center gap-3">
                        <div className="text-xl text-slate-600">
                          {getFileIcon(file.type)}
                        </div>
                        <span className="font-medium text-slate-800">
                          {file.name}
                        </span>
                      </td>

                      {/* Student */}
                      <td className="px-5 py-4 text-slate-600">
                        {file.student}
                      </td>

                      {/* Type Badge */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {file.type}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-slate-500">
                        {formatDateReadable(file.uploadedAt)}
                      </td>

                      <td className="px-5 py-4 flex gap-2">
                        {canViewFile(file) && (
                          <button
                            onClick={() => handleViewFile(file)}
                            className="px-3 py-2 rounded-lg border text-sm hover:bg-slate-100"
                          >
                            👁 View
                          </button>
                        )}

                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="px-4 py-2 rounded-lg text-sm font-semibold
     bg-blue-600 text-white hover:bg-blue-700"
                        >
                          ⬇ Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherFiles;
