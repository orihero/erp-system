import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDirectoryRecords } from "@/hooks/useDirectoryRecords";
import { Box, Button, Paper, InputBase, IconButton, Alert, CircularProgress } from "@mui/material";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { RootState } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import StatCardComp from "./components/StatCardComp";
import ReceiptsTable from "./components/ReceiptTable";
import AddDirectoryRecordDrawer from "../../components/AddDirectoryRecordDrawer";
import type { DirectoryField } from "@/api/services/directories";

interface ReceiptRecord {
  id: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface GroupedRecords {
  [groupValue: string]: ReceiptRecord[];
}

interface FullDataResponse {
  directory: Record<string, unknown>;
  companyDirectory: Record<string, unknown>;
  directoryRecords: Array<Record<string, unknown>> | Record<string, Array<Record<string, unknown>>>;
  fields: DirectoryField[];
}

const Reciepts = () => {
    const { t } = useTranslation();
    const { directoryId } = useParams<{ directoryId: string }>();
    const companyId = useSelector((state: RootState) => state.auth.user?.company_id);
    const [searchInput, setSearchInput] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const queryClient = useQueryClient();

    const {
        data: fullData,
        isLoading,
        error
    } = useDirectoryRecords(directoryId || '', companyId || '') as unknown as { 
        data: FullDataResponse; 
        isLoading: boolean; 
        error: unknown; 
        refetch: () => void 
    };

    // Get grouping configuration from directory metadata
    const groupByField = useMemo(() => {
        if (!fullData?.directory?.metadata) return null;
        const metadata = fullData.directory.metadata as Record<string, unknown>;
        const groupBy = metadata.groupBy as string || null;
        console.log('Receipts GroupBy Field:', groupBy);
        return groupBy;
    }, [fullData?.directory?.metadata]);

    // Parse directory records into receipt format
    const groupedRecords = useMemo(() => {
        if (!fullData?.directoryRecords || !fullData?.fields) return {};

        const records = fullData.directoryRecords as Array<Record<string, unknown>>;
        const fields = fullData.fields as DirectoryField[];
        
        console.log('Receipts Debug:', {
            recordsCount: records.length,
            fieldsCount: fields.length,
            sampleRecord: records[0],
            sampleField: fields[0],
            fullData
        });
        
        // Sort fields by order
        const sortedFields = fields.sort((a, b) => {
            const orderA = (a.metadata?.fieldOrder as number) || 0;
            const orderB = (b.metadata?.fieldOrder as number) || 0;
            return orderA - orderB;
        });

        const grouped: GroupedRecords = {};

        // Handle both array and object formats for directoryRecords
        let recordsToProcess: Array<Record<string, unknown>> = [];
        if (Array.isArray(records)) {
            recordsToProcess = records;
        } else if (typeof records === 'object' && records !== null) {
            // If records is an object (grouped by backend), flatten it
            Object.values(records).forEach((groupRecords: unknown) => {
                if (Array.isArray(groupRecords)) {
                    recordsToProcess.push(...(groupRecords as Array<Record<string, unknown>>));
                }
            });
        }

        recordsToProcess.forEach(record => {
            const recordData: Partial<ReceiptRecord> = { id: record.id as string };
            
            // Map record values to fields - use recordValues with field_id
            const values = (record.recordValues as Array<Record<string, unknown>>) || [];
            console.log('Processing record:', record.id, 'with recordValues:', values);
            
            // Map each field to its value
            sortedFields.forEach(field => {
                const valueObj = values.find((value: Record<string, unknown>) => {
                    return value.field_id === field.id;
                });
                
                if (valueObj) {
                    const fieldName = field.name;
                    (recordData as Record<string, unknown>)[fieldName] = valueObj.value;
                    console.log(`Mapped field ${fieldName} = ${valueObj.value}`);
                } else {
                    // Set default value for missing fields
                    const fieldName = field.name;
                    (recordData as Record<string, unknown>)[fieldName] = null;
                    console.log(`No value found for field ${field.name} (${field.id}), setting to null`);
                }
            });

            // Determine group value
            let groupValue = 'Unknown';
            if (groupByField) {
                // Find the field by name
                const groupField = sortedFields.find(f => f.name === groupByField);
                if (groupField) {
                    const groupValueObj = values.find((v: Record<string, unknown>) => {
                        return v.field_id === groupField.id;
                    });
                    groupValue = groupValueObj ? String(groupValueObj.value) : 'Unknown';
                    console.log(`Group value for ${groupByField}: ${groupValue}`);
                } else {
                    console.log(`Group field '${groupByField}' not found in sorted fields`);
                }
            } else {
                // No grouping, put all records in a single group
                groupValue = 'All Records';
            }

            if (!grouped[groupValue]) {
                grouped[groupValue] = [];
            }
            grouped[groupValue].push(recordData as ReceiptRecord);
        });

        console.log('Receipts Grouped Records:', grouped);
        console.log('Receipts Debug - Records with values:', Object.values(grouped).flat().filter(record => 
            Object.entries(record).some(([key, value]) => 
                key !== 'id' && value !== null && value !== undefined && value !== ''
            )
        ).length);
        return grouped;
    }, [fullData, groupByField]);

    const handleRecordAdded = React.useCallback(() => {
        if (directoryId && companyId) {
            queryClient.invalidateQueries({ queryKey: ['directoryRecordsFull', directoryId, companyId] as const });
            setRefreshTrigger(prev => prev + 1);
        }
    }, [queryClient, directoryId, companyId]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                {t('receipts.error', 'Error loading receipts')}: {String(error)}
            </Alert>
        );
    }

    // Get the first two groups for the two tables
    const groupNames = Object.keys(groupedRecords);
    const firstGroup = groupNames[0] || 'No Data';
    const secondGroup = groupNames[1] || 'No Data';
    const firstGroupRecords = groupedRecords[firstGroup] || [];
    const secondGroupRecords = groupedRecords[secondGroup] || [];

    return (
        <div>
            <StatCardComp groupedRecords={groupedRecords} fields={fullData?.fields || []} />
            
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
                <ReceiptsTable 
                    searchInput={searchInput} 
                    refreshTrigger={refreshTrigger}
                    records={firstGroupRecords}
                    fields={fullData?.fields || []}
                />
                <ReceiptsTable 
                    searchInput={searchInput} 
                    refreshTrigger={refreshTrigger}
                    records={secondGroupRecords}
                    fields={fullData?.fields || []}
                />
            </div>

            <AddDirectoryRecordDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                companyDirectoryId={fullData?.companyDirectory?.id as string}
                directoryId={directoryId}
                onSuccess={handleRecordAdded}
            />
        </div>
    );
};

export default Reciepts;
