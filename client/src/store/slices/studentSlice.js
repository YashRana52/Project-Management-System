import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const submitProjectProposal = createAsyncThunk(
  "student/submitProjectproposal",
  async (data, { thunkAPI }) => {
    try {
      const res = await axiosInstance.post("/student/project-proposal", data, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success(res.data.message);
      return res.data.data?.project || res.data.data || res.data;
    } catch (error) {
      toast.error(error.response.data.message);
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const fetchProject = createAsyncThunk(
  "student/fetchProject",
  async (_, { thunkAPI }) => {
    try {
      const res = await axiosInstance.get("/student/project", {
        headers: { "Content-Type": "application/json" },
      });
      toast.success(res.data.message);
      return res.data.data?.project || res.data.data || res.data;
    } catch (error) {
      toast.error(error.response.data.message);
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);
export const getSupervisor = createAsyncThunk(
  "student/getSupervisor",
  async (_, { thunkAPI }) => {
    try {
      const res = await axiosInstance.get("/student/supervisor", {
        headers: { "Content-Type": "application/json" },
      });
      toast.success(res.data.message);
      return res.data.data?.supervisor;
    } catch (error) {
      toast.error(error.response.data.message || "failed to fetch supervisor");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);
export const fetchAllSupervisor = createAsyncThunk(
  "student/fetchAllSupervisor",
  async (_, { thunkAPI }) => {
    try {
      const res = await axiosInstance.get("/student/fetch-supervisors", {
        headers: { "Content-Type": "application/json" },
      });

      return res.data.data?.supervisors;
    } catch (error) {
      toast.error(
        error.response.data.message || "failed to fetch available supervisors",
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);
export const requestSupervisor = createAsyncThunk(
  "student/requestSupervisor",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/student/request-supervisor",
        data,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      dispatch(getSupervisor());

      return res.data.data.request;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to request supervisor",
      );
    }
  },
);

export const uploadFiles = createAsyncThunk(
  "student/uploadFiles",
  async ({ projectId, files }, { thunkAPI }) => {
    try {
      const form = new FormData();
      for (const file of files) form.append("files", file);

      const res = await axiosInstance.post(
        `/student/upload/${projectId}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success(res.data.message || "file uploaded successfully");
      return res.data.data.project || res.data;
    } catch (error) {
      toast.error(error.response.data.message || "failed to upload file");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);
export const getFeedback = createAsyncThunk(
  "student/getFeedback  ",
  async ({ projectId }, { thunkAPI }) => {
    try {
      const res = await axiosInstance.get(
        `student/feedback/${projectId}`,

        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return res.data.data.feedback || res.data;
    } catch (error) {
      toast.error(error.response.data.message || "failed to fetch feedback");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);
export const fetchDashboardStats = createAsyncThunk(
  "student/fetchDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        "student/fetch-dashboard-stats",

        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return res.data.data || res.data;
    } catch (error) {
      toast.error(
        error.response.data.message || "failed to fetch student dashboard data",
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);
export const downloadFile = createAsyncThunk(
  "student/downloadFile",
  async ({ projectId, fileId, originalName }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/student/download/${projectId}/${fileId}`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([res.data], {
        type: res.headers["content-type"],
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", originalName || "file");

      document.body.appendChild(link);
      link.click();

      // cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to download file",
      );
    }
  },
);

const studentSlice = createSlice({
  name: "student",
  initialState: {
    project: null,
    files: [],
    supervisors: [],
    dashboardStats: [],
    supervisor: null,
    deadlines: [],
    feedback: [],
    status: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(submitProjectProposal.fulfilled, (state, action) => {
      state.project = action.payload?.project || action.payload;
    });
    builder.addCase(fetchProject.fulfilled, (state, action) => {
      state.project = action.payload?.project || action.payload || null;
      state.files = action.payload?.files || [];
    });
    builder.addCase(getSupervisor.fulfilled, (state, action) => {
      state.supervisor = action.payload?.supervisor || action.payload || null;
    });
    builder.addCase(fetchAllSupervisor.fulfilled, (state, action) => {
      state.supervisors = action.payload?.supervisors || action.payload || [];
    });
    builder.addCase(uploadFiles.fulfilled, (state, action) => {
      const newFiles = action.payload?.project?.files || action.payload || [];
      state.files = [...state.files, ...newFiles];
    });
    builder.addCase(fetchDashboardStats.fulfilled, (state, action) => {
      state.dashboardStats = action.payload || [];
    });
    builder.addCase(getFeedback.fulfilled, (state, action) => {
      state.feedback = action.payload || [];
    });
  },
});

export default studentSlice.reducer;
