import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;

/* =========================
   ASYNC THUNKS
========================= */

// 🔐 Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      if (!data.success) {
        return rejectWithValue("Login failed");
      }

      return data.userData;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Login failed");
    }
  }
);

// 🔄 Check auth (on refresh)
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async () => {
    const { data } = await axios.get(
      "http://localhost:5000/api/auth/is-auth"
    );
    return data.success; // true / false
  }
);

// 👤 Fetch user profile
export const getUserData = createAsyncThunk(
  "auth/getUserData",
  async () => {
    const { data } = await axios.get(
      "http://localhost:5000/api/user/profile"
    );
    return data.userData || null;
  }
);

/* =========================
   SLICE
========================= */

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoggedin: false,
    userData: null,
    loading: false,
  },

  /* =========================
     SYNC REDUCERS (for UI)
  ========================= */
  reducers: {
    // Context-style setters (to keep UI unchanged)
    setIsLoggedin: (state, action) => {
      state.isLoggedin = action.payload;
    },

    setUserData: (state, action) => {
      state.userData = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Logout
    logout: (state) => {
      state.isLoggedin = false;
      state.userData = null;
      state.loading = false;
    },
  },

  /* =========================
     ASYNC REDUCERS
  ========================= */
  extraReducers: (builder) => {
    builder
      /* ---- LOGIN ---- */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoggedin = true;
        state.userData = action.payload;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoggedin = false;
        state.userData = null;
        state.loading = false;
      })

      /* ---- CHECK AUTH ---- */
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoggedin = action.payload;
        if (!action.payload) state.loading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoggedin = false;
        state.loading = false;
      })

      /* ---- GET USER DATA ---- */
      .addCase(getUserData.fulfilled, (state, action) => {
        state.userData = action.payload;
        state.loading = false;
      })
      .addCase(getUserData.rejected, (state) => {
        state.userData = null;
        state.loading = false;
      });
  },
});

export default authSlice.reducer;

export const {
  logout,
  setIsLoggedin,
  setUserData,
  setLoading,
} = authSlice.actions;
