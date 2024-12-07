import {Alert, Box, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {
    appSelector,
    clearState,
    getAdminRequest,
    getUserRole,
    sendAdminRequest,
    sendApproveAdminRequest,
    setAdminRequestPage
} from "../../../storage/Slices/AppSlice";
import StyleButton from '../StyleButton';
import {AppDispatch} from '../../../storage/store';
import {useEffect, useState} from 'react';

interface AdminRequest {
    id: number;
    username: string;
};

export type AdminRequestArray = AdminRequest[];


export default function AdminRequestTable() {
    const dispatch = useDispatch<AppDispatch>();

    const {adminRequest, isFetching, adminRequestPage, isError, errorMessage} = useSelector(appSelector);
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
        if (localStorage.getItem('username') !== undefined && localStorage.getItem('username') !== null) {
            dispatch(getUserRole(localStorage.getItem('username') as string));
        }

    }, [isError, dispatch]);

    const handleCreate = () => {
        dispatch(sendAdminRequest())
    }

    const handleApprove = (request: AdminRequest) => {
        dispatch(sendApproveAdminRequest({id: request.id}))
    }
    if (adminRequest !== undefined && adminRequest.length > 0) {
        return (
            <>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflowX: 'hidden',
                    flexDirection: 'column'
                }}>
                    <div>
                        {localStorage.getItem('role') !== undefined && localStorage.getItem('role') !== 'ADMIN' ?
                            <StyleButton text="Create Request" onclick={handleCreate} disabled={isFetching}
                                         type="button"/> : <></>}
                    </div>
                    <TableContainer className='main__table-container'>
                        <Table className="main__table" aria-label="data table"
                               sx={{maxWidth: '100%', overflowX: 'auto'}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Username</TableCell>
                                    {localStorage.getItem('role') !== undefined && localStorage.getItem('role') === 'ADMIN' ?
                                        <TableCell></TableCell> : <></>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {adminRequest.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>{row.username}</TableCell>
                                        {localStorage.getItem('role') !== undefined && localStorage.getItem('role') === 'ADMIN' ?
                                            <TableCell><StyleButton text="Approve" onclick={(e) => handleApprove(row)}
                                                                    disabled={isFetching}
                                                                    type="button"/></TableCell> : <></>}

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>

                        <StyleButton text="Previous Page"
                                     disabled={isFetching || adminRequestPage === 0}
                                     type="button"
                                     onclick={() => {
                                         if (adminRequestPage > 0) {
                                             dispatch(setAdminRequestPage(adminRequestPage - 1));
                                             dispatch(getAdminRequest(adminRequestPage - 1))
                                         }
                                     }}/>
                        <label style={{
                            fontFamily: "Undertale",
                            backgroundColor: '#855666',
                            color: '#332127'
                        }}>
                            {adminRequestPage}
                        </label>
                        <StyleButton text="Next Page"
                                     disabled={isFetching}
                                     type="button"
                                     onclick={() => {
                                         dispatch(setAdminRequestPage(adminRequestPage + 1));
                                         dispatch(getAdminRequest(adminRequestPage + 1))
                                     }}/>
                    </Box>
                </Box>
                <Snackbar open={openError} autoHideDuration={3000} onClose={() => setOpenError(false)}>
                    <Alert severity="error" sx={{fontFamily: "Undertale"}}>
                        {errorMessage}
                    </Alert>
                </Snackbar>
            </>

        );
    } else {
        return (
            <>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflowX: 'hidden',
                    flexDirection: 'column'
                }}>
                    <div>
                        {localStorage.getItem('role') !== undefined && localStorage.getItem('role') !== 'ADMIN' ?
                            <StyleButton text="Create Request" onclick={handleCreate} disabled={isFetching}
                                         type="button"/> : <></>}
                    </div>
                    <TableContainer className='main__table-container' sx={{maxWidth: '100%', overflowX: 'auto'}}>
                        <Table className="main__table" aria-label="data table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Username</TableCell>
                                </TableRow>
                            </TableHead>
                        </Table>
                    </TableContainer>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>

                        <StyleButton text="Previous Page"
                                     disabled={isFetching || adminRequestPage === 0}
                                     type="button"
                                     onclick={() => {
                                         if (adminRequestPage > 0) {
                                             dispatch(setAdminRequestPage(adminRequestPage - 1));
                                             dispatch(getAdminRequest(adminRequestPage - 1))
                                         }
                                     }}/>
                        <label style={{
                            fontFamily: "Undertale",
                            backgroundColor: '#855666',
                            color: '#332127'
                        }}>
                            {adminRequestPage}
                        </label>
                        <StyleButton text="Next Page"
                                     disabled={isFetching}
                                     type="button"
                                     onclick={() => {
                                         dispatch(setAdminRequestPage(adminRequestPage + 1));
                                         dispatch(getAdminRequest(adminRequestPage + 1))
                                     }}/>
                    </Box>
                </Box>
                <Snackbar open={openError} autoHideDuration={3000} onClose={() => setOpenError(false)}>
                    <Alert severity="error" sx={{fontFamily: "Undertale"}}>
                        {errorMessage}
                    </Alert>
                </Snackbar>
            </>
        );
    }
}


