import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const getTeacherDashboardStats = createAsyncThunk(
  "getTeacherDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        "teacher/fetch-dashboard-stats",

        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return res.data.data.dashboardStats || res.data;
    } catch (error) {
      toast.error(
        error.response.data.message || "failed to fetch teacher dashboard data",
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);
export const getRequests = createAsyncThunk(
  "requests/getRequests",
  async (supervisorId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `teacher/requests?supervisor=${supervisorId}`,
      );

      return res.data.data.requests;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch requests");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const acceptRequest = createAsyncThunk(
  "requests/acceptRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `teacher/requests/${requestId}/accept`,
      );
      toast.success(res.data.message || "Request accepted successfully");
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const rejectRequest = createAsyncThunk(
  "requests/rejectRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `teacher/requests/${requestId}/reject`,
      );
      toast.success(res.data.message || "Request rejected successfully");
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);
export const addFeedback = createAsyncThunk(
  "addFeedback",
  async ({ projectId, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `teacher/feedback/${projectId}`,
        payload,
      );
      toast.success(res.data.message || "Feedback send successfully");
      return {
        projectId,
        feedback: res.data.data?.feedback || res.data.data || res.data,
      };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send Feedback");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);
export const markComplete = createAsyncThunk(
  " markComplete",
  async (projectId, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `teacher/mark-complete/${projectId}`,
      );
      toast.success(res.data.message || "project mark completed");
      return { projectId };
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to project mark completed",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);
export const getAssignedStudents = createAsyncThunk(
  "getAssignedStudents",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`teacher/assigned-students`);

      return res.data.data?.stundets || res.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch assigned students",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getFiles = createAsyncThunk(
  "getTeacherFiles",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("teacher/files");

      return res.data.data?.files;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch files");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    assignedStudents: [],
    files: [],
    pendingRequests: [],
    dashboardStats: null,
    loading: false,
    error: null,
    list: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAssignedStudents.pending, (state, action) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAssignedStudents.fulfilled, (state, action) => {
      state.loading = false;
      state.assignedStudents = action.payload?.students || action.payload || [];
    });
    builder.addCase(getAssignedStudents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "failed to assined studnets";
    });
    builder.addCase(getFiles.fulfilled, (state, action) => {
      state.files = action.payload?.files || action.payload || [];
    });

    builder.addCase(addFeedback.fulfilled, (state, action) => {
      const { projectId, feedback } = action.payload;
      state.assignedStudents = state.assignedStudents.ma((s) =>
        s.projectId === projectId ? { ...s, feedback } : s,
      );
    });
    builder.addCase(markComplete.fulfilled, (state, action) => {
      const { projectId } = action.payload;
      state.assignedStudents = state.assignedStudents.map((s) => {
        if (s.project._id === projectId) {
          return {
            ...s,
            project: {
              ...s.project,
              status: "completed",
            },
          };
        }
        return s;
      });
    });

    builder.addCase(getTeacherDashboardStats.fulfilled, (state, action) => {
      state.dashboardStats = action.payload || [];
    });
    builder.addCase(getRequests.fulfilled, (state, action) => {
      state.list = action.payload || [];
    });

    builder.addCase(acceptRequest.fulfilled, (state, action) => {
      const updatedRequest = action.payload;

      state.list = state.list.map((r) =>
        r._id === updatedRequest._id ? updatedRequest : r,
      );
    });

    builder.addCase(rejectRequest.fulfilled, (state, action) => {
      const rejected = action.payload;

      state.list = state.list.map((r) =>
        r._id === rejected._id ? rejected : r,
      );
    });
  },
});

export default teacherSlice.reducer;
