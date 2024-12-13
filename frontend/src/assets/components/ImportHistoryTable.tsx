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
import {appSelector, getImport, IImport, sendDeleteImport, setImportPage} from "../../storage/Slices/AppSlice";
import {AppDispatch} from '../../storage/store';
import {useState} from 'react';
import StyleButton from './StyleButton';

export enum OperationStatus {
    SUCCESS = "SUCCESS",
    ERROR = "ERROR"
}

interface Import {
    id: number;
    importTime: string;
    status: OperationStatus;
    importedCount: number;
    userId: number;
    fileUrl: string;
};
export type ImportArray = Import[];
export default function ImportHistoryTable() {
    const dispatch = useDispatch<AppDispatch>();
    const {imports, isFetching, importPage, isAuth} = useSelector(appSelector);
    const [filters, setFilters] = useState<{ [key: string]: string }>({});
    const [activeColumn, setActiveColumn] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ field: keyof Import | null; direction: SortDirection }>({
        field: null,
        direction: null
    });
    const handleDelete = (imports: IImport) => {
        const timer = setTimeout(() => {
            dispatch(sendDeleteImport({id: imports.id}));
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
                field: nextDirection ? columnName as keyof Import : null,
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
        if (!imports) return [];
        let result = imports.filter(item => {
            return Object.entries(filters).every(([column, filterValue]) => {
                if (!filterValue) return true;
                const itemValue = String(item[column as keyof Import] || '').toLowerCase();
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
    const sortedAndFilteredData = getSortedAndFilteredData();
    return (
        <>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflowX: 'hidden',
                flexDirection: 'column'
            }}>
                <TableContainer className='main__table-container'>
                    <Table className="main__table" aria-label="data table" sx={{maxWidth: '100%', overflowX: 'auto'}}>
                        <TableHead>
                            <TableRow>
                                {renderTableHeader('id', 'ID')}
                                {renderTableHeader('importTime', 'Import Time')}
                                {renderTableHeader('status', 'Import Status')}
                                {renderTableHeader('importedCount', 'Imported Count')}
                                {renderTableHeader('user', 'User')}
                                <TableCell>File</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        {imports !== undefined && imports.length > 0 &&
                            <TableBody>
                                {sortedAndFilteredData.map((row: Import, i: number) => (
                                    <TableRow key={i}>
                                        <TableCell>{String(row.id)}</TableCell>
                                        <TableCell>{String(row.importTime)}</TableCell>
                                        <TableCell>{String(row.status)}</TableCell>
                                        <TableCell>{String(row.importedCount)}</TableCell>
                                        <TableCell>{String(row.userId)}</TableCell>
                                        <TableCell>{<a href={row.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'orange' }}>
                                            {row.fileUrl ? "View File" : "No File"}
                                        </a>}</TableCell>
                                        <TableCell>
                                            <StyleButton text="Delete" onclick={(e) => handleDelete(row)}
                                                         disabled={isFetching} type="button"/>
                                        </TableCell>
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
                    <StyleButton
                        text="Previous Page"
                        disabled={isFetching || importPage === 0}
                        type="button"
                        onclick={() => {
                            if (importPage > 0) {
                                dispatch(setImportPage(importPage - 1));
                                dispatch(getImport(importPage - 1))
                            }
                        }}
                    />
                    <label style={{
                        fontFamily: "Undertale",
                        backgroundColor: '#855666',
                        color: 'black'
                    }}>
                        {importPage}
                    </label>
                    <StyleButton
                        text="Next Page"
                        disabled={isFetching}
                        type="button"
                        onclick={() => {
                            dispatch(setImportPage(importPage + 1));
                            dispatch(getImport(importPage + 1))
                        }}
                    />
                </Box>
            </Box>
        </>
    );
}