import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useMediaQuery, TextField, Link, Box, Container, Snackbar, Alert } from '@mui/material';
import StyleButton from '../assets/components/StyleButton';
import { signinUser, signinSelector, clearState } from '../storage/Slices/LoginSlice';
import '/src/assets/css/signIn.css';

import { AppDispatch} from '../storage/store';


interface FormData {
  username: string;
  password: string;
}


function SignIn() {

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isFetching, isSuccess, isError, errorMessage } = useSelector(signinSelector);
  const [openError, setOpenError] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: ''
  });
  const onSubmit = (data: FormData) => {
    dispatch(signinUser(data));
 };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.log('Error submitting form: ' + (error as Error).message);
    }
  };
  useEffect(() => {
    return () => {
      dispatch(clearState());
    };
  }, [dispatch]);

  useEffect(() => {
  if (isError) {
    console.log("Error: " + errorMessage);
    setOpenError(true);
    const timer = setTimeout(() => {
      setOpenError(false);
      dispatch(clearState());
    }, 15000);
    return () => clearTimeout(timer);
  }

  if (isSuccess) {
    console.log("Registration successful");
    dispatch(clearState());
    navigate('/app');
  }
  }, [isError, isSuccess, dispatch, navigate]);
  return (
    <Container 
      component="main" 
      maxWidth="xs"
      sx={{ 
        height:'100vh',
        width: '100vw'
      }}
    >
      <div style={{ margin: '200px' }} />
      <Box>
        <Box 
          component="form" 
          noValidate 
          sx={{
            mt: 1, 
            marginTop: '8',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '20px',
            textAlign: 'center', 
            borderColor: 'white', 
            borderWidth: '6px', 
            borderStyle: 'solid',
          }} 
          onSubmit={handleFormSubmit}
        >
          <img src="/favicon.ico" style={{ width: '50px', height: '80px' }} alt="Logo" />
          <TextField
              margin="normal"
              required
              fullWidth
              type='text'
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              autoFocus
              color='secondary'
              sx={{ backgroundColor: 'white' }}
              variant='filled'
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              id="password"
              color='secondary'
              variant='filled'
              autoComplete="current-password"
              sx={{ backgroundColor: 'white' }}
            />
          <StyleButton text="Sign In" 
          disabled={isFetching} 
          type="submit" />
          <Link href="/user/register" variant="body1" sx={{ fontFamily: "Undertale", color: 'white' }}>
            {"Don't have an account? Sign Up"}
          </Link>
          <Snackbar open={openError} autoHideDuration={15000} onClose={() => setOpenError(false)}>
            <Alert severity="error" sx={{fontFamily:"Undertale"}}>
              {errorMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </Container>
  );
}

export default SignIn;