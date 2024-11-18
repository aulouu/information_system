import React, { useEffect, useState } from 'react';
import {
   Box,
   Input,
   Modal,
   Snackbar,
   Alert,
   Checkbox,
   TextField,
   MenuItem
} from '@mui/material';
import { appSelector, clearState, sendUpdatedPerson } from "../../../storage/Slices/AppSlice";
import { useDispatch, useSelector } from 'react-redux';
import { IUpdatePerson } from "../../../storage/Slices/AppSlice";
import StyleButton from '../StyleButton';
import { AppDispatch } from '../../../storage/store';
import { Color, Nationality } from './PersonTable';


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

// const colors = [{ value: "GREEN", label: "Green" }, { value: "RED", label: "Red" }, { value: "ORANGE", label: "Orange" }];
const colors = [{ value: "GREEN", label: "Green" }, { value: "RED", label: "Red" }, { value: "ORANGE", label: "Orange" }, { value: "", label: "NULL" }];
// const nationalities = [{ value: "RUSSIA", label: "Russia" }, { value: "CHINA", label: "China" }, { value: "THAILAND", label: "Thailand" }, { value: "SOUTH_KOREA", label: "South Korea" }, { value: "NORTH_KOREA", label: "North Korea" }];
const nationalities = [{ value: "RUSSIA", label: "Russia" }, { value: "CHINA", label: "China" }, { value: "THAILAND", label: "Thailand" }, { value: "SOUTH_KOREA", label: "South Korea" }, { value: "NORTH_KOREA", label: "North Korea" }, { value: "", label: "NULL" }];

const PersonUpdateForm: React.FC<CoordinateFormProps> = ({ open, onClose }) => {
   const dispatch = useDispatch<AppDispatch>();
   const { isFetching, isSuccess, isError, errorMessage, coordinates, locations, person } = useSelector(appSelector);
   const [openError, setOpenError] = useState<boolean>(false);
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

   const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const newData = {
         id: person?.id,
         name: formData.name === '' ? null : formData.name,
         coordinatesId: formData.coordinatesId === '' ? null : Number(formData.coordinatesId),
         eyeColor: formData.eyeColor === '' ? null : formData.eyeColor,
         hairColor: formData.hairColor === '' ? null : formData.hairColor,
         locationId: formData.locationId === '' ? null : Number(formData.locationId),
         height: formData.height === '' ? null : Number(formData.height),
         birthday: formData.birthday === '' ? null : new Date(formData.birthday),
         nationality: formData.nationality === '' ? null : formData.nationality,
         adminCanModify: formData.adminCanModify
      };
      dispatch(sendUpdatedPerson(newData as IUpdatePerson));
   };

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (name === 'adminCanModify') {
         setFormData((prevState) => ({
            ...prevState,
            [name]: e.target.checked,
         }));
      }
      else {
         setFormData((prevState) => ({
            ...prevState,
            [name]: value
         }));
      }
   };

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
         console.log("Person Succesfully Location");
         onClose();
         dispatch(clearState());
      }
   }, [isError, isSuccess, dispatch, person]);

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
               onSubmit={handleFormSubmit}

            >

               <Input
                   margin="dense"
                   type='text'
                   required
                   fullWidth
                   id="name"
                   name="name"
                   autoComplete="name"
                   autoFocus
                   value={formData.name}
                   onChange={handleChange}
                   sx={{ color: 'white', mb: 1 }}
                   placeholder='Name (Not NULL)'
               />

               <TextField
                   margin="dense"
                   type='text'
                   select
                   variant='standard'
                   required
                   fullWidth
                   id="coordinatesId"
                   name="coordinatesId"
                   autoComplete="coordinatesId"
                   autoFocus
                   label="Coordinates ID"
                   defaultValue={""}
                   value={formData.coordinatesId}
                   onChange={handleChange}
                   color='primary'
                   sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}
               >{coordinates !== undefined ? coordinates.map((option) => (
                   <MenuItem key={option.id} value={option.id}>
                      {option.id}
                   </MenuItem>)) : ''}
               </TextField>

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
                  defaultValue={""}
                  value={formData.eyeColor}
                  onChange={handleChange}
                  color='primary'
                  sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}
               >{colors.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                     {option.label}
                  </MenuItem>
               ))}</TextField>

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
                  defaultValue={""}
                  value={formData.hairColor}
                  onChange={handleChange}
                  color='primary'
                  sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}
               >{colors.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                     {option.label}
                  </MenuItem>
               ))}
               </TextField>

               <TextField
                   margin="dense"
                   type='text'
                   select
                   variant='standard'
                   required
                   fullWidth
                   id="locationId"
                   name="locationId"
                   autoComplete="locationId"
                   autoFocus
                   label="Location ID"
                   defaultValue={""}
                   value={formData.locationId}
                   onChange={handleChange}
                   color='primary'
                   sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}
               >{locations !== undefined ? locations.map((option) => (
                   <MenuItem key={option.id} value={option.id}>
                      {option.id}
                   </MenuItem>)) : ''}
               </TextField>

               <Input
                   margin="dense"
                   type='number'
                   required
                   fullWidth
                   id="height"
                   name="height"
                   autoComplete="height"
                   autoFocus
                   value={formData.height}
                   onChange={handleChange}
                   sx={{ color: 'white', mb: 1 }}
                   inputProps={{ min: 0 }}
                   placeholder='Height (Positive)'
               />

               <Input
                   margin="dense"
                   type='date'
                   required
                   fullWidth
                   id="birthday"
                   name="birthday"
                   autoComplete="birthday"
                   autoFocus
                   value={formData.birthday}
                   onChange={handleChange}
                   sx={{ color: 'white', mb: 1 }}
                   inputProps={{ min: '1900-01-01' }}
                   placeholder='Birthday'
               />

               <TextField
                  margin="dense"
                  type='text'
                  select
                  variant='standard'
                  required
                  fullWidth
                  id="nationality"
                  name="nationality"
                  autoComplete="nationality"
                  autoFocus
                  label="Nationality"
                  defaultValue={""}
                  value={formData.nationality}
                  onChange={handleChange}
                  color='primary'
                  sx={{ color: 'white', mb: 1, WebkitTextFillColor: 'white' }}
               >{nationalities.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                     {option.label}
                  </MenuItem>
               ))}</TextField>

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
                     onChange={handleChange}
                     sx={{ color: 'white', mb: 1 }}
                  />
                  <label style={{
                     fontFamily: "Undertale",
                     color: 'white'
                  }}>
                     ADMIN CAN MODIFY
                  </label>
               </Box>


               <StyleButton text="Create Person"
                  disabled={isFetching}
                  type="submit" />
            </Box>
         </Modal>
         <Snackbar open={openError} autoHideDuration={3000} onClose={() => setOpenError(false)}>
            <Alert severity="error" sx={{ fontFamily: "Undertale" }}>
               {errorMessage}
            </Alert>
         </Snackbar>
      </>
   );
};

export default PersonUpdateForm;