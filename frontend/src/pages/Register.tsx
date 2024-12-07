import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {clearState, signupSelector, signupUser} from '../storage/Slices/RegisterSlice';
import StyleButton from '../assets/components/StyleButton';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {useMediaQuery} from '@mui/material';

import {AppDispatch} from '../storage/store';

import '/src/assets/css/signIn.css';

interface FormData {
    username: string;
    password: string;
}


function Register() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const {isFetching, isSuccess, isError, errorMessage} = useSelector(signupSelector);
    const [openError, setOpenError] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: ''
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
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
    const onSubmit = (data: FormData) => {
        dispatch(signupUser(data));
    };
    useEffect(() => {
        return () => {
            dispatch(clearState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            setOpenError(true);
            const timer = setTimeout(() => {
                setOpenError(false);
                dispatch(clearState());
            }, 3000);
            return () => clearTimeout(timer);
        }

        if (isSuccess) {
            console.log("Registration successful");
            dispatch(clearState());
            navigate('/app');
        }
    }, [isError, isSuccess, dispatch, navigate]);

    const isDesktop = useMediaQuery('(min-width: 1260px)');
    const isTablet = useMediaQuery('(min-width: 781px) and (max-width: 1259px)');
    const isMobile = useMediaQuery('(max-width: 780px)');

    return (
        <>
            <Container
                component="main"
                maxWidth="xs"
                sx={{
                    height: isDesktop ? '100vh' : isTablet ? '100vh' : isMobile ? '100vh' : '100vh',
                    width: isDesktop ? '100vw' : isTablet ? '100vw' : isMobile ? '100vw' : '100vw'
                }}
            >
                <div style={{margin: '200px'}}/>
                <Box>
                    <Box component="form" noValidate sx={{
                        mt: 1, marginTop: '8',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        padding: '20px', borderColor: 'white', borderWidth: '6px', borderStyle: 'solid',
                        textAlign: 'center',
                    }} onSubmit={handleFormSubmit}>
                        <img src="/favicon.ico" style={{width: '50px', height: '80px'}} alt="Undertale Red"/>
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
                            sx={{backgroundColor: 'white'}}
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
                            sx={{backgroundColor: 'white'}}
                        />
                        <StyleButton text="Register" disabled={isFetching} type="submit"/>

                        <Link href="/user/signIn" variant="body1" sx={{fontFamily: "Undertale", color: 'white'}}>
                            {"You already have an account? Sign In"}
                        </Link>

                        <Snackbar open={openError} autoHideDuration={3000} onClose={() => setOpenError(false)}>
                            <Alert severity="error" sx={{fontFamily: "Undertale"}}>
                                {errorMessage}
                            </Alert>
                        </Snackbar>
                    </Box>
                </Box>
            </Container>
        </>
    );
}

export default Register;