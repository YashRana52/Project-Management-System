import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

/* ================= GET ================= */
export const getNotification = createAsyncThunk(
  "student/getNotification",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/notification");
      return res.data?.data || res.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to get notifications";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

/* ================= READ ONE ================= */
export const markAsRead = createAsyncThunk(
  "student/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.put(`/notification/${id}/read`);
      return id;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to read notification";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

/* ================= READ ALL ================= */
export const markAllAsRead = createAsyncThunk(
  "student/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.put("/notification/read-all");
      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to read all notifications";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

/* ================= DELETE ONE ================= */
export const deleteNotification = createAsyncThunk(
  "student/deleteNotification",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/notification/${id}`);
      return id;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to delete notification";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

/* ================= DELETE ALL ================= */
export const deleteAllNotification = createAsyncThunk(
  "student/deleteAllNotification",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.delete("/notification/delete-all");
      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to delete all notifications";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    list: [],
    unreadCount: 0,
    readCount: 0,
    highPriorityMessages: 0,
    thisWeekNotifications: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    /* ===== GET ===== */
    builder.addCase(getNotification.fulfilled, (state, action) => {
      state.list = action.payload?.notifications || [];
      state.unreadCount = action.payload?.unreadOnly || 0;
      state.readCount = action.payload?.readOnly || 0;
      state.highPriorityMessages = action.payload?.highPriorityMessages || 0;
      state.thisWeekNotifications = action.payload?.thisWeekNotifications || 0;
    });

    /* ===== READ ONE ===== */
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      state.list = state.list.map((n) =>
        n._id === action.payload ? { ...n, isRead: true } : n,
      );
      state.unreadCount = Math.max(0, state.unreadCount - 1);
      state.readCount += 1;
    });

    /* ===== READ ALL ===== */
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      const unread = state.list.filter((n) => !n.isRead).length;
      state.list = state.list.map((n) => ({ ...n, isRead: true }));
      state.unreadCount = 0;
      state.readCount += unread;
    });

    /* ===== DELETE ONE ===== */
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const removed = state.list.find((n) => n._id === action.payload);
      state.list = state.list.filter((n) => n._id !== action.payload);

      if (removed) {
        if (!removed.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else {
          state.readCount = Math.max(0, state.readCount - 1);
        }

        if (removed.priority === "high") {
          state.highPriorityMessages = Math.max(
            0,
            state.highPriorityMessages - 1,
          );
        }
      }
    });

    /* ------ DELETE ALL----- */
    builder.addCase(deleteAllNotification.fulfilled, (state) => {
      state.list = [];
      state.unreadCount = 0;
      state.readCount = 0;
      state.highPriorityMessages = 0;
      state.thisWeekNotifications = 0;
    });
  },
});

export default notificationSlice.reducer;
