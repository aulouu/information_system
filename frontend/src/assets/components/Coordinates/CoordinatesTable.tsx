// import { TableBody, TableCell, TableContainer, TableHead, TableRow, Table, Box, TextField } from '@mui/material';
// import { useSelector, useDispatch } from 'react-redux';
// import { appSelector, getCoordinates, ICoordinate, sendDeleteCoordinates, setCoordinatesPage, setUpdatedCoordinate } from "../../../storage/Slices/AppSlice";
// import React, { useState, useEffect } from 'react';
// import { AppDispatch } from '../../../storage/store';
// import StyleButton from '../StyleButton';
// import CoordinateForm from './CoordinateForm';
// import CoordinateUpdateForm from './CoordinateUpdateForm';
// interface Coordinate {
//     id: number;
//     x: number;
//     y: number;
//     adminCanModify: boolean;
//     userName: string;
// };
// export type CoordinatesArray = Coordinate[];
// type SortDirection = 'asc' | 'desc' | null;
// export default function CoordinatesTable() {
//     const dispatch = useDispatch<AppDispatch>();
//     const { coordinates, isFetching, coordinatesPage, isAuth } = useSelector(appSelector);
//     const [openCreate, setOpenCreate] = useState(false);
//     const [openUpdate, setOpenUpdate] = useState(false);
//     const [filters, setFilters] = useState<{ [key: string]: string }>({});
//     const [activeColumn, setActiveColumn] = useState<string | null>(null);
//     const [sortConfig, setSortConfig] = useState<{ field: keyof Coordinate | null; direction: SortDirection }>({
//         field: null,
//         direction: null
//     });
//     const handleOpenCreate = () => {
//         if (openUpdate === false) {
//             setOpenCreate(true);
//         }
//     };
//     const handleOpenUpdate = (coordinate: ICoordinate | null) => {
//         if (openCreate === false) {
//             dispatch(setUpdatedCoordinate(coordinate));
//             const timer = setTimeout(() => {
//                 setOpenUpdate(true);
//             }, 50);
//         }
//     };
//     const handleCloseCreate = () => setOpenCreate(false);
//     const handleCloseUpdate = () => setOpenUpdate(false);
//     const handleDelete = (coordinate: ICoordinate) => {
//         const timer = setTimeout(() => {
//             dispatch(sendDeleteCoordinates({ id: coordinate.id }));
//         }, 50);
//     };
//     const handleColumnClick = (columnName: string) => {
//         setActiveColumn(activeColumn === columnName ? null : columnName);
//         if (activeColumn === columnName) {
//             const newFilters = { ...filters };
//             delete newFilters[columnName];
//             setFilters(newFilters);
//             return;
//         }
//         if (!filters[columnName]) {
//             const isAsc = sortConfig.field === columnName && sortConfig.direction === 'asc';
//             const nextDirection: SortDirection = !sortConfig.direction ? 'asc' : isAsc ? 'desc' : null;
//             setSortConfig({
//                 field: nextDirection ? columnName as keyof Coordinate : null,
//                 direction: nextDirection
//             });
//         }
//     };
//     const handleFilterChange = (columnName: string, value: string) => {
//         setFilters(prev => ({
//             ...prev,
//             [columnName]: value
//         }));
//     };
//     const getSortedAndFilteredData = () => {
//         if (!coordinates) return [];
//
//         let result = coordinates.filter(item => {
//             return Object.entries(filters).every(([column, filterValue]) => {
//                 if (!filterValue) return true;
//                 const itemValue = String(item[column as keyof Coordinate] || '').toLowerCase();
//                 return itemValue.includes(filterValue.toLowerCase());
//             });
//         });
//         if (sortConfig.field && sortConfig.direction) {
//             result = [...result].sort((a, b) => {
//                 const aValue = a[sortConfig.field!];
//                 const bValue = b[sortConfig.field!];
//
//                 if (typeof aValue === 'boolean') {
//                     return sortConfig.direction === 'asc'
//                         ? (aValue === bValue ? 0 : aValue ? 1 : -1)
//                         : (aValue === bValue ? 0 : aValue ? -1 : 1);
//                 }
//
//                 if (typeof aValue === 'number' && typeof bValue === 'number') {
//                     return sortConfig.direction === 'asc'
//                         ? aValue - bValue
//                         : bValue - aValue;
//                 }
//
//                 const strA = String(aValue).toLowerCase();
//                 const strB = String(bValue).toLowerCase();
//                 return sortConfig.direction === 'asc'
//                     ? strA.localeCompare(strB)
//                     : strB.localeCompare(strA);
//             });
//         }
//         return result;
//     };
//     const renderTableHeader = (columnName: string, label: string) => (
//         <TableCell
//             onClick={() => handleColumnClick(columnName)}
//             style={{
//                 cursor: 'pointer',
//                 position: 'relative',
//             }}
//         >
//             <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
//                 {label}
//                 {sortConfig.field === columnName && (
//                     <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
//                 )}
//             </div>
//             {activeColumn === columnName && (
//                 <TextField
//                     size="small"
//                     value={filters[columnName] || ''}
//                     onChange={(e) => handleFilterChange(columnName, e.target.value)}
//                     onClick={(e) => e.stopPropagation()}
//                     style={{
//                         position: 'absolute',
//                         top: '100%',
//                         left: 0,
//                         zIndex: 1000,
//                         backgroundColor: 'white',
//                         width: '100%'
//                     }}
//                 />
//             )}
//         </TableCell>
//     );
//     const sortedAndFilteredData = getSortedAndFilteredData();
//     if (coordinates !== undefined && coordinates.length > 0) {
//         return (
//             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'hidden', flexDirection: 'column' }}>
//                 {isAuth && (
//                     <div>
//                         <StyleButton text="Create coordinate" onclick={handleOpenCreate} disabled={isFetching} type="button" />
//                         <CoordinateForm open={openCreate} onClose={handleCloseCreate} />
//                     </div>
//                 )}
//                 <TableContainer className='main__table-container'>
//                     <Table className="main__table" aria-label="data table" sx={{ maxWidth: '100%', overflowX: 'auto' }}>
//                         <TableHead>
//                             <TableRow>
//                                 {renderTableHeader('id', 'ID')}
//                                 {renderTableHeader('x', 'X')}
//                                 {renderTableHeader('y', 'Y')}
//                                 {renderTableHeader('adminCanModify', 'Admin Can Modify')}
//                                 {renderTableHeader('user', 'User')}
//                                 <TableCell></TableCell>
//                                 <TableCell></TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {sortedAndFilteredData.map((row, rowIndex) => (
//                                 <TableRow key={rowIndex}>
//                                     <TableCell>{row.id}</TableCell>
//                                     <TableCell>{row.x}</TableCell>
//                                     <TableCell>{row.y}</TableCell>
//                                     <TableCell>{String(row.adminCanModify)}</TableCell>
//                                     <TableCell>{String(row.userName)}</TableCell>
//                                     <TableCell>
//                                         <div>
//                                             <StyleButton text="Update" onclick={() => handleOpenUpdate(row)} disabled={isFetching} type="button" />
//                                             <CoordinateUpdateForm open={openUpdate} onClose={handleCloseUpdate} />
//                                         </div>
//                                     </TableCell>
//                                     <TableCell>
//                                         <StyleButton text="Delete" onclick={() => handleDelete(row)} disabled={isFetching} type="button" />
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//                 <Box sx={{
//                     display: 'flex',
//                     flexDirection: 'row',
//                     alignItems: 'center'
//                 }}>
//                     <StyleButton
//                         text="Previous Page"
//                         disabled={isFetching || coordinatesPage === 0}
//                         type="button"
//                         onclick={() => {
//                             if (coordinatesPage > 0) {
//                                 dispatch(setCoordinatesPage(coordinatesPage - 1));
//                                 dispatch(getCoordinates(coordinatesPage - 1));
//                             }
//                         }}
//                     />
//                     <label style={{
//                         fontFamily: "Undertale",
//                         backgroundColor: '#855666',
//                         color: '#332127'
//                     }}>
//                         {coordinatesPage}
//                     </label>
//                     <StyleButton
//                         text="Next Page"
//                         disabled={isFetching}
//                         type="button"
//                         onclick={() => {
//                             dispatch(setCoordinatesPage(coordinatesPage + 1));
//                             dispatch(getCoordinates(coordinatesPage + 1));
//                         }}
//                     />
//                 </Box>
//             </Box>
//         );
//     } else {
//         return (
//             <Box sx={{ display: 'flex', alignItems: 'center', overflowX: 'hidden', flexDirection: 'column' }}>
//                 {isAuth && (
//                     <div>
//                         <StyleButton text="Create coordinate" onclick={handleOpenCreate} disabled={isFetching} type="button" />
//                         <CoordinateForm open={openCreate} onClose={handleCloseCreate} />
//                     </div>
//                 )}
//                 <TableContainer className='main__table-container' sx={{ maxWidth: '100%', overflowX: 'auto' }}>
//                     <Table className="main__table" aria-label="data table">
//                         <TableHead>
//                             <TableRow>
//                                 <TableCell>ID</TableCell>
//                                 <TableCell>X</TableCell>
//                                 <TableCell>Y</TableCell>
//                                 <TableCell>Admin Can Modify</TableCell>
//                                 <TableCell>User</TableCell>
//                             </TableRow>
//                         </TableHead>
//                     </Table>
//                 </TableContainer>
//                 <Box sx={{
//                     display: 'flex',
//                     flexDirection: 'row',
//                     alignItems: 'center'
//                 }}>
//                     <StyleButton
//                         text="Previous Page"
//                         disabled={isFetching || coordinatesPage === 0}
//                         type="button"
//                         onclick={() => {
//                             if (coordinatesPage > 0) {
//                                 dispatch(setCoordinatesPage(coordinatesPage - 1));
//                                 dispatch(getCoordinates(coordinatesPage - 1));
//                             }
//                         }}
//                     />
//                     <label style={{
//                         fontFamily: "Undertale",
//                         backgroundColor: '#855666',
//                         color: '#332127'
//                     }}>
//                         {coordinatesPage}
//                     </label>
//                     <StyleButton
//                         text="Next Page"
//                         disabled={isFetching}
//                         type="button"
//                         onclick={() => {
//                             dispatch(setCoordinatesPage(coordinatesPage + 1));
//                             dispatch(getCoordinates(coordinatesPage + 1));
//                         }}
//                     />
//                 </Box>
//             </Box>
//         );
//     }
// }

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

