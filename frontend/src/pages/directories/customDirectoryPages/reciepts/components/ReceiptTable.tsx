import React, { useEffect, useState, useCallback } from "react";
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
} from "@mui/material";

interface Receipt {
    id: string;
    client: string;
    amount: number;
    status: "paid" | "pending" | "failed";
    createdAt: string;
}

interface ReceiptsTableProps {
    searchInput: string;
    refreshTrigger?: number;
}

const mockReceipts: Receipt[] = [
    {
        id: "r1",
        client: "Client A",
        amount: 1200,
        status: "paid",
        createdAt: "2025-07-01",
    },
    {
        id: "r2",
        client: "Client B",
        amount: 950,
        status: "pending",
        createdAt: "2025-07-10",
    },
    {
        id: "r3",
        client: "Client C",
        amount: 2100,
        status: "failed",
        createdAt: "2025-07-12",
    },
];

export default function ReceiptsTable({ searchInput, refreshTrigger }: ReceiptsTableProps) {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        setLoading(true);
        // Simulate API fetch
        setTimeout(() => {
            const filtered = mockReceipts.filter((r) =>
                r.client.toLowerCase().includes(searchInput.toLowerCase())
            );
            setReceipts(filtered);
            setLoading(false);
        }, 500);
    }, [searchInput, refreshTrigger]);

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
                            <TableCell>ID</TableCell>
                            <TableCell>Client</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : receipts.length > 0 ? (
                            receipts
                                .slice(
                                    page * rowsPerPage,
                                    page * rowsPerPage + rowsPerPage
                                )
                                .map((receipt) => (
                                    <TableRow key={receipt.id}>
                                        <TableCell>{receipt.id}</TableCell>
                                        <TableCell>{receipt.client}</TableCell>
                                        <TableCell>
                                            ${receipt.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    fontWeight: 600,
                                                    color:
                                                        receipt.status ===
                                                        "paid"
                                                            ? "#22c55e"
                                                            : receipt.status ===
                                                              "pending"
                                                            ? "#f59e0b"
                                                            : "#ef4444",
                                                }}
                                            >
                                                {receipt.status}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {receipt.createdAt}
                                        </TableCell>
                                    </TableRow>
                                ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    align="center"
                                    sx={{ py: 5, fontSize: 18, color: "#888" }}
                                >
                                    No receipts found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                count={receipts.length}
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
