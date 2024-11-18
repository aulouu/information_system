import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { RootState } from "../store";

interface UserSigninData {
   username: string
   password: string;
}
 
 interface SigninState {
   isFetching: boolean;
   isSuccess: boolean;
   isError: boolean;
   errorMessage: string;
 }

interface SigninResponse {
   username: string,
   role: string,
   token: string,
   tokenType: string;
 }
 
 export const signinUser = createAsyncThunk<
   SigninResponse,
   UserSigninData,
   { rejectValue: string }
 >(
   "users/signinUser",
   async ({ username,  password }, thunkAPI) => {
     try {
       const link = "http://localhost:8080/auth/login";
       const params = {
         username,
         password
       };
       const response = await axios.post<SigninResponse>(link, params, {
         headers: { "Content-Type": "application/json",}
       });
       const data = response.data;
       if (response.status === 200) {
         return data;
       } else {
         return thunkAPI.rejectWithValue(data.toString());
       }
     } catch (e) {
       const error = e as AxiosError<string>;
       console.log("Error", error.response?.data);
       return thunkAPI.rejectWithValue(error.response?.data || "An error occurred");
     }
   }
 );
 
 const initialState: SigninState = {
   isFetching: false,
   isSuccess: false,
   isError: false,
   errorMessage: ""
 };
 
 export const SigninSlice = createSlice({
   name: "signin",
   initialState,
   reducers: {
     clearState: (state) => {
       state.isError = false;
       state.isSuccess = false;
       state.isFetching = false;
       state.errorMessage = "";
     },
     clearUserData: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
     }
   },
   extraReducers: (builder) => {
     builder
       .addCase(signinUser.fulfilled, (state, action: PayloadAction<SigninResponse>) => {
         localStorage.setItem('token', action.payload.token);
         console.log(localStorage.getItem('token'));
         state.isFetching = false;
         state.isSuccess = true;
         localStorage.setItem('username', action.payload.username);
         localStorage.setItem('role', action.payload.role);
         return state;
       })
       .addCase(signinUser.rejected, (state, action) => {
         console.log(action.payload);
         state.isFetching = false;
         state.isError = true;
         state.errorMessage = (action.payload as { message?: string }).message || "An error occurred";
       })
       .addCase(signinUser.pending, (state) => {
         state.isFetching = true;
       });
   }
 });
 
 export const { clearState, clearUserData } = SigninSlice.actions;
 
 export const signinSelector = (state: RootState) => state.signin;
 
 export default SigninSlice.reducer;