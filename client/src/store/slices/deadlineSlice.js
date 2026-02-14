import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const createDeadline = createAsyncThunk(
  "deadline/create",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/deadline/create-deadline/${id}`,
        data,
      );

      toast.success(res.data?.message || "Deadline created successfully");

      return res.data?.data?.deadline;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to create deadline";

      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

const deadlineSlice = createSlice({
  name: "deadline",
  initialState: {
    deadlines: [],
    nearby: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createDeadline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeadline.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.deadlines.push(action.payload);
        }
      })
      .addCase(createDeadline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default deadlineSlice.reducer;
