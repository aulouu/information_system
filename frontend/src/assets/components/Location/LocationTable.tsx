import {Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {
    appSelector,
    getLocation,
    ILocation,
    sendDeleteLocation,
    setLocationPage,
    setUpdatedLocation
} from "../../../storage/Slices/AppSlice";
import {AppDispatch} from '../../../storage/store';
import {useState} from 'react';
import StyleButton from '../StyleButton';
import LocationForm from './LocationForm';
import LocationUpdateForm from './LocationUpdateForm';

interface Location {
    id: number;
    name: string;
    x: number;
    y: number;
    z: number;
    adminCanModify: boolean;
    userName: string;
};

export type LocationsArray = Location[];

export default function LocationsTable() {
    const dispatch = useDispatch<AppDispatch>();
    const {locations, isFetching, locationPage, isAuth} = useSelector(appSelector);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [filters, setFilters] = useState<{ [key: string]: string }>({});
    const [activeColumn, setActiveColumn] = useState<string | null>(null);

    const handleOpenCreate = () => {
        if (openUpdate === false) {
            setOpenCreate(true);
        }
    };

    const handleOpenUpdate = (location: ILocation | null) => {
        if (openCreate === false) {
            dispatch(setUpdatedLocation(location));
            const timer = setTimeout(() => {
                setOpenUpdate(true);
            }, 50);
        }
    };

    const handleCloseCreate = () => setOpenCreate(false);

    const handleCloseUpdate = () => setOpenUpdate(false);

    const handleDelete = (location: ILocation) => {
        const timer = setTimeout(() => {
            dispatch(sendDeleteLocation({id: location.id}));
        }, 50);

    };

    const handleColumnClick = (columnName: string) => {
        setActiveColumn(activeColumn === columnName ? null : columnName);
        if (activeColumn === columnName) {
            const newFilters = {...filters};
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
        if (!locations) return [];
        return locations.filter(person => {
            return Object.entries(filters).every(([column, filterValue]) => {
                if (!filterValue) return true;
                const personValue = String(person[column as keyof Location] || '').toLowerCase();
                return personValue.includes(filterValue.toLowerCase());
            });
        });
    };

    const renderTableHeader = (columnName: string, label: string) => (
        <TableCell
            onClick={() => handleColumnClick(columnName)}
            style={{cursor: 'pointer', position: 'relative'}}
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
    return (
        <>
            {isAuth && <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflowX: 'hidden',
                flexDirection: 'column'
            }}>
                <div>
                    <StyleButton text="Create location" onclick={handleOpenCreate} disabled={isFetching}
                                 type="button"/>
                    <LocationForm open={openCreate} onClose={handleCloseCreate}/>
                </div>
                <TableContainer className='main__table-container'>
                    <Table className="main__table" aria-label="data table"
                           sx={{maxWidth: '100%', overflowX: 'auto'}}>
                        <TableHead>
                            <TableRow>
                                {renderTableHeader('id', 'ID')}
                                {renderTableHeader('name', 'Name')}
                                {renderTableHeader('x', 'X')}
                                {renderTableHeader('y', 'Y')}
                                {renderTableHeader('z', 'Z')}
                                {renderTableHeader('adminCanModify', 'Admin Can Modify')}
                                {renderTableHeader('user', 'User')}
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        {locations !== undefined && locations.length > 0 &&
                            <TableBody>
                                {filteredPersons.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{String(row.id)}</TableCell>
                                        <TableCell>{String(row.name)}</TableCell>
                                        <TableCell>{String(row.x)}</TableCell>
                                        <TableCell>{String(row.y)}</TableCell>
                                        <TableCell>{String(row.z)}</TableCell>
                                        <TableCell>{String(row.adminCanModify)}</TableCell>
                                        <TableCell>{String(row.userName)}</TableCell>
                                        <TableCell>
                                            <div>
                                                <StyleButton text="Update" onclick={(e) => handleOpenUpdate(row)}
                                                             disabled={isFetching} type="button"/>
                                                <LocationUpdateForm open={openUpdate} onClose={handleCloseUpdate}/>
                                            </div>
                                        </TableCell>
                                        <TableCell><StyleButton text="Delete" onclick={(e) => handleDelete(row)}
                                                                disabled={isFetching} type="button"/></TableCell>
                                    </TableRow>
                                )).reverse()}
                            </TableBody>
                        }
                    </Table>
                </TableContainer>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>

                    <StyleButton text="Previous Page"
                                 disabled={isFetching || locationPage === 0}
                                 type="button"
                                 onclick={() => {
                                     if (locationPage > 0) {
                                         dispatch(setLocationPage(locationPage - 1));
                                         dispatch(getLocation(locationPage - 1))
                                     }
                                 }}/>
                    <label style={{
                        fontFamily: "Undertale",
                        backgroundColor: '#855666',
                        color: '#332127'
                    }}>
                        {locationPage}
                    </label>
                    <StyleButton text="Next Page"
                                 disabled={isFetching}
                                 type="button"
                                 onclick={() => {
                                     dispatch(setLocationPage(locationPage + 1));
                                     dispatch(getLocation(locationPage + 1))
                                 }}/>
                </Box>
            </Box> }
        </>
    );
}


