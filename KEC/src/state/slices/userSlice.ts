import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchVerifiedUser = createAsyncThunk(
  "user/fetchVerifiedUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/auth/me", { withCredentials: true });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch");
    }
  }
);

interface UserState{
    id?:string|null;
    firstName?:string;
    lastName?:string;
    email?:string;
    role?:string;
    status:"idle" | "loading" | "succeeded" | "failed";
    error?:string | null;
    isAuthenticated:boolean;

}

const initialState:UserState={
    id:null,
    firstName:'',
    lastName:'',
    email:'',
    role:'',
    status:'idle',
    error:null,
    isAuthenticated:false,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action :PayloadAction<Partial<UserState>>) => {
      state.id = action.payload.id;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.id = null;
      state.firstName = "";
      state.lastName = "";
      state.email = "";
      state.role = "";
      state.status = "idle";
      state.isAuthenticated = false;
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchVerifiedUser.pending,(state)=>{
        state.status='loading'
        state.error=null
    })
    .addCase(fetchVerifiedUser.fulfilled,(state,action:PayloadAction<UserState>)=>{
        state.status='succeeded'
        state.id=action.payload.id;
        state.firstName=action.payload.firstName;
        state.lastName=action.payload.lastName;
        state.email=action.payload.email;
        state.role=action.payload.role;
        state.isAuthenticated=true;
    })
    .addCase(fetchVerifiedUser.rejected,(state, action)=>{
        state.status='failed'
        state.error=action.payload as string
        state.isAuthenticated=false
    })
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
