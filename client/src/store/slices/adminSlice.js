import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

/* ================= CREATE ================= */
export const createStudent = createAsyncThunk(
  "student/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/admin/create-student", data);

      toast.success(res.data?.message || "Student created successfully");
      return res.data?.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to create student";

      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

/* ================= UPDATE ================= */
export const updateStudent = createAsyncThunk(
  "student/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/admin/update-student/${id}`, data);

      toast.success(res.data?.message || "Student updated successfully");
      return res.data?.data?.user;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to update student";

      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

/* ================= DELETE ================= */
export const deleteStudent = createAsyncThunk(
  "student/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/delete-student/${id}`);

      toast.success("Student deleted successfully");
      return id;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to delete student";

      toast.error(message);
      return rejectWithValue(message);
    }
  },
);
/* ================= CREATE ================= */
export const createTeacher = createAsyncThunk(
  "teacher/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/admin/create-teacher", data);

      toast.success(res.data?.message || "teacher created successfully");
      return res.data?.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to create teacher";

      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

/* ================= UPDATE ================= */
export const updateTeacher = createAsyncThunk(
  "teacher/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/admin/update-teacher/${id}`, data);

      toast.success(res.data?.message || "teacher updated successfully");
      return res.data?.data?.user;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to update teacher";

      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

/* ================= DELETE ================= */
export const deleteTeacher = createAsyncThunk(
  "teacher/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/delete-teacher/${id}`);

      toast.success("teacher deleted successfully");
      return id;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to delete teacher";

      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

/* ================= GET ALL USERS ================= */
export const getAllUsers = createAsyncThunk(
  "getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/users");

      return res.data?.data;
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to fetch users";

      toast.error(message);
      return rejectWithValue(message);
    }
  },
);
export const getAllProjects = createAsyncThunk(
  " getAllProjects",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/projects");

      return res.data?.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to fetch projects";

      toast.error(message);
      return rejectWithValue(message);
    }
  },
);
export const getDashboardData = createAsyncThunk(
  "getDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/fetch-dashboard-stats");

      return res.data?.data.stats;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to fetch dashboard data";

      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const assignSupervisor = createAsyncThunk(
  "assignSupervisor",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/assign-supervisor", data);
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(error.response.data.message || "failed to assign supervisor");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);
export const approveProject = createAsyncThunk(
  "approveProject",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/project/${id}`, {
        status: "approved",
      });
      toast.success(res.data.message || "Project approved successfully");
      return id;
    } catch (error) {
      toast.error(error.response.data.message || "failed to update project");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);
export const rejectProject = createAsyncThunk(
  "rejectProject",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/project/${id}`, {
        status: "rejected",
      });
      toast.success(res.data.message || "Project rejected successfully");
      return id;
    } catch (error) {
      toast.error(error.response.data.message || "failed to rejected project");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);
export const getProject = createAsyncThunk(
  "getProject",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/admin/project/${id}`, {});

      return res.data.data?.project || res.data.data || res.data;
    } catch (error) {
      toast.error(error.response.data.message || "failed to get project");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    students: [],
    teachers: [],
    projects: [],
    users: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createStudent.fulfilled, (state, action) => {
        if (action.payload && state.users) {
          state.users.unshift(action.payload);
        }
      })

      .addCase(updateStudent.fulfilled, (state, action) => {
        if (state.users) {
          state.users = state.users.map((u) =>
            u._id === action.payload._id ? { ...u, ...action.payload } : u,
          );
        }
      })

      .addCase(deleteStudent.fulfilled, (state, action) => {
        if (state.users)
          state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
      })
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.projects = action.payload.projects;
      })
      .addCase(createTeacher.fulfilled, (state, action) => {
        if (action.payload && state.users) {
          state.users.unshift(action.payload);
        }
      })

      .addCase(updateTeacher.fulfilled, (state, action) => {
        if (state.users) {
          state.users = state.users.map((u) =>
            u._id === action.payload._id ? { ...u, ...action.payload } : u,
          );
        }
      })

      .addCase(deleteTeacher.fulfilled, (state, action) => {
        if (state.users)
          state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(getDashboardData.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(approveProject.fulfilled, (state, action) => {
        const projectId = action.payload;
        state.projects = state.projects.map((p) =>
          p._id === projectId ? { ...p, status: "approved" } : p,
        );
      })
      .addCase(rejectProject.fulfilled, (state, action) => {
        const projectId = action.payload;
        state.projects = state.projects.map((p) =>
          p._id === projectId ? { ...p, status: "rejected" } : p,
        );
      })
      .addCase(assignSupervisor.fulfilled, (state, action) => {
        const updatedProject = action.payload;
        if (!updatedProject?._id) return;

        // Find the project and update supervisor
        state.projects = state.projects.map((p) =>
          p._id === updatedProject._id
            ? {
                ...p,
                supervisor: updatedProject.supervisor,
                status: updatedProject.status || p.status,
              }
            : p,
        );
      });
  },
});

export default adminSlice.reducer;
