import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { RootState } from "../store";

interface UserSignupData {
   username: string;
   password: string;
 }
 
 interface SignupState {
   isFetching: boolean;
   isSuccess: boolean;
   isError: boolean;
   errorMessage: string;
 }

interface SignupResponse {
   username: string,
   role: string,
   token: string,
   tokenType: string;
 }
 
 export const signupUser = createAsyncThunk<
   SignupResponse,
   UserSignupData,
   { rejectValue: string }
 >(
   "users/signupUser",
   async ({ username,  password }, thunkAPI) => {
     try {
       const link = "http://localhost:8080/auth/register";
       const params = {
         username,
         password
       };
       const response = await axios.post<SignupResponse>(link, params, {
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
 
 const initialState: SignupState = {
   isFetching: false,
   isSuccess: false,
   isError: false,
   errorMessage: ""
 };
 
 export const SignupSlice = createSlice({
   name: "signup",
   initialState,
   reducers: {

     clearState: (state) => {
       state.isError = false;
       state.isSuccess = false;
       state.isFetching = false;
       state.errorMessage = "";
     }
   },
   extraReducers: (builder) => {
     builder
       .addCase(signupUser.fulfilled, (state, action: PayloadAction<SignupResponse>) => {
         console.log(action.payload);
         localStorage.setItem('token', action.payload.token);
         localStorage.setItem('username', action.payload.username);
         localStorage.setItem('role', action.payload.role);
         state.isFetching = false;
         state.isSuccess = true;
         state.errorMessage = "Registration successful!";
       })
       .addCase(signupUser.rejected, (state, action) => {
         console.log(action.payload);
         state.isFetching = false;
         state.isError = true;
         state.errorMessage = (action.payload as { message?: string }).message || "An error occurred";
       })
       .addCase(signupUser.pending, (state) => {
         state.isFetching = true;
       });
   }
 });
 
 export const { clearState } = SignupSlice.actions;
 
 export const signupSelector = (state: RootState) => state.signup;
 
 export default SignupSlice.reducer;