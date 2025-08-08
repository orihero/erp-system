import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableFooter,
    TablePagination,
    Typography,
    CircularProgress,
    Chip,
} from "@mui/material";
import type { DirectoryField } from "@/api/services/directories";

interface ReceiptRecord {
    id: string;
    [key: string]: string | number | boolean | null | undefined;
}

interface ReceiptsTableProps {
    searchInput: string;
    refreshTrigger?: number;
    records: ReceiptRecord[];
    fields: DirectoryField[];
}

export default function ReceiptsTable({ searchInput, refreshTrigger, records, fields }: ReceiptsTableProps) {
    const [filteredRecords, setFilteredRecords] = useState<ReceiptRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Sort fields by order
    const sortedFields = useMemo(() => {
        return fields.sort((a, b) => {
            const orderA = (a.metadata?.fieldOrder as number) || 0;
            const orderB = (b.metadata?.fieldOrder as number) || 0;
            return orderA - orderB;
        });
    }, [fields]);

    // Get visible fields for table
    const visibleFields = useMemo(() => {
        return sortedFields.filter(field => 
            field.metadata?.isVisibleOnTable !== false
        );
    }, [sortedFields]);

    useEffect(() => {
        setLoading(true);
        // Filter records based on search input
        const filtered = records.filter((record) => {
            if (!searchInput) return true;
            
            // Search across all field values, excluding null/undefined values
            return Object.entries(record).some(([key, value]) => {
                if (key === 'id') return false; // Skip ID field
                if (value === null || value === undefined || value === '') return false;
                return String(value).toLowerCase().includes(searchInput.toLowerCase());
            });
        });
        
        setFilteredRecords(filtered);
        setLoading(false);
    }, [searchInput, refreshTrigger, records]);

    const handlePageChange = useCallback(
        (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => setPage(newPage),
        []
    );
    
    const handleRowsPerPageChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
        },
        []
    );

    const formatValue = (value: string | number | boolean | null | undefined, field: DirectoryField) => {
        if (value === null || value === undefined) return '-';
        
        switch (field.type) {
            case 'date':
                return new Date(String(value)).toLocaleDateString('uz-UZ', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            case 'decimal':
            case 'number':
            case 'integer':
                if (typeof value === 'number') {
                    return new Intl.NumberFormat('uz-UZ', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0
                    }).format(value);
                }
                return String(value);
            default:
                return String(value);
        }
    };

    const getStatusColor = (value: string | number | boolean | null | undefined) => {
        const status = String(value).toLowerCase();
        switch (status) {
            case 'paid':
            case 'completed':
            case 'success':
                return '#22c55e';
            case 'pending':
            case 'processing':
                return '#f59e0b';
            case 'failed':
            case 'cancelled':
            case 'error':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    return (
        <Box>
            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: 4,
                    boxShadow: "0 4px 24px 0 rgba(0,0,0,0.04)",
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            {visibleFields.map(field => (
                                <TableCell key={field.id}>
                                    {field.metadata?.label || field.name}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={visibleFields.length} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : filteredRecords.length > 0 ? (
                            filteredRecords
                                .slice(
                                    page * rowsPerPage,
                                    page * rowsPerPage + rowsPerPage
                                )
                                .map((record) => (
                                    <TableRow key={record.id}>
                                        {visibleFields.map(field => (
                                            <TableCell key={field.id}>
                                                {field.name.toLowerCase().includes('status') ? (
                                                    <Chip
                                                        label={String(record[field.name] || 'Unknown')}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getStatusColor(record[field.name]),
                                                            color: 'white',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            maxWidth: 200,
                                                        }}
                                                    >
                                                        {formatValue(record[field.name], field)}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleFields.length}
                                    align="center"
                                    sx={{ py: 5, fontSize: 18, color: "#888" }}
                                >
                                    {records.length === 0 ? 'No receipts found.' : 'No receipts with data found.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                count={filteredRecords.length}
                                page={page}
                                onPageChange={handlePageChange}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleRowsPerPageChange}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Box>
    );
}
