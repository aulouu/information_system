import * as React from 'react';

import List from '@mui/material/List';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import Paper from '@mui/material/Paper';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';

import {BrowserRouter as Router, Link, Route, Routes,} from 'react-router-dom';
import {Grid} from '@mui/material';

import Error from './pages/Error.tsx'
import SignIn from './pages/SignIn.tsx';
import Register from './pages/Register.tsx';
import MainPage from './pages/MainPage.tsx';

import '/src/assets/css/main_page.css'
import CoordinatesTable from './assets/components/Coordinates/CoordinatesTable.tsx';
import LocationsTable from './assets/components/Location/LocationTable.tsx';
import PersonTable from './assets/components/Person/PersonTable.tsx';
import AdminRequestTable from './assets/components/Admin/AdminRequestTable.tsx';
import {appSelector, clearAllStates} from './storage/Slices/AppSlice.tsx';
import {clearUserData} from './storage/Slices/LoginSlice.tsx';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch} from './storage/store.tsx';
import SpecialFunctions from './assets/components/SpecialFunctions.tsx';
import MapPage from './assets/components/Map/MapPage.tsx';
import ImportFile from './pages/ImportFile.tsx';

interface ListItemLinkProps {
    icon?: React.ReactElement<unknown>;
    primary: string;
    to: string;
}

function ListItemLink(props: ListItemLinkProps) {
    const {icon, primary, to} = props;

    return (
        <ListItemButton component={Link} to={to}>
            {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
            <ListItemText primary={primary}/>
        </ListItemButton>
    );
}

function App() {
    const dispatch = useDispatch<AppDispatch>();
    const {isAuth} = useSelector(appSelector);
    const handleLogout = () => {
        dispatch(clearAllStates());
        dispatch(clearUserData());
    };
    return (
        <Router>
            <div style={{
                position: 'fixed',
                top: 10,
                right: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
            }}>
                <label style={{
                    fontFamily: "Undertale",
                    backgroundColor: '#855666',
                    color: 'white',
                    padding: 5,
                    borderRadius: 5,
                    // alignItems: 'flex-end',
                    flexDirection: 'column',
                    display: 'flex',

                }}>
                    LOGIN STATUS: <label
                    style={{color: "#332127"}}>{isAuth ? "LOGGED IN AS" + " " + localStorage.getItem('username')
                    : "NOT LOGGED IN"}</label>
                    <br/>
                    <label style={{color: "white"}}>{isAuth ? " ROLE: " : ""}</label>
                    <label style={{color: "#22161a"}}>{isAuth ? localStorage.getItem('role') : ""}</label>
                </label>
            </div>
            <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Paper elevation={1}>
                    <List aria-label="main sections" sx={{
                        color: 'white',
                        backgroundColor: '#855666',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        scale: "130%"
                    }}>
                        <ListItemLink to="/app" primary="APP" icon={<MenuIcon color='primary'/>}/>
                        {!isAuth && <><ListItemLink to="/user/signIn" primary="SIGN IN"
                                                    icon={<AccountCircleIcon color='primary'/>}/>
                            <ListItemLink to="/user/register" primary="REGISTER"
                                          icon={<PersonAddAltRoundedIcon color='primary'/>}/></>}
                        {isAuth && <>   <ListItemButton onClick={handleLogout}>
                            <ListItemIcon><ExitToAppIcon color='primary'/></ListItemIcon>
                            <ListItemText primary="LOGOUT"/>
                        </ListItemButton>
                        </>}
                    </List>
                </Paper>
            </Box>
            <Grid container maxWidth={'xs'}>
                <Grid item sx={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Routes>
                        <Route path="/user/signIn" element={<SignIn/>}/>
                        <Route path="/user/register" element={<Register/>}/>
                        <Route path="/app/*" element={<MainPage/>}/>
                        <Route path="/app/coordinates" element={<CoordinatesTable/>}/>
                        <Route path="/app/location" element={<LocationsTable/>}/>
                        <Route path="/app/person" element={<PersonTable/>}/>
                        <Route path="/app/admin" element={<AdminRequestTable/>}/>
                        <Route path="/app/special" element={<SpecialFunctions/>}/>
                        <Route path="/app/map" element={<MapPage/>}/>
                        <Route path="/app/import" element={<ImportFile/>}/>
                        <Route path="/error" element={<Error/>}/>
                    </Routes>
                </Grid>
            </Grid>
        </Router>
    )
}

export default App
