import {
    Box,
    SortDirection,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField
} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {
    appSelector,
    getPerson,
    IPerson,
    sendDeletePerson,
    setPersonPage,
    setUpdatedPerson
} from "../../../storage/Slices/AppSlice";
import {AppDispatch} from '../../../storage/store';
import {useState} from 'react';
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
    userName: string;
};

export type PersonArray = Person[];

export default function PersonTable() {
    const dispatch = useDispatch<AppDispatch>();
    const {persons, isFetching, personPage, isAuth} = useSelector(appSelector);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [filters, setFilters] = useState<{ [key: string]: string }>({});
    const [activeColumn, setActiveColumn] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ field: keyof Person | null; direction: SortDirection }>({
        field: null,
        direction: null
    });

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
            dispatch(sendDeletePerson({id: person.id}));
        }, 50);

    };

    const handleColumnClick = (columnName: string) => {
        setActiveColumn(activeColumn === columnName ? null : columnName);
        if (activeColumn === columnName) {
            const newFilters = {...filters};
            delete newFilters[columnName];
            setFilters(newFilters);
            return;
        }
        if (!filters[columnName]) {
            const isAsc = sortConfig.field === columnName && sortConfig.direction === 'asc';
            const nextDirection: SortDirection = !sortConfig.direction ? 'asc' : isAsc ? 'desc' : null;
            setSortConfig({
                field: nextDirection ? columnName as keyof Person : null,
                direction: nextDirection
            });
        }
    };

    const handleFilterChange = (columnName: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [columnName]: value
        }));
    };

    const getSortedAndFilteredPersons = () => {
        if (!persons) return [];
        let result = persons.filter(person => {
            return Object.entries(filters).every(([column, filterValue]) => {
                if (!filterValue) return true;
                const personValue = String(person[column as keyof Person] || '').toLowerCase();
                return personValue.includes(filterValue.toLowerCase());
            });
        });
        if (sortConfig.field && sortConfig.direction) {
            result = [...result].sort((a, b) => {
                const aValue = a[sortConfig.field!];
                const bValue = b[sortConfig.field!];
                if (typeof aValue === 'boolean') {
                    return sortConfig.direction === 'asc'
                        ? (aValue === bValue ? 0 : aValue ? 1 : -1)
                        : (aValue === bValue ? 0 : aValue ? -1 : 1);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'asc'
                        ? aValue - bValue
                        : bValue - aValue;
                }
                const strA = String(aValue).toLowerCase();
                const strB = String(bValue).toLowerCase();
                return sortConfig.direction === 'asc'
                    ? strA.localeCompare(strB)
                    : strB.localeCompare(strA);
            });
        }
        return result;
    };

    const renderTableHeader = (columnName: string, label: string) => (
        <TableCell
            onClick={() => handleColumnClick(columnName)}
            style={{cursor: 'pointer', position: 'relative'}}
        >
            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                {label}
                {sortConfig.field === columnName && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
            </div>
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

    const sortedAndFilteredPersons = getSortedAndFilteredPersons();

    const formatCoordinates = (coordinates) => {
        return `(${coordinates.x}, ${coordinates.y})`;
    };

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
                    <StyleButton text="Create person" onclick={handleOpenCreate} disabled={isFetching} type="button"/>
                    <PersonForm open={openCreate} onClose={handleCloseCreate}/>
                </div>
                <TableContainer className='main__table-container'>
                    <Table className="main__table" aria-label="data table" sx={{maxWidth: '100%', overflowX: 'auto'}}>
                        <TableHead>
                            <TableRow>
                                {renderTableHeader('id', 'ID')}
                                {renderTableHeader('name', 'Name')}
                                {renderTableHeader('coordinates', 'Coordinates')}
                                {renderTableHeader('creationDate', 'Creation Date')}
                                {renderTableHeader('eyeColor', 'Eye Color')}
                                {renderTableHeader('hairColor', 'Hair Color')}
                                {renderTableHeader('location', 'Location')}
                                {renderTableHeader('height', 'Height')}
                                {renderTableHeader('birthday', 'Birthday')}
                                {renderTableHeader('nationality', 'Nationality')}
                                {renderTableHeader('adminCanModify', 'Admin Can Modify')}
                                {renderTableHeader('user', 'User')}
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        {persons !== undefined && persons.length > 0 &&
                            <TableBody>
                                {sortedAndFilteredPersons.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{String(row.id)}</TableCell>
                                        <TableCell>{String(row.name)}</TableCell>
                                        <TableCell>{formatCoordinates(row.coordinates)}</TableCell>
                                        <TableCell>{String(row.creationDate)}</TableCell>
                                        <TableCell>{String(row.eyeColor)}</TableCell>
                                        <TableCell>{String(row.hairColor)}</TableCell>
                                        <TableCell>{String(row.location.name)}</TableCell>
                                        <TableCell>{String(row.height)}</TableCell>
                                        <TableCell>{String(row.birthday)}</TableCell>
                                        <TableCell>{String(row.nationality)}</TableCell>
                                        <TableCell>{String(row.adminCanModify)}</TableCell>
                                        <TableCell>{String(row.userName)}</TableCell>
                                        <TableCell>
                                            <div>
                                                <StyleButton text="Update" onclick={(e) => handleOpenUpdate(row)}
                                                             disabled={isFetching} type="button"/>
                                                <PersonUpdateForm open={openUpdate} onClose={handleCloseUpdate}/>
                                            </div>
                                        </TableCell>
                                        <TableCell><StyleButton text="Delete" onclick={(e) => handleDelete(row)}
                                                                disabled={isFetching} type="button"/></TableCell>
                                    </TableRow>
                                ))}
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
                                 disabled={isFetching || personPage === 0}
                                 type="button"
                                 onclick={() => {
                                     if (personPage > 0) {
                                         dispatch(setPersonPage(personPage - 1));
                                         dispatch(getPerson(personPage - 1))
                                     }
                                 }}/>
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
                                 onclick={() => {
                                     dispatch(setPersonPage(personPage + 1));
                                     dispatch(getPerson(personPage + 1))
                                 }}/>
                </Box>
            </Box> }
        </>
    );
}
