import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Button, Paper, InputBase, IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { RootState } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import StatCardComp from "./components/StatCardComp";
import ReceiptsTable from "./components/ReceiptTable";
import AddDirectoryRecordDrawer from "../../components/AddDirectoryRecordDrawer";

const Reciepts = () => {
    const { t } = useTranslation();
    const { directoryId } = useParams<{ directoryId: string }>();
    const companyId = useSelector((state: RootState) => state.auth.user?.company_id);
    const [searchInput, setSearchInput] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const queryClient = useQueryClient();

    const handleRecordAdded = React.useCallback(() => {
        if (directoryId && companyId) {
            queryClient.invalidateQueries({ queryKey: ['directoryRecordsFull', directoryId, companyId] as const });
            setRefreshTrigger(prev => prev + 1);
        }
    }, [queryClient, directoryId, companyId]);

    return (
        <div>
            <StatCardComp />
            
            {/* Search and Create Button Section */}
            <Box sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                mb: 3,
                mt: 4 
            }}>
                {/* Search Input */}
                <Paper
                    component="form"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 999,
                        boxShadow: "none",
                        bgcolor: "#fff",
                        py: 0.5,
                        minWidth: 300,
                        pl: 2,
                        pr: 0.5,
                    }}
                >
                    <InputBase
                        sx={{ ml: 1, flex: 1, fontSize: 16 }}
                        placeholder="Search receipts..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        endAdornment={
                            <IconButton>
                                <Icon icon="ep:search" width={24} />
                            </IconButton>
                        }
                    />
                </Paper>

                {/* Create Receipt Button */}
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => setDrawerOpen(true)}
                    sx={{ borderRadius: 999 }}
                >
                    {t('directories.records.create', '+ Create')}
                </Button>
            </Box>

            {/* Receipts Tables */}
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 xl:gap-8 w-full">
                <ReceiptsTable searchInput={searchInput} refreshTrigger={refreshTrigger} />
                <ReceiptsTable searchInput={searchInput} refreshTrigger={refreshTrigger} />
            </div>

            <AddDirectoryRecordDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                companyDirectoryId={companyId}
                directoryId={directoryId}
                onSuccess={handleRecordAdded}
            />
        </div>
    );
};

export default Reciepts;
