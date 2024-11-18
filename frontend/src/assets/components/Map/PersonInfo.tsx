import React, {useEffect, useState} from 'react';
import {
    Box,
    TextField,
    Modal,
    Checkbox,
} from '@mui/material';

import {appSelector} from "../../../storage/Slices/AppSlice";
import {useDispatch, useSelector} from 'react-redux';

import {AppDispatch} from '../../../storage/store';
import {Color, Nationality} from '../Person/PersonTable';


interface CoordinateFormProps {
    open: boolean;
    onClose: () => void;
}

interface FormData {
    id: number;
    name: string;
    coordinatesId: string;
    eyeColor: Color | null;
    hairColor: Color | null;
    locationId: string;
    height: string;
    birthday: Date;
    // birthday: string;
    nationality: Nationality | null;
    adminCanModify: boolean;
}

const colors = [{value: "GREEN", label: "Green"}, {value: "RED", label: "Red"}, {
    value: "ORANGE",
    label: "Orange"
}, {value: "", label: "NULL"}];

const nationalities = [{value: "RUSSIA", label: "Russia"}, {value: "CHINA", label: "China"}, {
    value: "THAILAND",
    label: "Thailand"
}, {value: "SOUTH_KOREA", label: "South Korea"}, {value: "NORTH_KOREA", label: "North Korea"}, {
    value: "",
    label: "NULL"
}];

const PersonInfoForm: React.FC<CoordinateFormProps> = ({open, onClose}) => {
    const dispatch = useDispatch<AppDispatch>();
    const {person} = useSelector(appSelector);
    const [formData, setFormData] = useState<FormData>({
        id: 0,
        name: '',
        coordinatesId: '',
        eyeColor: '' as Color,
        hairColor: '' as Color,
        locationId: '',
        height: '',
        birthday: '' as Date,
        // birthday: '',
        nationality: '' as Nationality,
        adminCanModify: false
    });


    useEffect(() => {
        formData.id = person === null ? 0 : person.id;
        formData.name = person === null ? '' : person.name;
        formData.coordinatesId = person === null ? '' : String(person.coordinates.id);
        formData.eyeColor = person === null || person.eyeColor === null ? '' as Color : person.eyeColor;
        formData.hairColor = person === null || person.hairColor === null ? '' as Color : person.hairColor;
        formData.locationId = person === null ? '' : String(person.location.id);
        formData.height = person === null ? '' : person.height.toString();
        formData.birthday = person === null ? '' : person.birthday.toString();
        formData.nationality = person === null || person.nationality === null ? '' as Nationality : person.nationality;
        formData.adminCanModify = person === null ? false : person.adminCanModify;
    }, [dispatch, person]);


    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="person-form-modal"
                aria-describedby="person-form-description"
                sx={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}
            >
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
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        border: '2px solid #000',
                        p: 4,
                        borderColor: 'white',
                        borderWidth: '6px',
                        borderStyle: 'solid',
                    }}

                >
                    <TextField
                        margin="dense"
                        type='text'
                        required
                        fullWidth
                        id="name"
                        name="name"
                        autoComplete="name"
                        autoFocus
                        label="Name"
                        variant='standard'
                        value={formData.name}
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                        sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}
                        placeholder='Name (Not NULL)'
                    />
                    <TextField
                        margin="dense"
                        type='text'
                        variant='standard'
                        fullWidth
                        id="coordinatesId"
                        name="coordinatesId"
                        autoComplete="coordinatesId"
                        autoFocus
                        label="Coordinates ID"
                        defaultValue={""}
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                        value={formData.coordinatesId}
                        color='primary'
                        sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}
                    />
                    <TextField
                        margin="dense"
                        type='text'
                        required
                        fullWidth
                        id="eyeColor"
                        name="eyeColor"
                        autoComplete="eyeColor"
                        autoFocus
                        label="Eye Color"
                        variant='standard'
                        value={formData.eyeColor}
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                        sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}
                        placeholder='Eye Color'
                    />
                    <TextField
                        margin="dense"
                        type='text'
                        required
                        fullWidth
                        id="hairColor"
                        name="hairColor"
                        autoComplete="hairColor"
                        autoFocus
                        label="Hair Color"
                        variant='standard'
                        value={formData.hairColor}
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                        sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}
                        placeholder='Hair Color'
                    />
                    <TextField
                        margin="dense"
                        type='text'
                        variant='standard'
                        fullWidth
                        id="locationId"
                        name="locationId"
                        autoComplete="locationId"
                        autoFocus
                        label="Location ID"
                        defaultValue={""}
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                        value={formData.locationId}
                        color='primary'
                        sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}
                    />
                    <TextField
                        margin="dense"
                        type='text'
                        required
                        fullWidth
                        id="height"
                        name="height"
                        autoComplete="height"
                        autoFocus
                        label="Height"
                        variant='standard'
                        value={formData.height}
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                        sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}
                        placeholder='Height'
                    />
                    <TextField
                        margin="dense"
                        type='text'
                        required
                        fullWidth
                        id="birthday"
                        name="birthday"
                        autoComplete="birthday"
                        autoFocus
                        label="Birthday"
                        variant='standard'
                        value={formData.birthday}
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                        sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}
                        placeholder='Birthday'
                    />
                    <TextField
                        margin="dense"
                        type='text'
                        required
                        fullWidth
                        id="nationality"
                        name="nationality"
                        autoComplete="nationality"
                        autoFocus
                        label="Nationality"
                        variant='standard'
                        value={formData.nationality}
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                        sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}
                        placeholder='Nationality'
                    />
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Checkbox
                            required
                            id="adminCanModify"
                            name="adminCanModify"
                            autoFocus
                            checked={formData.adminCanModify}

                            sx={{color: 'white', mb: 1, WebkitTextFillColor: 'white'}}
                        />
                        <label style={{
                            fontFamily: "Undertale",
                            backgroundColor: 'black',
                            color: 'white'
                        }}>
                            ADMIN CAN MODIFY
                        </label>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default PersonInfoForm;