import { TableBody, TableCell, TableContainer, TableHead, TableRow, Table, Box, TextField } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { appSelector, getCoordinates, ICoordinate, sendDeleteCoordinates, setCoordinatesPage, setUpdatedCoordinate } from "../../../storage/Slices/AppSlice";
import React, { useState, useEffect } from 'react';
import { AppDispatch } from '../../../storage/store';
import StyleButton from '../StyleButton';
import CoordinateForm from './CoordinateForm';
import CoordinateUpdateForm from './CoordinateUpdateForm';


interface Coordinate {
    id: number;
    x: number;
    y: number;
    adminCanModify: boolean;
    userId: number;
};

export type CoordinatesArray = Coordinate[];


export default function CoordinatesTable() {
    const dispatch = useDispatch<AppDispatch>();

    const { coordinates, isFetching, coordinatesPage } = useSelector(appSelector);

    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [filters, setFilters] = useState<{ [key: string]: string }>({});
    const [activeColumn, setActiveColumn] = useState<string | null>(null);

    const handleOpenCreate = () => {
        if (openUpdate === false) {
            setOpenCreate(true);
        }
    };

    const handleOpenUpdate = (coordinate: ICoordinate | null) => {
        if (openCreate === false) {
            dispatch(setUpdatedCoordinate(coordinate));
            const timer = setTimeout(() => {
                setOpenUpdate(true);
            }, 50);
        }
    };

    const handleCloseCreate = () => setOpenCreate(false);

    const handleCloseUpdate = () => setOpenUpdate(false);

    const handleDelete = (coordinate: ICoordinate) => {
        const timer = setTimeout(() => {
            dispatch(sendDeleteCoordinates({ id: coordinate.id }));
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
        if (!coordinates) return [];
        return coordinates.filter(person => {
            return Object.entries(filters).every(([column, filterValue]) => {
                if (!filterValue) return true;
                const personValue = String(person[column as keyof Coordinate] || '').toLowerCase();
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



    if (coordinates !== undefined && coordinates.length > 0) {
        return (
            <>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'hidden', flexDirection: 'column' }}>
                    <div>
                        <StyleButton text="Create coordinate" onclick={handleOpenCreate} disabled={isFetching} type="button" />
                        <CoordinateForm open={openCreate} onClose={handleCloseCreate} />
                    </div>
                    <TableContainer className='main__table-container' >
                        <Table className="main__table" aria-label="data table" sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                            <TableHead>
                                <TableRow>
                                    {renderTableHeader('id', 'ID')}
                                    {renderTableHeader('x', 'X')}
                                    {renderTableHeader('y', 'Y')}
                                    {renderTableHeader('adminCanModify', 'Admin Can Modify')}
                                    {renderTableHeader('userId', 'User ID')}
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredPersons.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>{row.x}</TableCell>
                                        <TableCell>{row.y}</TableCell>
                                        <TableCell>{String(row.adminCanModify)}</TableCell>
                                        <TableCell>{row.userId}</TableCell>
                                        <TableCell><div>
                                            <StyleButton text="Update" onclick={(e) => handleOpenUpdate(row)} disabled={isFetching} type="button" />
                                            <CoordinateUpdateForm open={openUpdate} onClose={handleCloseUpdate} />
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
                            disabled={isFetching || coordinatesPage === 0}
                            type="button"
                            onclick={() => { if (coordinatesPage > 0) { dispatch(setCoordinatesPage(coordinatesPage - 1)); dispatch(getCoordinates(coordinatesPage - 1)) } }} />
                        <label style={{
                            fontFamily: "Undertale",
                            backgroundColor: '#855666',
                            color: '#332127'
                        }}>
                            {coordinatesPage}
                        </label>
                        <StyleButton text="Next Page"
                            disabled={isFetching}
                            type="button"
                            onclick={() => { dispatch(setCoordinatesPage(coordinatesPage + 1)); dispatch(getCoordinates(coordinatesPage + 1)) }} />
                    </Box>
                </Box>
            </>



        );
    } else {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', overflowX: 'hidden', flexDirection: 'column' }}>
                <div>
                    <StyleButton text="Create coordinate" onclick={handleOpenCreate} disabled={isFetching} type="button" />
                    <CoordinateForm open={openCreate} onClose={handleCloseCreate} />
                </div>
                <TableContainer className='main__table-container' sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                    <Table className="main__table" aria-label="data table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>Y</TableCell>
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
                        disabled={isFetching || coordinatesPage === 0}
                        type="button"
                        onclick={() => { if (coordinatesPage > 0) { dispatch(setCoordinatesPage(coordinatesPage - 1)); dispatch(getCoordinates(coordinatesPage - 1)) } }} />
                    <label style={{
                        fontFamily: "Undertale",
                        backgroundColor: '#855666',
                        color: '#332127'
                    }}>
                        {coordinatesPage}
                    </label>
                    <StyleButton text="Next Page"
                        disabled={isFetching}
                        type="button"
                        onclick={() => { dispatch(setCoordinatesPage(coordinatesPage + 1)); dispatch(getCoordinates(coordinatesPage + 1)) }} />
                </Box>
            </Box>
        );
    }
}


