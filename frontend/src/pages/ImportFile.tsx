import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import '../assets/css/signIn.css'
import YamlUploader from '../assets/components/YamlUploader';
import {appSelector, clearState} from '../storage/Slices/AppSlice';
import {useDispatch, useSelector} from 'react-redux';
import {Alert, Snackbar} from '@mui/material';
import {useEffect, useState} from 'react';
import {AppDispatch} from '../storage/store';
import ImportHistoryTable from '../assets/components/ImportHistoryTable';

function ImportFile() {
    const dispatch = useDispatch<AppDispatch>();
    const {isAuth, isError, errorMessage, isSuccess} = useSelector(appSelector) as {
        isAuth: boolean;
        isError: boolean;
        errorMessage: string;
        isSuccess: boolean;
    };
    const [openError, setOpenError] = useState<boolean>(false);
    useEffect(() => {
        if (isError) {
            console.log("Error: " + errorMessage);
            setOpenError(true);
            const timer = setTimeout(() => {
                setOpenError(false);
                dispatch(clearState());
            }, 3000);
            return () => clearTimeout(timer);
        }
        if (isSuccess) {
            console.log("File uploaded successfully");
            setOpenError(true);
            const timer = setTimeout(() => {
                setOpenError(false);
                dispatch(clearState());
            }, 3000);
        }
    }, [isError, isSuccess, dispatch]);
    return (
        <>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflowX: 'hidden',
                flexDirection: 'column',
                mt: '10%'
            }}>
                {isAuth && <>
                    <YamlUploader/>
                    <ImportHistoryTable/>
                </>}
                {!isAuth && <Box component="form" noValidate sx={{
                    mt: 1, marginTop: '8',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px',
                    textAlign: 'center', borderColor: 'white', borderWidth: '6px', borderStyle: 'solid',
                }}>
                    <img src="/public/error.png" style={{width: '50px', height: '45px'}}/>
                    <Typography variant="h6" color="white" fontFamily="Undertale" sx={{mt: 4}}>You are not authorized to
                        import files</Typography>
                </Box>}
            </Box>
            <Snackbar open={openError} autoHideDuration={3000} onClose={() => setOpenError(false)}>
                <Alert severity={isError ? "error" : "success"} sx={{fontFamily: "Undertale"}}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </>
    )
}

export default ImportFile