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
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/auth/is-auth"
      );
      return data.success; // true / false
    } catch {
      return rejectWithValue(false);
    }
  }
);

// 👤 Fetch user profile
export const getUserData = createAsyncThunk(
  "auth/getUserData",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/user/profile"
      );
      return data.userData;
    } catch {
      return rejectWithValue(null);
    }
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
    authChecked: false, // 🔥 IMPORTANT
  },

  reducers: {
    setIsLoggedin: (state, action) => {
      state.isLoggedin = action.payload;
    },

    setUserData: (state, action) => {
      state.userData = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    logout: (state) => {
      state.isLoggedin = false;
      state.userData = null;
      state.loading = false;
      state.authChecked = true; // 🔥 already known
    },
  },

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
        state.authChecked = true; // 🔥
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoggedin = false;
        state.userData = null;
        state.loading = false;
        state.authChecked = true; // 🔥
      })

      /* ---- CHECK AUTH ---- */
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoggedin = action.payload;
        state.loading = false;
        state.authChecked = true; // 🔥 MOST IMPORTANT
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoggedin = false;
        state.loading = false;
        state.authChecked = true; // 🔥
      })

      /* ---- GET USER DATA ---- */
      .addCase(getUserData.pending, (state) => {
        state.loading = true;
      })
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

/* =========================
   EXPORTS
========================= */

export const {
  logout,
  setIsLoggedin,
  setUserData,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