type SortDirection = 'asc' | 'desc' | null;

export default function CoordinatesTable() {
    const dispatch = useDispatch<AppDispatch>();
    const { coordinates, isFetching, coordinatesPage, isAuth } = useSelector(appSelector);

    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [filters, setFilters] = useState<{ [key: string]: string }>({});
    const [activeColumn, setActiveColumn] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ field: keyof Coordinate | null; direction: SortDirection }>({
        field: null,
        direction: null
    });

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
            return;
        }

        if (!filters[columnName]) {
            const isAsc = sortConfig.field === columnName && sortConfig.direction === 'asc';
            const nextDirection: SortDirection = !sortConfig.direction ? 'asc' : isAsc ? 'desc' : null;
            setSortConfig({
                field: nextDirection ? columnName as keyof Coordinate : null,
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

    const getSortedAndFilteredData = () => {
        if (!coordinates) return [];

        let result = coordinates.filter(item => {
            return Object.entries(filters).every(([column, filterValue]) => {
                if (!filterValue) return true;
                const itemValue = String(item[column as keyof Coordinate] || '').toLowerCase();
                return itemValue.includes(filterValue.toLowerCase());
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
            style={{
                cursor: 'pointer',
                position: 'relative',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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

    const sortedAndFilteredData = getSortedAndFilteredData();


    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'hidden', flexDirection: 'column' }}>
            {isAuth && (
                <div>
                    <StyleButton text="Create coordinate" onclick={handleOpenCreate} disabled={isFetching} type="button" />
                    <CoordinateForm open={openCreate} onClose={handleCloseCreate} />
                </div>
            )}
            <TableContainer className='main__table-container'>
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
                        {coordinates !== undefined && coordinates.length > 0 && sortedAndFilteredData.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>{row.x}</TableCell>
                                <TableCell>{row.y}</TableCell>
                                <TableCell>{String(row.adminCanModify)}</TableCell>
                                <TableCell>{row.userId}</TableCell>
                                <TableCell>
                                    <div>
                                        <StyleButton text="Update" onclick={() => handleOpenUpdate(row)} disabled={isFetching} type="button" />
                                        <CoordinateUpdateForm open={openUpdate} onClose={handleCloseUpdate} />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <StyleButton text="Delete" onclick={() => handleDelete(row)} disabled={isFetching} type="button" />
                                </TableCell>
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
                <StyleButton
                    text="Previous Page"
                    disabled={isFetching || coordinatesPage === 0}
                    type="button"
                    onclick={() => {
                        if (coordinatesPage > 0) {
                            dispatch(setCoordinatesPage(coordinatesPage - 1));
                            dispatch(getCoordinates(coordinatesPage - 1));
                        }
                    }}
                />
                <label style={{
                    fontFamily: "Undertale",
                    backgroundColor: '#855666',
                    color: '#332127'
                }}>
                    {coordinatesPage}
                </label>
                <StyleButton
                    text="Next Page"
                    disabled={isFetching}
                    type="button"
                    onclick={() => {
                        dispatch(setCoordinatesPage(coordinatesPage + 1));
                        dispatch(getCoordinates(coordinatesPage + 1));
                    }}
                />
            </Box>
        </Box>
    );

}