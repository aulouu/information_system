import {
   Alert,
   Box,
   Grid,
   Input,
   MenuItem,
   Snackbar,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   TextField
} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {appSelector, clearState, setError, setErrorMessage, setFetching} from "../../storage/Slices/AppSlice";
import {useEffect, useState} from 'react';
import StyleButton from './StyleButton';
import axios, {AxiosError} from "axios";
import moment from 'moment';
import {AppDispatch} from '../../storage/store';

const colors = [{value: "GREEN", label: "Green"}, {value: "RED", label: "Red"}, {value: "ORANGE", label: "Orange"}];

interface Person {
    id: number;
    name: string;
    coordinatesId: number;
    creationDate: string;
    eyeColor: string;
    hairColor: string;
    locationId: number;
    height: number;
    birthday: string;
    nationality: string;
    adminCanModify: boolean;
    userId: string;
}

export default function SpecialFunctionsTable() {
    const dispatch = useDispatch<AppDispatch>();
    const {isFetching, isError, errorMessage} = useSelector(appSelector);
    const [removePersonsByHeight, setRemovePersonsByHeight] = useState("");
    const [removePersonsByHeightResult, setRemovePersonsByHeightResult] = useState("");
    const [nameSubstring, setNameSubstring] = useState("");
    // const [nameSubstringResult, setNameSubstringResult] = useState("");
    const [nameSubstringResult, setNameSubstringResult] = useState<Person[]>([]);
    const [birthdayDate, setBirthdayDate] = useState("");
    // const [birthdayDateResult, setBirthdayDateResult] = useState("");
    const [birthdayDateResult, setBirthdayDateResult] = useState<Person[]>([]);
    const [hairColorCountResult, setHairColorCountResult] = useState("");
    const [hairColorCount, setHairColorCount] = useState("");
    const [eyeColorCountResult, setEyeColorCountResult] = useState("");
    const [eyeColorCount, setEyeColorCount] = useState("");

    const [openError, setOpenError] = useState<boolean>(false);

    const handleRemovePersonsByHeight = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        dispatch(setFetching(true));
        try {
            if (removePersonsByHeight === "" || isNaN(Number(removePersonsByHeight)) || Number(removePersonsByHeight) < 0) {
                dispatch(setError(true));
                dispatch(setErrorMessage("Please enter a valid height"));
                dispatch(setFetching(false));
                return;
            }

            const link = `http://localhost:24680/person/delete-persons/${removePersonsByHeight}`;
            let headers = {}
            if (localStorage.getItem('token') !== null) {
                headers = {
                    "Authorization": 'Bearer ' + String(localStorage.getItem('token'))
                }
            }

            // Проверка параметров запроса
            const params = {height: removePersonsByHeight};
            console.log("Request params:", params);

            const response = await axios.post(link, {}, {
                params: {height: removePersonsByHeight},
                headers: headers
            });
            const data = response.data;
            if (response.status === 200) {
                setRemovePersonsByHeightResult("Successfully Remove Persons");
                dispatch(setFetching(false));
                return;
            } else {
                setRemovePersonsByHeightResult("");
                dispatch(setError(true));
                dispatch(setErrorMessage(data.message));
                dispatch(setFetching(false));
                return;
            }
        } catch (e) {
            const error = e as AxiosError<string>;
            console.log("Error", error.response?.data?.message);
            dispatch(setError(true));
            setRemovePersonsByHeightResult("");
            dispatch(setErrorMessage(error.response?.data?.message));
            dispatch(setFetching(false));
        }
    }

    const handleGetNameStartsWith = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        dispatch(setFetching(true));
        try {
            const link = `http://localhost:24680/person/name/${nameSubstring}`;

            const response = await axios.get(link, {});
            const data = response.data;
            if (response.status === 200) {
                const newData = [data.map((person: any) => {
                    return person.name;
                })];
                setNameSubstringResult(data);
                dispatch(setFetching(false));
                return;
            } else {
                dispatch(setError(true));
                dispatch(setErrorMessage(data.message));
                dispatch(setFetching(false));
                return;
            }
        } catch (e) {
            const error = e as AxiosError<string>;
            console.log("Error", error.response?.data);
            dispatch(setError(true));
            dispatch(setErrorMessage(error.response?.data || "An error occurred"));
            dispatch(setFetching(false));
        }
    }

    const handleGetBirthdayLessThan = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        dispatch(setFetching(true));
        try {
            const date = moment(birthdayDate, 'DD.MM.YYYY', true);
            if (!date.isValid()) {
                dispatch(setError(true));
                dispatch(setErrorMessage(typeof errorMessage.response?.data === 'object' ? JSON.stringify(errorMessage.response?.data) : errorMessage.response?.data || "Please enter a valid date for Birthday in the format dd.mm.yyyy"));
                dispatch(setFetching(false));
                return;
            }
            const formattedDate = date.format('DD.MM.YYYY');
            console.log("Formatted Date:", formattedDate);
            console.log("Type of formattedDate:", typeof formattedDate);
            const link = `http://localhost:24680/person/birthday/${formattedDate}`;

            const response = await axios.get(link, {});
            const data = response.data;
            if (response.status === 200) {
                const newData = [data.map((person: any) => {
                    return person.name;
                })];
                setBirthdayDateResult(data);
                dispatch(setFetching(false));
                return;
            } else {
                dispatch(setError(true));
                dispatch(setErrorMessage(data.message));
                dispatch(setFetching(false));
                return;
            }
        } catch (e) {
            const error = e as AxiosError<string>;
            console.log("Error", error.response?.data);
            dispatch(setError(true));
            // dispatch(setErrorMessage(typeof error.response?.data === 'object' ? JSON.stringify(error.response?.data) : error.response?.data || "An error occurred"));
            dispatch(setErrorMessage(error.response?.data || "An error occurred"));
            dispatch(setFetching(false));
        }
    }

    const handleGetCountWithHairColor = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        dispatch(setFetching(true));
        try {
            if (hairColorCount === "") {
                dispatch(setError(true));
                dispatch(setErrorMessage("Please pick a hair color"));
                dispatch(setFetching(false));
                return;
            }
            const link = `http://localhost:24680/person/hairColor/equals/${hairColorCount}`;

            const response = await axios.get(link, {});
            const data = response.data;
            if (response.status === 200) {
                setHairColorCountResult(String(data.length));
                dispatch(setFetching(false));
                return;
            } else {
                dispatch(setError(true));
                dispatch(setErrorMessage(data.message));
                dispatch(setFetching(false));
                return;
            }
        } catch (e) {
            const error = e as AxiosError<string>;
            console.log("Error", error.response?.data);
            dispatch(setError(true));
            dispatch(setErrorMessage(error.response?.data || "An error occurred"));
            dispatch(setFetching(false));
        }
    }

    const handleGetCountWithEyeColor = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        dispatch(setFetching(true));
        try {
            if (eyeColorCount === "") {
                dispatch(setError(true));
                dispatch(setErrorMessage("Please pick a eye color"));
                dispatch(setFetching(false));
                return;
            }
            const link = `http://localhost:24680/person/eyeColor/equals/${eyeColorCount}`;

            const response = await axios.get(link, {});
            const data = response.data;
            if (response.status === 200) {
                setEyeColorCountResult(String(data.length));
                dispatch(setFetching(false));
                return;
            } else {
                dispatch(setError(true));
                dispatch(setErrorMessage(data.message));
                dispatch(setFetching(false));
                return;
            }
        } catch (e) {
            const error = e as AxiosError<string>;
            console.log("Error", error.response?.data);
            dispatch(setError(true));
            dispatch(setErrorMessage(error.response?.data || "An error occurred"));
            dispatch(setFetching(false));
        }
    }

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
    }, [isError, dispatch])

    return (<>
        <Box sx={{display: 'flex', alignItems: 'center', overflowX: 'hidden', flexDirection: 'column'}}>

            <Grid container sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row'
            }}>
                <Grid item
                      sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                    <Grid container sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row'
                    }}>
                        <Grid item sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column',
                            borderWidth: '2px',
                            borderColor: 'white',
                            borderStyle: 'solid',
                            margin: '30px',
                            padding: '10px'
                        }}>
                            <StyleButton text="Get Count With Hair Color" onclick={handleGetCountWithHairColor}
                                         disabled={isFetching} type="button"/>
                            <TextField
                                margin="dense"
                                type='text'
                                select
                                variant='standard'
                                required
                                fullWidth
                                id="hairColor"
                                name="hairColor"
                                autoComplete="hairColor"
                                autoFocus
                                label="Hair Color"
                                // defaultValue={""}
                                value={hairColorCount}
                                onChange={(e) => setHairColorCount(e.target.value)}
                                color='primary'
                                sx={{color: 'white', mb: 1, WebkitTextFillColor: 'white'}}
                            >{colors.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}</TextField>
                            <TextField
                                margin="dense"
                                type='text'
                                variant='outlined'
                                fullWidth
                                id="hairColor"
                                name="hairColor"
                                autoComplete="hairColor"
                                autoFocus
                                // defaultValue={hairColorCountResult}
                                value={hairColorCountResult}
                                color='primary'
                                sx={{color: 'white', mb: 1, WebkitTextFillColor: 'white'}}
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                            />
                        </Grid>

                        <Grid item sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column',
                            borderWidth: '2px',
                            borderColor: 'white',
                            borderStyle: 'solid',
                            margin: '30px',
                            padding: '10px'
                        }}>
                            <StyleButton text="Get Count With Eye Color" onclick={handleGetCountWithEyeColor}
                                         disabled={isFetching} type="button"/>
                            <TextField
                                margin="dense"
                                type='text'
                                select
                                variant='standard'
                                required
                                fullWidth
                                id="eyeColor"
                                name="eyeColor"
                                autoComplete="eyeColor"
                                autoFocus
                                label="Eye Color"
                                // defaultValue={""}
                                value={eyeColorCount}
                                onChange={(e) => setEyeColorCount(e.target.value)}
                                color='primary'
                                sx={{color: 'white', mb: 1, WebkitTextFillColor: 'white'}}
                            >{colors.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}</TextField>
                            <TextField
                                margin="dense"
                                type='text'
                                variant='outlined'
                                fullWidth
                                id="eyeColor"
                                name="eyeColor"
                                autoComplete="eyeColor"
                                autoFocus
                                // defaultValue={eyeColorCountResult}
                                value={eyeColorCountResult}
                                color='primary'
                                sx={{color: 'white', mb: 1, WebkitTextFillColor: 'white'}}
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                            />
                        </Grid>

                    </Grid>
                </Grid>

                <Grid container sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row'
                }}>
                    <Grid item sx={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                        borderWidth: '2px', borderColor: 'white', borderStyle: 'solid', margin: '30px', padding: '10px'
                    }}>
                        <StyleButton text="Get Persons With Birthday Less Than" onclick={handleGetBirthdayLessThan}
                                     disabled={isFetching} type="button"/>
                        <Input
                            margin="dense"
                            type='text'
                            fullWidth
                            id="birthdayDate"
                            name="birthdayDate"
                            autoComplete="birthdayDate"
                            autoFocus
                            value={birthdayDate}
                            onChange={(e) => setBirthdayDate(e.target.value)}
                            sx={{color: 'white', mb: 1}}
                            // inputProps={{min: 0}}
                            placeholder='Birthday Date (format: dd.mm.yyyy)'
                        />
                        <TableContainer className='main__table-container' sx={{maxWidth: '100%', overflowX: 'auto'}}>
                            <Table className="main__table" aria-label="data table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Coordinates ID</TableCell>
                                        <TableCell>Creation Date</TableCell>
                                        <TableCell>Eye Color</TableCell>
                                        <TableCell>Hair Color</TableCell>
                                        <TableCell>Location ID</TableCell>
                                        <TableCell>Height</TableCell>
                                        <TableCell>Birthday</TableCell>
                                        <TableCell>Nationality</TableCell>
                                        <TableCell>Admin Can Modify</TableCell>
                                        <TableCell>User ID</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {birthdayDateResult.map((person: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{String(person.id)}</TableCell>
                                            <TableCell>{String(person.name)}</TableCell>
                                            <TableCell>{String(person.coordinates.id)}</TableCell>
                                            <TableCell>{String(person.creationDate)}</TableCell>
                                            <TableCell>{String(person.eyeColor)}</TableCell>
                                            <TableCell>{String(person.hairColor)}</TableCell>
                                            <TableCell>{String(person.location.id)}</TableCell>
                                            <TableCell>{String(person.height)}</TableCell>
                                            <TableCell>{String(person.birthday)}</TableCell>
                                            <TableCell>{String(person.nationality)}</TableCell>
                                            <TableCell>{String(person.adminCanModify)}</TableCell>
                                            <TableCell>{String(person.userId)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {/*<TextField*/}
                        {/*    margin="dense"*/}
                        {/*    type='text'*/}
                        {/*    variant='outlined'*/}
                        {/*    fullWidth*/}
                        {/*    id="birthdayDate"*/}
                        {/*    name="birthdayDate"*/}
                        {/*    autoComplete="birthdayDate"*/}
                        {/*    autoFocus*/}
                        {/*    maxRows={4}*/}
                        {/*    // defaultValue={birthdayDateResult}*/}
                        {/*    value={birthdayDateResult}*/}
                        {/*    color='primary'*/}
                        {/*    sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}*/}
                        {/*    slotProps={{*/}
                        {/*       input: {*/}
                        {/*          readOnly: true,*/}
                        {/*       },*/}
                        {/*    }}*/}
                        {/*/>*/}
                    </Grid>

                    <Grid item sx={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                        borderWidth: '2px', borderColor: 'white', borderStyle: 'solid', margin: '30px', padding: '10px'
                    }}>
                        <StyleButton text="Get Persons With Names Starts With" onclick={handleGetNameStartsWith}
                                     disabled={isFetching} type="button"/>
                        <Input
                            margin="dense"
                            type='text'
                            fullWidth
                            id="nameSubstring"
                            name="nameSubstring"
                            autoComplete="nameSubstring"
                            autoFocus
                            value={nameSubstring}
                            onChange={(e) => setNameSubstring(e.target.value)}
                            sx={{color: 'white', mb: 1}}
                            inputProps={{min: 0}}
                            placeholder='Name substring'
                        />
                        <TableContainer className='main__table-container' sx={{maxWidth: '100%', overflowX: 'auto'}}>
                            <Table className="main__table" aria-label="data table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Coordinates ID</TableCell>
                                        <TableCell>Creation Date</TableCell>
                                        <TableCell>Eye Color</TableCell>
                                        <TableCell>Hair Color</TableCell>
                                        <TableCell>Location ID</TableCell>
                                        <TableCell>Height</TableCell>
                                        <TableCell>Birthday</TableCell>
                                        <TableCell>Nationality</TableCell>
                                        <TableCell>Admin Can Modify</TableCell>
                                        <TableCell>User ID</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {nameSubstringResult.map((person: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{String(person.id)}</TableCell>
                                            <TableCell>{String(person.name)}</TableCell>
                                            <TableCell>{String(person.coordinates.id)}</TableCell>
                                            <TableCell>{String(person.creationDate)}</TableCell>
                                            <TableCell>{String(person.eyeColor)}</TableCell>
                                            <TableCell>{String(person.hairColor)}</TableCell>
                                            <TableCell>{String(person.location.id)}</TableCell>
                                            <TableCell>{String(person.height)}</TableCell>
                                            <TableCell>{String(person.birthday)}</TableCell>
                                            <TableCell>{String(person.nationality)}</TableCell>
                                            <TableCell>{String(person.adminCanModify)}</TableCell>
                                            <TableCell>{String(person.userId)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {/*<TextField*/}
                        {/*   margin="dense"*/}
                        {/*   type='text'*/}
                        {/*   variant='outlined'*/}
                        {/*   fullWidth*/}
                        {/*   id="nameSubstring"*/}
                        {/*   name="nameSubstring"*/}
                        {/*   autoComplete="nameSubstring"*/}
                        {/*   autoFocus*/}
                        {/*   maxRows={4}*/}
                        {/*   // defaultValue={nameSubstringResult}*/}
                        {/*   value={nameSubstringResult}*/}
                        {/*   color='primary'*/}
                        {/*   sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}*/}
                        {/*   slotProps={{*/}
                        {/*      input: {*/}
                        {/*         readOnly: true,*/}
                        {/*      },*/}
                        {/*   }}*/}
                        {/*/>*/}
                    </Grid>

                </Grid>

                <Grid container sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row'
                }}>
                    <Grid item sx={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                        borderWidth: '2px', borderColor: 'white', borderStyle: 'solid', margin: '30px', padding: '10px'
                    }}>
                        <StyleButton text="Remove Persons By Height" onclick={handleRemovePersonsByHeight}
                                     disabled={isFetching} type="button"/>
                        <Input
                            margin="dense"
                            type='number'
                            fullWidth
                            id="height"
                            name="height"
                            autoComplete="height"
                            autoFocus
                            value={removePersonsByHeight}
                            onChange={(e) => setRemovePersonsByHeight(e.target.value)}
                            sx={{color: 'white', mb: 1}}
                            inputProps={{min: 0}}
                            placeholder='Height'
                        />
                        <TextField
                            margin="dense"
                            type='text'
                            variant='outlined'
                            fullWidth
                            id="height"
                            name="height"
                            autoComplete="height"
                            autoFocus
                            // defaultValue={removePersonsByHeightResult}
                            value={removePersonsByHeightResult}
                            color='primary'
                            sx={{color: 'white', mb: 1, WebkitTextFillColor: 'white'}}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                },
                            }}
                        />
                    </Grid>

                </Grid>
            </Grid>
        </Box>


        <Snackbar open={openError} autoHideDuration={3000} onClose={() => setOpenError(false)}>
            <Alert severity="error" sx={{fontFamily: "Undertale"}}>
                {/*{errorMessage}*/}
                {typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage}
            </Alert>
        </Snackbar>
    </>)
}


