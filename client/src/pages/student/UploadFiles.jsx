import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchProject, uploadFiles } from "../../store/slices/studentSlice";
import {
  Archive,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileText,
  File as FileIcon,
  FilePlus,
} from "lucide-react";

const UploadFiles = () => {
  const dispatch = useDispatch();
  const { project, files } = useSelector((state) => state.student);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const reportRef = useRef(null);
  const presRef = useRef(null);
  const codeRef = useRef(null);

  useEffect(() => {
    if (!project) {
      dispatch(fetchProject());
    }
  }, [dispatch, project]);

  const getExtension = (filename = "") =>
    filename.split(".").pop().toLowerCase();

  const getFileIcon = (ext) => {
    switch (ext) {
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
      default:
        return <FileIcon className="w-8 h-8 text-slate-500" />;
    }
  };

  const handleFilePick = (e) => {
    const list = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...list]);
    e.target.value = "";
  };

  const removeSelected = (name) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleUpload = () => {
    if (!project?._id || selectedFiles.length === 0) return;

    dispatch(uploadFiles({ projectId: project._id, files: selectedFiles }));
    setSelectedFiles([]);
  };

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

  return (
    <div className="space-y-6">
      {/* UPLOAD CARD */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Upload Project Files</h1>
          <p className="card-subtitle">
            Upload reports, presentations, and source code
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <UploadBox
            title="Report"
            desc="PDF, DOC"
            icon={<FileText className="w-10 h-10 text-slate-500" />}
            accept=".pdf,.doc,.docx"
            onChange={handleFilePick}
          />

          <UploadBox
            title="Presentation"
            desc="PPT, PPTX, PDF"
            icon={<Archive className="w-10 h-10 text-slate-500" />}
            accept=".ppt,.pptx,.pdf"
            onChange={handleFilePick}
          />

          <UploadBox
            title="Source Code"
            desc="ZIP, RAR"
            icon={<FileCode className="w-10 h-10 text-slate-500" />}
            accept=".zip,.rar"
            onChange={handleFilePick}
          />

          <UploadBox
            title="Images"
            desc="JPG, PNG, JPEG"
            icon={<FileIcon className="w-10 h-10 text-slate-500" />}
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFilePick}
          />
        </div>

        <div className="flex justify-end mt-4">
          <button className="btn-primary" onClick={handleUpload}>
            Upload Selected Files
          </button>
        </div>
      </div>

      {/* SELECTED FILES */}
      {selectedFiles.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Ready to Upload</h2>
          </div>

          {selectedFiles.map((file) => (
            <div
              key={file.name}
              className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                {getFileIcon(getExtension(file.name))}
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-slate-600">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>
              <button
                className="btn-danger btn-small"
                onClick={() => removeSelected(file.name)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* UPLOADED FILES */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Uploaded Files</h2>
        </div>

        {(files || []).length === 0 ? (
          <div className="text-center py-8">
            <FilePlus className="w-16 h-16 text-slate-300 mx-auto" />
            <p className="text-slate-500">No files uploaded yet</p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file._id}
              className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                {getFileIcon(getExtension(file.originalName))}
                <div>
                  <p className="font-medium">{file.originalName}</p>
                  <p className="text-sm text-slate-600">{file.fileType}</p>
                </div>
              </div>
              <button
                className="btn-outline btn-small"
                onClick={() => handleDownloadFile(file)}
              >
                Download
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ---------- REUSABLE UPLOAD BOX ---------- */

const UploadBox = ({ title, desc, icon, refEl, accept, onChange }) => (
  <div className="border-2 border-dashed rounded-xl p-6 text-center bg-white">
    <div className="mb-4 flex justify-center">
      <div className="p-4 rounded-full bg-slate-100">{icon}</div>
    </div>
    <h3 className="font-semibold">{title}</h3>
    <p className="text-sm text-slate-600 mb-4">{desc}</p>
    <label className="btn-outline cursor-pointer">
      Choose File
      <input
        ref={refEl}
        type="file"
        className="hidden"
        accept={accept}
        multiple
        onChange={onChange}
      />
    </label>
  </div>
);

export default UploadFiles;
