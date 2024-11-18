import { TableBody, TableCell, TableContainer, TableHead, TableRow, Table, Box, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { appSelector, getPerson, IPerson, sendDeletePerson, setPersonPage, setUpdatedPerson } from "../../../storage/Slices/AppSlice";
import { AppDispatch } from '../../../storage/store';
import {useEffect, useState} from 'react';
import StyleButton from '../StyleButton';
import PersonForm from './PersonForm';
import PersonUpdateForm from './PersonUpdateForm';

export enum Color {
    GREEN = "GREEN",
    BLUE = "RED",
    WHITE = "ORANGE",
    NULL_COLOR = ""
}

export enum Nationality {
    RUSSIA = "RUSSIA",
    CHINA = "CHINA",
    THAILAND = "THAILAND",
    SOUTH_KOREA = "SOUTH_KOREA",
    NORTH_KOREA = "NORTH_KOREA",
    NULL_COUNTRY = ""
}

interface Person {
    id: number;
    name: string;
    coordinatesId: number;
    creationDate: string;
    eyeColor: Color;
    hairColor: Color;
    locationId: number;
    height: number;
    birthday: Date;
    nationality: Nationality;
    adminCanModify: boolean;
    userId: number;
};

export type PersonArray = Person[];

export default function PersonTable() {
    const dispatch = useDispatch<AppDispatch>();
    const { persons, isFetching, personPage } = useSelector(appSelector);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [filters, setFilters] = useState<{[key: string]: string}>({});
    const [activeColumn, setActiveColumn] = useState<string | null>(null);

    const handleOpenCreate = () => {
        if (openUpdate === false) {
            setOpenCreate(true);
        }
    };

    const handleOpenUpdate = (person: IPerson | null) => {
        if (openCreate === false) {
            dispatch(setUpdatedPerson(person));
            const timer = setTimeout(() => {
                setOpenUpdate(true);
            }, 100);
        }
    };

    const handleCloseCreate = () => setOpenCreate(false);

    const handleCloseUpdate = () => setOpenUpdate(false);

    const handleDelete = (person: IPerson) => {
        const timer = setTimeout(() => {
            dispatch(sendDeletePerson({ id: person.id }));
        }, 50);

    };

    const handleColumnClick = (columnName: string) => {
        setActiveColumn(activeColumn === columnName ? null : columnName);
        if (activeColumn === columnName) {
            const newFilters = { ...filters };
            delete newFilters[columnName];
            setFilters(newFilters);
        }
    };

    const handleFilterChange = (columnName: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [columnName]: value
        }));
    };

    const getFilteredPersons = () => {
        if (!persons) return [];
        return persons.filter(person => {
            return Object.entries(filters).every(([column, filterValue]) => {
                if (!filterValue) return true;
                const personValue = String(person[column as keyof Person] || '').toLowerCase();
                return personValue.includes(filterValue.toLowerCase());
            });
        });
    };

    const renderTableHeader = (columnName: string, label: string) => (
        <TableCell 
            onClick={() => handleColumnClick(columnName)}
            style={{ cursor: 'pointer', position: 'relative' }}
        >
            {label}
            {activeColumn === columnName && (
                <TextField
                    size="small"
                    value={filters[columnName] || ''}
                    onChange={(e) => handleFilterChange(columnName, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 1000,
                        backgroundColor: 'white',
                        width: '100%'
                    }}
                />
            )}
        </TableCell>
    );

    const filteredPersons = getFilteredPersons();

    if (persons !== undefined && persons.length > 0) {
        return (
            <>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'hidden', flexDirection: 'column' }}>
                    <div>
                        <StyleButton text="Create person" onclick={handleOpenCreate} disabled={isFetching} type="button" />
                        <PersonForm open={openCreate} onClose={handleCloseCreate} />
                    </div>
                    <TableContainer className='main__table-container' >
                        <Table className="main__table" aria-label="data table" sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                            <TableHead>
                                <TableRow>
                                    {renderTableHeader('id', 'ID')}
                                    {renderTableHeader('name', 'Name')}
                                    {renderTableHeader('coordinatesId', 'Coordinates ID')}
                                    {renderTableHeader('creationDate', 'Creation Date')}
                                    {renderTableHeader('eyeColor', 'Eye Color')}
                                    {renderTableHeader('hairColor', 'Hair Color')}
                                    {renderTableHeader('locationId', 'Location ID')}
                                    {renderTableHeader('height', 'Height')}
                                    {renderTableHeader('birthday', 'Birthday')}
                                    {renderTableHeader('nationality', 'Nationality')}
                                    {renderTableHeader('adminCanModify', 'Admin Can Modify')}
                                    {renderTableHeader('userId', 'User ID')}
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPersons.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{String(row.id)}</TableCell>
                                        <TableCell>{String(row.name)}</TableCell>
                                        <TableCell>{String(row.coordinates.id)}</TableCell>
                                        <TableCell>{String(row.creationDate)}</TableCell>
                                        <TableCell>{String(row.eyeColor)}</TableCell>
                                        <TableCell>{String(row.hairColor)}</TableCell>
                                        <TableCell>{String(row.location.id)}</TableCell>
                                        <TableCell>{String(row.height)}</TableCell>
                                        <TableCell>{String(row.birthday)}</TableCell>
                                        <TableCell>{String(row.nationality)}</TableCell>
                                        <TableCell>{String(row.adminCanModify)}</TableCell>
                                        <TableCell>{String(row.userId)}</TableCell>
                                        <TableCell><div>
                                            <StyleButton text="Update" onclick={(e) => handleOpenUpdate(row)} disabled={isFetching} type="button" />
                                            <PersonUpdateForm open={openUpdate} onClose={handleCloseUpdate} />
                                        </div></TableCell>
                                        <TableCell><StyleButton text="Delete" onclick={(e) => handleDelete(row)} disabled={isFetching} type="button" /></TableCell>
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
                            disabled={isFetching || personPage === 0}
                            type="button"
                            onclick={() => { if (personPage > 0) { dispatch(setPersonPage(personPage - 1)); dispatch(getPerson(personPage - 1)) } }} />
                        <label style={{
                            fontFamily: "Undertale",
                            backgroundColor: '#855666',
                            color: '#332127'
                        }}>
                            {personPage}
                        </label>
                        <StyleButton text="Next Page"
                            disabled={isFetching}
                            type="button"
                            onclick={() => { dispatch(setPersonPage(personPage + 1)); dispatch(getPerson(personPage + 1)) }} />
                    </Box>
                </Box>
            </>

        );
    } else {
        return (
            <>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'hidden', flexDirection: 'column' }}>
                    <div>
                        <StyleButton text="Create person" onclick={handleOpenCreate} disabled={isFetching} type="button" />
                        <PersonForm open={openCreate} onClose={handleCloseCreate} />
                    </div>
                    <TableContainer className='main__table-container' sx={{ maxWidth: '100%', overflowX: 'auto' }}>
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
                                    <TableCell>Country</TableCell>
                                    <TableCell>Admin Can Modify</TableCell>
                                    <TableCell>User ID</TableCell>
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
                            disabled={isFetching || personPage === 0}
                            type="button"
                            onclick={() => { if (personPage > 0) { dispatch(setPersonPage(personPage - 1)); dispatch(getPerson(personPage - 1)) } }} />
                        <label style={{
                            fontFamily: "Undertale",
                            backgroundColor: '#855666',
                            color: '#332127'
                        }}>
                            {personPage}
                        </label>
                        <StyleButton text="Next Page"
                            disabled={isFetching}
                            type="button"
                            onclick={() => { dispatch(setPersonPage(personPage + 1)); dispatch(getPerson(personPage + 1)) }} />
                    </Box>
                </Box>
            </>
        );
    }
}


