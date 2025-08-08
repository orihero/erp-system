import React, { useState, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Collapse,
  Menu
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useDirectoryRecords } from '@/hooks/useDirectoryRecords';
import type { Directory } from '@/api/services/directories';


interface DataFilteringStepProps {
  selectedDirectory: Directory;
  companyId: string;
  selectedFilters: string[];
  selectedSorting: string[];
  selectedGrouping: string[];
  selectedJoins: string[];
  onFiltersChange: (filters: string[]) => void;
  onSortingChange: (sorting: string[]) => void;
  onGroupingChange: (grouping: string[]) => void;
  onJoinsChange: (joins: string[]) => void;
}

interface FilterConfig {
  field: string;
  operator: string;
  value: string | number | boolean;
  function?: string;
  functionParams?: (string | number | boolean)[];
}

interface AdvancedFilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string | number | boolean;
  joinOperator?: 'AND' | 'OR';
  function?: string;
  functionParams?: (string | number | boolean)[];
}

interface AdvancedFilterGroup {
  id: string;
  conditions: AdvancedFilterCondition[];
  joinOperator?: 'AND' | 'OR';
}

interface DirectoryRecord {
  id: string;
  recordValues?: Array<{
    field_id: string;
    value: string | number | boolean;
  }>;
}

interface DirectoryField {
  id: string;
  name: string;
  type: string;
  metadata?: {
    isFilterable?: boolean;
    isVisibleOnTable?: boolean;
    fieldOrder?: number;
  };
}

// Filter operators based on field type
const getFilterOperators = (fieldType: string) => {
  switch (fieldType) {
    case 'text':
      return [
        { value: 'contains', label: 'Contains' },
        { value: 'notContains', label: 'Does not contain' },
        { value: 'equals', label: 'Equals' },
        { value: 'notEqual', label: 'Not equal' },
        { value: 'startsWith', label: 'Begins with' },
        { value: 'endsWith', label: 'Ends with' },
        { value: 'blank', label: 'Is blank' },
        { value: 'notBlank', label: 'Is not blank' }
      ];
    case 'number':
      return [
        { value: 'equals', label: '=' },
        { value: 'notEqual', label: '!=' },
        { value: 'greaterThan', label: '>' },
        { value: 'greaterThanOrEqual', label: '>=' },
        { value: 'lessThan', label: '<' },
        { value: 'lessThanOrEqual', label: '<=' },
        { value: 'blank', label: 'Is blank' },
        { value: 'notBlank', label: 'Is not blank' }
      ];
    case 'date':
    case 'datetime':
      return [
        { value: 'equals', label: '=' },
        { value: 'notEqual', label: '!=' },
        { value: 'greaterThan', label: '>' },
        { value: 'greaterThanOrEqual', label: '>=' },
        { value: 'lessThan', label: '<' },
        { value: 'lessThanOrEqual', label: '<=' },
        { value: 'blank', label: 'Is blank' },
        { value: 'notBlank', label: 'Is not blank' }
      ];
    case 'boolean':
      return [
        { value: 'true', label: 'Is true' },
        { value: 'false', label: 'Is false' },
        { value: 'blank', label: 'Is blank' },
        { value: 'notBlank', label: 'Is not blank' }
      ];
    default:
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'notEqual', label: 'Not equal' },
        { value: 'blank', label: 'Is blank' },
        { value: 'notBlank', label: 'Is not blank' }
      ];
  }
};

const DataFilteringStep: React.FC<DataFilteringStepProps> = ({
  selectedDirectory,
  companyId,
  selectedSorting,
  selectedGrouping,
  selectedJoins,
  onSortingChange,
  onGroupingChange,
  onJoinsChange
}) => {
  const { t } = useTranslation();
  const [showGrouping, setShowGrouping] = useState(false);
  const [showJoins, setShowJoins] = useState(false);
  // Column menu states
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  // Advanced Filter states
  const [advancedFilterText, setAdvancedFilterText] = useState<string>('');
  const [showAdvancedFilterBuilder, setShowAdvancedFilterBuilder] = useState(false);
  const [advancedFilterGroups, setAdvancedFilterGroups] = useState<AdvancedFilterGroup[]>([
    { id: '1', conditions: [], joinOperator: 'AND' }
  ]);
  const [suggestions, setSuggestions] = useState<Array<{ type: 'field' | 'operator' | 'value', value: string, label: string, description?: string, needsArgument?: boolean }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isValueInputMode, setIsValueInputMode] = useState(false);
  const [currentValueInput, setCurrentValueInput] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string | number | boolean>>({});
  const filterInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  // Convert selectedSorting to backend format
  const backendSorting = useMemo(() => {
    const sorting = selectedSorting.map(sort => {
      const [field, direction] = sort.split(' ');
      return {
        field,
        direction: direction as 'ASC' | 'DESC'
      };
    });
    console.log('Backend sorting format:', sorting);
    return sorting;
  }, [selectedSorting]);

  // Fetch directory records with sorting and filters
  const { data: directoryData, isLoading, error } = useDirectoryRecords(
    selectedDirectory.id,
    companyId,
    { 
      search: '',
      filters: activeFilters,
      sorting: backendSorting
    }
  );

  const fields = directoryData?.fields || [];
  const finalRecords = directoryData?.directoryRecords || [];
  const finalFields = directoryData?.fields || [];
  
  // Debug logging
  console.log('Current sorting state:', selectedSorting);
  console.log('Backend sorting:', backendSorting);
  console.log('Final records count:', finalRecords.length);
  console.log('Is loading:', isLoading);

  // Get filterable fields (those with isFilterable metadata)
  const filterableFields = useMemo(() => {
    return finalFields.filter(field => 
      field.metadata?.isFilterable !== false && 
      field.type !== 'relation' // Exclude relation fields from basic filters
    );
  }, [finalFields]);



  // Available grouping options
  const availableGrouping = useMemo(() => {
    return finalFields
      .filter(field => ['text', 'select', 'multiselect'].includes(field.type))
      .map(field => field.name);
  }, [finalFields]);

  // Available join options (other directories)
  const availableJoins = useMemo(() => {
    // This would typically come from available directories
    return ['Users', 'Products', 'Categories', 'Locations'];
  }, []);

  // Get operators and functions based on field type
  const getOperatorsForFieldType = (fieldType: string) => {
    const operators: Array<{ value: string, label: string, description?: string, needsArgument: boolean }> = [];
    
    switch (fieldType.toLowerCase()) {
      case 'string':
      case 'text': {
        operators.push(
          { value: 'equals', label: 'Equals', description: 'Field exactly matches the specified text', needsArgument: true },
          { value: 'contains', label: 'Contains', description: 'Field contains the specified text', needsArgument: true },
          { value: 'is blank', label: 'Is blank', description: 'Field is empty or null', needsArgument: false },
          { value: 'is not blank', label: 'Is not blank', description: 'Field has a value', needsArgument: false }
        );
        break;
      }
      case 'integer': {
        operators.push(
          { value: 'equals', label: 'Equals', description: 'Field equals the specified number', needsArgument: true },
          { value: 'is blank', label: 'Is blank', description: 'Field is empty or null', needsArgument: false }
        );
        break;
      }
      case 'decimal': {
        operators.push(
          { value: 'equals', label: 'Equals', description: 'Field equals the specified number', needsArgument: true },
          { value: 'is blank', label: 'Is blank', description: 'Field is empty or null', needsArgument: false }
        );
        break;
      }
      case 'number': {
        operators.push(
          { value: 'equals', label: 'Equals', description: 'Field equals the specified number', needsArgument: true },
          { value: 'is blank', label: 'Is blank', description: 'Field is empty or null', needsArgument: false }
        );
        break;
      }
      case 'date': {
        operators.push(
          { value: 'equals', label: 'Equals', description: 'Field equals the specified date', needsArgument: true },
          { value: 'does not equal', label: 'Does not equal', description: 'Field does not equal the specified date', needsArgument: true },
          { value: 'greater than', label: 'Greater than', description: 'Field is after the specified date', needsArgument: true },
          { value: 'greater than or equal', label: 'Greater than or equal', description: 'Field is on or after the specified date', needsArgument: true },
          { value: 'less than', label: 'Less than', description: 'Field is before the specified date', needsArgument: true },
          { value: 'less than or equal', label: 'Less than or equal', description: 'Field is on or before the specified date', needsArgument: true },
          { value: 'is blank', label: 'Is blank', description: 'Field is empty or null', needsArgument: false },
          { value: 'is not blank', label: 'Is not blank', description: 'Field has a value', needsArgument: false }
        );
        break;
      }
      case 'datetime': {
        operators.push(
          { value: 'equals', label: 'Equals', description: 'Field equals the specified date', needsArgument: true },
          { value: 'does not equal', label: 'Does not equal', description: 'Field does not equal the specified date', needsArgument: true },
          { value: 'greater than', label: 'Greater than', description: 'Field is after the specified date', needsArgument: true },
          { value: 'greater than or equal', label: 'Greater than or equal', description: 'Field is on or after the specified date', needsArgument: true },
          { value: 'less than', label: 'Less than', description: 'Field is before the specified date', needsArgument: true },
          { value: 'less than or equal', label: 'Less than or equal', description: 'Field is on or before the specified date', needsArgument: true },
          { value: 'is blank', label: 'Is blank', description: 'Field is empty or null', needsArgument: false },
          { value: 'is not blank', label: 'Is not blank', description: 'Field has a value', needsArgument: false }
        );
        break;
      }
      case 'relation': {
        operators.push(
          { value: 'equals', label: 'Equals', description: 'Field equals the specified record', needsArgument: true },
          { value: 'does not equal', label: 'Does not equal', description: 'Field does not equal the specified record', needsArgument: true },
          { value: 'is blank', label: 'Is blank', description: 'Field is empty or null', needsArgument: false },
          { value: 'is not blank', label: 'Is not blank', description: 'Field has a value', needsArgument: false }
        );
        break;
      }
      default: {
        operators.push(
          { value: 'equals', label: 'Equals', description: 'Field equals the specified value', needsArgument: true },
          { value: 'does not equal', label: 'Does not equal', description: 'Field does not equal the specified value', needsArgument: true },
          { value: 'is blank', label: 'Is blank', description: 'Field is empty or null', needsArgument: false },
          { value: 'is not blank', label: 'Is not blank', description: 'Field has a value', needsArgument: false }
        );
      }
    }
    
    return operators;
  };

  // Parse the current filter state
  const parseFilterState = (input: string) => {
    const parts = input.split(' ');
    const state = {
      field: null as DirectoryField | null,
      operator: null as string | null,
      argument: null as string | null,
      isComplete: false
    };
    
    // Find field
    for (const part of parts) {
      const field = filterableFields.find(f => f.name.toLowerCase() === part.toLowerCase());
      if (field) {
        state.field = field;
        break;
      }
    }
    
    // Find operator
    if (state.field) {
      const operators = getOperatorsForFieldType(state.field.type);
      
      for (const part of parts) {
        const operator = operators.find(op => op.value.toLowerCase() === part.toLowerCase());
        
        if (operator) {
          state.operator = operator.value;
        break;
      }
      }
    }
    
    // Check if complete
    if (state.field && state.operator) {
      const selectedOp = getOperatorsForFieldType(state.field.type).find(op => op.value === state.operator);
      
      if (selectedOp && !selectedOp.needsArgument) {
        state.isComplete = true;
      } else if (selectedOp && selectedOp.needsArgument && parts.length > 2) {
        // Extract argument (everything after operator)
        const operatorIndex = parts.findIndex(part => 
          part.toLowerCase() === state.operator?.toLowerCase()
        );
        if (operatorIndex !== -1) {
          state.argument = parts.slice(operatorIndex + 1).join(' ');
          state.isComplete = true;
        }
      }
    }
    
    return state;
  };

  // Generate suggestions for advanced filter
  const generateSuggestions = (input: string) => {
    const suggestions: Array<{ type: 'field' | 'operator' | 'value', value: string, label: string, description?: string, needsArgument?: boolean }> = [];
    
    const filterState = parseFilterState(input);
    
    // Step 1: If no field selected, show only fields
    if (!filterState.field) {
      const currentWord = input.trim().toLowerCase();
      
    filterableFields.forEach(field => {
        if (field.name.toLowerCase().includes(currentWord)) {
        suggestions.push({
          type: 'field',
          value: field.name,
          label: `Field: ${field.name}`,
          description: `Type: ${field.type}`
        });
      }
    });

      return suggestions;
    }
    
    // Step 2: If field selected but no operator, show operators
    if (filterState.field && !filterState.operator) {
      const currentWord = input.split(' ').pop()?.toLowerCase() || '';
      
      // Add operators
      const operators = getOperatorsForFieldType(filterState.field.type);
      operators.forEach(op => {
        if (op.value.toLowerCase().includes(currentWord)) {
          suggestions.push({
            type: 'operator',
            value: op.value,
            label: op.label,
            description: op.description,
            needsArgument: op.needsArgument
          });
        }
      });
      
      return suggestions;
    }
    
    // Step 3: If operator selected but no argument, show relation records or prompt for input
    if (filterState.field && filterState.operator && !filterState.argument) {
      const selectedOp = getOperatorsForFieldType(filterState.field.type).find(op => op.value === filterState.operator);
      
      if (selectedOp && selectedOp.needsArgument) {
        if (filterState.field.type.toLowerCase() === 'relation') {
          // For relation fields, we would need to fetch directory records
          // This is a placeholder - you'll need to implement the API call
          suggestions.push({
            type: 'value',
            value: 'Loading relation records...',
            label: 'Loading relation records...',
            description: 'Fetching available records for this relation field'
          });
        } else {
          // For other field types, show a prompt
          suggestions.push({
            type: 'value',
            value: 'Enter value',
            label: 'Enter value',
            description: `Enter the value for ${filterState.operator}`
          });
        }
      }
    }

    return suggestions;
  };

  const handleAdvancedFilterInputChange = (value: string) => {
    setAdvancedFilterText(value);
    
    // Generate suggestions based on current filter state
    const suggestions = generateSuggestions(value);
      setSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  };

  const handleAdvancedFilterKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && suggestions.length > 0) {
      // Apply first suggestion
      const suggestion = suggestions[0];
      // If input is empty, just add the suggestion
      if (!advancedFilterText.trim()) {
        setAdvancedFilterText(suggestion.value + ' ');
      } else {
        // Replace the current word with the suggestion
        setAdvancedFilterText(prev => prev + ' ' + suggestion.value);
      }
      setShowSuggestions(false);
      event.preventDefault();
    }
  };

  const handleValueInputChange = (value: string) => {
    setCurrentValueInput(value);
  };

  const handleValueInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && currentValueInput.trim()) {
      // Complete the filter with the entered value
      const filterState = parseFilterState(advancedFilterText);
      if (filterState.field && filterState.operator) {
        const completedFilter = `${advancedFilterText} ${currentValueInput.trim()}`;
        setAdvancedFilterText(completedFilter);
        setIsValueInputMode(false);
        setCurrentValueInput('');
        
        // Apply the filter immediately
        applyFilterToAPI(completedFilter);
      }
      event.preventDefault();
    } else if (event.key === 'Escape') {
      // Cancel value input mode
      setIsValueInputMode(false);
      setCurrentValueInput('');
      filterInputRef.current?.focus();
    }
  };

  const handleGroupingToggle = (grouping: string) => {
    onGroupingChange(
      selectedGrouping.includes(grouping)
        ? selectedGrouping.filter(g => g !== grouping)
        : [...selectedGrouping, grouping]
    );
  };

  const handleJoinToggle = (join: string) => {
    onJoinsChange(
      selectedJoins.includes(join)
        ? selectedJoins.filter(j => j !== join)
        : [...selectedJoins, join]
    );
  };

  // Column menu handlers
  const handleColumnMenuOpen = (event: React.MouseEvent<HTMLElement>, columnName: string) => {
    setColumnMenuAnchor(event.currentTarget);
    setSelectedColumn(columnName);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
    setSelectedColumn(null);
  };

  const handleColumnAction = (action: string) => {
    if (selectedColumn) {
      console.log(`Action ${action} for column ${selectedColumn}`);
      // Handle different column actions here
      switch (action) {
        case 'sort-asc':
          // Remove any existing sort for this column and add ascending sort
          const newSortingAsc = selectedSorting.filter(s => !s.startsWith(selectedColumn + ' '));
          const updatedSortingAsc = [...newSortingAsc, `${selectedColumn} ASC`];
          console.log('Applying ascending sort:', updatedSortingAsc);
          onSortingChange(updatedSortingAsc);
          break;
        case 'sort-desc':
          // Remove any existing sort for this column and add descending sort
          const newSortingDesc = selectedSorting.filter(s => !s.startsWith(selectedColumn + ' '));
          const updatedSortingDesc = [...newSortingDesc, `${selectedColumn} DESC`];
          console.log('Applying descending sort:', updatedSortingDesc);
          onSortingChange(updatedSortingDesc);
          break;
        case 'clear-sort':
          // Remove sorting for this column
          const newSortingClear = selectedSorting.filter(s => !s.startsWith(selectedColumn + ' '));
          console.log('Clearing sort for column:', selectedColumn, 'New sorting:', newSortingClear);
          onSortingChange(newSortingClear);
          break;
        case 'filter':
          // Add filter for this column
          break;
        case 'group':
          onGroupingChange([...selectedGrouping, selectedColumn]);
          break;
        case 'hide':
          // Hide column logic
          break;
        case 'pin':
          // Pin column logic
          break;
        case 'resize':
          // Resize column logic
          break;
      }
    }
    handleColumnMenuClose();
  };

  // Helper function to get display value for a field
  const getFieldValue = (record: DirectoryRecord, field: DirectoryField) => {
    const valueObj = record.recordValues?.find((v) => v.field_id === field.id);
    return valueObj ? String(valueObj.value) : '-';
  };

  const displayFields = finalFields
    .filter(field => field.metadata?.isVisibleOnTable !== false)
    .sort((a, b) => Number(a.metadata?.fieldOrder ?? 0) - Number(b.metadata?.fieldOrder ?? 0));



  // Advanced Filter Builder handlers
  const addCondition = (groupId: string) => {
    setAdvancedFilterGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, conditions: [...group.conditions, { id: Date.now().toString(), field: '', operator: '', value: '' }] }
          : group
      )
    );
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setAdvancedFilterGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, conditions: group.conditions.filter(c => c.id !== conditionId) }
          : group
      )
    );
  };

  const updateCondition = (groupId: string, conditionId: string, field: string, property: 'field' | 'operator' | 'value', value: string) => {
    setAdvancedFilterGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { 
              ...group, 
              conditions: group.conditions.map(c => 
                c.id === conditionId 
                  ? { ...c, [property]: value }
                  : c
              )
            }
          : group
      )
    );
  };



  const applyFilterToAPI = (filterText: string) => {
    const filterState = parseFilterState(filterText);
    
    if (filterState.field && filterState.operator && filterState.argument) {
      // Convert the filter to backend format
      const newFilters: Record<string, string | number | boolean> = { ...activeFilters };
      
      // Send operator information to backend
      // Format: filters[field_id:operator] = value
      const filterKey = `${filterState.field.id}:${filterState.operator}`;
      let filterValue = filterState.argument;
      
      switch (filterState.operator) {
        case 'contains':
          filterValue = filterState.argument;
          break;
        case 'equals':
          filterValue = filterState.argument;
          break;
        case 'is blank':
          filterValue = '';
          break;
        case 'is not blank':
          filterValue = 'not_blank';
          break;
        default:
          filterValue = filterState.argument;
          break;
      }
      
      // Use field ID and operator as the key
      newFilters[filterKey] = filterValue;
      
      console.log('Applying filter to API:', newFilters);
      
      // Update the active filters state
      setActiveFilters(newFilters);
      
      // Clear the filter text
      setAdvancedFilterText('');
      setIsValueInputMode(false);
      setCurrentValueInput('');
    }
  };

  const applyAdvancedFilter = () => {
    if (advancedFilterText.trim()) {
      applyFilterToAPI(advancedFilterText);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setAdvancedFilterText('');
    setIsValueInputMode(false);
    setCurrentValueInput('');
  };

  // Function to delete a specific part from the filter
  const deleteFilterPart = (partToDelete: string, partIndex: number) => {
    const parts = advancedFilterText.split(' ').filter(p => p.trim());
    const newParts = parts.filter((_, index) => index !== partIndex);
    setAdvancedFilterText(newParts.join(' '));
  };



  return (
    <Box>
      {/* CSS for loading animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      
      {/* Combined Advanced Filter Input and Records Table */}
      <Box sx={{ mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon="mdi:filter-variant" style={{ fontSize: '20px', color: '#3b82f6' }} />
              {t('wizard.advancedFilter', 'Advanced Filter')}
            </Typography>
            
            <Box sx={{ position: 'relative', mb: 3 }}>
              <Box
                sx={{
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap',
                  backgroundColor: '#fff',
                  '&:focus-within': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
                  }
                }}
              >
                <Icon icon="mdi:filter" style={{ color: '#6b7280' }} />
                
                {/* Render filter parts with different colors */}
                {(() => {
                  const filterState = parseFilterState(advancedFilterText);
                  const elements: React.ReactElement[] = [];
                  
                  // Process the text to handle multi-word field names
                  let remainingText = advancedFilterText;
                  let currentIndex = 0;
                  
                  while (remainingText.trim()) {
                    let foundField = false;
                    
                    // Try to find complete field names first (longest match)
                    const sortedFields = [...filterableFields].sort((a, b) => b.name.length - a.name.length);
                    
                    for (const field of sortedFields) {
                      const fieldName = field.name;
                      const regex = new RegExp(`^${fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                      const match = remainingText.match(regex);
                      
                      if (match) {
                        // Add any text before the field
                        const beforeText = remainingText.substring(0, match.index || 0).trim();
                        if (beforeText) {
                          elements.push(
                            <span key={`text-${currentIndex++}`} style={{ fontSize: '14px' }}>
                              {beforeText}
                            </span>
                          );
                        }
                        
                        // Add the field
                        elements.push(
                          <Box
                            key={`field-${currentIndex++}`}
                            sx={{
                              backgroundColor: '#dbeafe', // Light blue
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#1e40af',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {fieldName}
                            <IconButton
                              size="small"
                              onClick={() => {
                                const newText = advancedFilterText.replace(new RegExp(`\\b${fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`), '').trim();
                                setAdvancedFilterText(newText);
                              }}
                              sx={{ 
                                p: 0, 
                                ml: 0.5,
                                '&:hover': { backgroundColor: 'rgba(30, 64, 175, 0.1)' }
                              }}
                            >
                              <Icon icon="mdi:close" style={{ fontSize: '12px' }} />
                            </IconButton>
                          </Box>
                        );
                        
                        remainingText = remainingText.substring((match.index || 0) + fieldName.length);
                        foundField = true;
                        break;
                      }
                    }
                    
                    if (!foundField) {
                      // No field found, process as regular text
                      const nextSpace = remainingText.indexOf(' ');
                      const part = nextSpace > 0 ? remainingText.substring(0, nextSpace) : remainingText;
                      
                      // Check if this part is an operator
                      const operators = filterState.field ? getOperatorsForFieldType(filterState.field.type) : [];
                      const isOperator = operators.find(op => op.value.toLowerCase() === part.toLowerCase());
                      
                      if (isOperator) {
                        elements.push(
                          <Box
                            key={`operator-${currentIndex++}`}
                            sx={{
                              backgroundColor: '#dcfce7', // Light green
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#166534',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {part}
                            <IconButton
                              size="small"
                              onClick={() => {
                                const newText = advancedFilterText.replace(new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`), '').trim();
                                setAdvancedFilterText(newText);
                              }}
                              sx={{ 
                                p: 0, 
                                ml: 0.5,
                                '&:hover': { backgroundColor: 'rgba(22, 101, 52, 0.1)' }
                              }}
                            >
                              <Icon icon="mdi:close" style={{ fontSize: '12px' }} />
                            </IconButton>
                          </Box>
                        );
                      } else if (part.startsWith('[') && part.endsWith(']')) {
                        // Argument placeholder
                        elements.push(
                          <Box
                            key={`arg-${currentIndex++}`}
                            sx={{
                              backgroundColor: '#fef3c7', // Light yellow
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#92400e',
                              fontStyle: 'italic',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {part}
                            <IconButton
                              size="small"
                              onClick={() => {
                                const newText = advancedFilterText.replace(new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`), '').trim();
                                setAdvancedFilterText(newText);
                              }}
                              sx={{ 
                                p: 0, 
                                ml: 0.5,
                                '&:hover': { backgroundColor: 'rgba(146, 64, 14, 0.1)' }
                              }}
                            >
                              <Icon icon="mdi:close" style={{ fontSize: '12px' }} />
                            </IconButton>
                          </Box>
                        );
                      } else {
                        // Regular text (values)
                        elements.push(
                          <Box
                            key={`value-${currentIndex++}`}
                            sx={{
                              backgroundColor: '#f3f4f6', // Light gray
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: '#374151',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {part}
                            <IconButton
                              size="small"
                              onClick={() => {
                                const newText = advancedFilterText.replace(new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`), '').trim();
                                setAdvancedFilterText(newText);
                              }}
                              sx={{ 
                                p: 0, 
                                ml: 0.5,
                                '&:hover': { backgroundColor: 'rgba(55, 65, 81, 0.1)' }
                              }}
                            >
                              <Icon icon="mdi:close" style={{ fontSize: '12px' }} />
                            </IconButton>
                          </Box>
                        );
                      }
                      
                      remainingText = remainingText.substring(part.length);
                    }
                  }
                  
                  return elements;
                  
                  // Add value input section if in value input mode
                  if (isValueInputMode) {
                    elements.push(
                      <Box
                        key="value-input"
                        sx={{
                          backgroundColor: '#fef3c7', // Light yellow
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '14px',
                          color: '#92400e',
                          border: '1px dashed #f59e0b',
                          minWidth: '100px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {currentValueInput || 'Enter value...'}
                        <IconButton
                          size="small"
                          onClick={() => {
                            setIsValueInputMode(false);
                            setCurrentValueInput('');
                          }}
                          sx={{ 
                            p: 0, 
                            ml: 0.5,
                            '&:hover': { backgroundColor: 'rgba(146, 64, 14, 0.1)' }
                          }}
                        >
                          <Icon icon="mdi:close" style={{ fontSize: '12px' }} />
                        </IconButton>
                      </Box>
                    );
                  }
                  
                  return elements;
                })()}
                
                {/* Invisible input for typing */}
                {!isValueInputMode ? (
                  <input
                ref={filterInputRef}
                    type="text"
                    value=""
                    onChange={(e) => handleAdvancedFilterInputChange(advancedFilterText + e.target.value)}
                onKeyDown={handleAdvancedFilterKeyDown}
                onFocus={() => {
                  setIsInputFocused(true);
                      const suggestions = generateSuggestions(advancedFilterText);
                  setSuggestions(suggestions);
                  setShowSuggestions(suggestions.length > 0);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setIsInputFocused(false);
                    setShowSuggestions(false);
                  }, 200);
                }}
                          style={{ 
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: '14px',
                      flex: 1,
                      minWidth: '100px'
                    }}
                    placeholder={t('wizard.advancedFilterPlaceholder', 'Start typing to build a filter...')}
                  />
                ) : (
                  <input
                    ref={valueInputRef}
                    type="text"
                    value={currentValueInput}
                    onChange={(e) => handleValueInputChange(e.target.value)}
                    onKeyDown={handleValueInputKeyDown}
                                    style={{ 
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: '14px',
                      flex: 1,
                      minWidth: '100px',
                      backgroundColor: '#fef3c7',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: '#92400e'
                    }}
                    placeholder={t('wizard.enterValue', 'Enter value and press Enter...')}
                  />
                )}
                
                {/* Action buttons */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 'auto' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setShowAdvancedFilterBuilder(true)}
                        startIcon={<Icon icon="mdi:hammer-wrench" />}
                      >
                        {t('wizard.builder', 'Builder')}
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={applyAdvancedFilter}
                        disabled={!advancedFilterText.trim()}
                      >
                        {t('wizard.apply', 'Apply')}
                      </Button>
                  {Object.keys(activeFilters).length > 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={clearAllFilters}
                      startIcon={<Icon icon="mdi:close" />}
                    >
                      {t('wizard.clearFilters', 'Clear')}
                    </Button>
                  )}
                    </Box>
              </Box>
              
              {/* Suggestions Dropdown */}
              <Collapse in={showSuggestions && suggestions.length > 0}>
                <Paper 
                  sx={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    zIndex: 1000,
                    maxHeight: 300,
                    overflow: 'auto'
                  }}
                >
                  <List dense>
                    {suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                                              <ListItem
                        key={index}
                        component="div"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }}
                        onClick={() => {
                          const filterState = parseFilterState(advancedFilterText);
                          
                          if (!filterState.field) {
                            // Step 1: Add field
                              setAdvancedFilterText(suggestion.value + ' ');
                          } else if (!filterState.operator) {
                            // Step 2: Add operator
                            setAdvancedFilterText(advancedFilterText + ' ' + suggestion.value + ' ');
                            
                            // Check if operator needs argument
                            const selectedOp = getOperatorsForFieldType(filterState.field!.type).find(op => op.value === suggestion.value);
                            if (selectedOp && selectedOp.needsArgument) {
                              // Enter value input mode
                              setIsValueInputMode(true);
                              setCurrentValueInput('');
                              setShowSuggestions(false);
                              
                              // Focus the value input after a short delay
                              setTimeout(() => {
                                valueInputRef.current?.focus();
                              }, 100);
                              return;
                            }
                          } else if (!filterState.argument && suggestion.needsArgument) {
                            // Step 3: Add argument placeholder
                            setAdvancedFilterText(advancedFilterText + ' [Enter value] ');
                          }
                          
                            setShowSuggestions(false);
                            // Focus back to the input
                            setTimeout(() => {
                              filterInputRef.current?.focus();
                            }, 100);
                          }}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <ListItemIcon>
                            <Icon 
                              icon={
                                suggestion.type === 'field' ? 'mdi:table-column' :
                                suggestion.type === 'operator' ? 'mdi:function-variant' :
                                suggestion.type === 'function' ? 'mdi:function' :
                                'mdi:format-text'
                              } 
                              style={{
                                color: suggestion.type === 'function' ? '#3b82f6' : '#6b7280'
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText 
                            primary={suggestion.label}
                            secondary={suggestion.description || suggestion.value}
                            primaryTypographyProps={{
                              sx: {
                                fontWeight: suggestion.type === 'function' ? 600 : 400,
                                color: suggestion.type === 'function' ? '#3b82f6' : 'inherit'
                              }
                            }}
                            secondaryTypographyProps={{
                              sx: {
                                fontSize: '0.75rem',
                                color: suggestion.type === 'function' ? '#6b7280' : 'inherit'
                              }
                            }}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText 
                          primary={t('wizard.noFieldsAvailable', 'No filterable fields available')}
                          primaryTypographyProps={{
                            sx: {
                              color: '#6b7280',
                              fontStyle: 'italic'
                            }
                          }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Collapse>
            </Box>

            {/* Active Filters Display */}
            {Object.keys(activeFilters).length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon="mdi:filter-check" style={{ fontSize: '16px', color: '#059669' }} />
                  {t('wizard.activeFilters', 'Active Filters')} ({Object.keys(activeFilters).length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(activeFilters).map(([filterKey, value]) => {
                    const [fieldId, operator] = filterKey.split(':');
                    const field = filterableFields.find(f => f.id === fieldId);
                    return (
                      <Chip
                        key={filterKey}
                        label={`${field?.name || fieldId} ${operator} ${value}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        onDelete={() => {
                          const newFilters = { ...activeFilters };
                          delete newFilters[filterKey];
                          setActiveFilters(newFilters);
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Filter Help */}
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                {(() => {
                  const filterState = parseFilterState(advancedFilterText);
                  if (isValueInputMode) {
                    return t('wizard.filterHelpValueInput', 'Enter the value and press Enter to complete the filter. Press Escape to cancel.');
                  } else if (!filterState.field) {
                    return t('wizard.filterHelpStep1', 'Step 1: Start typing to search for a field. Fields are highlighted in blue.');
                  } else if (!filterState.operator) {
                    return t('wizard.filterHelpStep2', 'Step 2: Select an operator for this field. Operators are highlighted in green.');
                  } else if (!filterState.argument) {
                    return t('wizard.filterHelpStep3', 'Step 3: Enter a value for the filter. Values are highlighted in yellow.');
                  } else {
                    return t('wizard.filterHelpComplete', 'Filter is complete! Click Apply to use this filter.');
                  }
                })()}
                <br />
                <strong>💡 Tip:</strong> {(() => {
                  const filterState = parseFilterState(advancedFilterText);
                  if (isValueInputMode) {
                    return 'Type your value and press Enter to complete the filter.';
                  } else if (!filterState.field) {
                    return 'Type the field name to see available fields.';
                  } else if (!filterState.operator) {
                    return 'Choose an operator based on the field type.';
                  } else if (!filterState.argument) {
                    return 'Enter the value you want to filter by.';
                  } else {
                    return 'Your filter is ready to apply!';
                  }
                })()}
              </Typography>
            </Alert>

            {/* Records Table */}
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Typography>{t('common.loading', 'Loading...')}</Typography>
              </Box>
            ) : error ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Typography color="error">{t('common.error', 'Error loading records')}</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {displayFields.map((field) => {
                        // Check if this field is currently sorted
                        const sortInfo = selectedSorting.find(sort => sort.startsWith(field.name + ' '));
                        const isSorted = !!sortInfo;
                        const sortDirection = sortInfo ? sortInfo.split(' ')[1] : null;
                        
                        return (
                          <TableCell key={field.id} sx={{ fontWeight: 'bold' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {field.name}
                                {isSorted && (
                                  <Icon 
                                    icon={sortDirection === 'ASC' ? 'mdi:sort-ascending' : 'mdi:sort-descending'} 
                                    style={{ 
                                      fontSize: '14px',
                                      color: '#3b82f6'
                                    }} 
                                  />
                                )}
                                {isLoading && isSorted && (
                                  <Icon 
                                    icon="mdi:loading" 
                                    style={{ 
                                      fontSize: '12px',
                                      color: '#6b7280',
                                      animation: 'spin 1s linear infinite'
                                    }} 
                                  />
                                )}
                              </Box>
                              <IconButton
                                size="small"
                                onClick={(e) => handleColumnMenuOpen(e, field.name)}
                                sx={{ padding: '2px' }}
                                disabled={isLoading}
                              >
                                <Icon icon="mdi:dots-vertical" style={{ fontSize: '16px' }} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {finalRecords.map((record) => (
                      <TableRow key={record.id}>
                        {displayFields.map((field) => (
                          <TableCell key={field.id}>
                            {getFieldValue(record as DirectoryRecord, field)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Column Menu */}
            <Menu
              anchorEl={columnMenuAnchor}
              open={Boolean(columnMenuAnchor)}
              onClose={handleColumnMenuClose}
            >
              {/* Check if this column is currently sorted */}
              {(() => {
                const sortInfo = selectedColumn ? selectedSorting.find(sort => sort.startsWith(selectedColumn + ' ')) : null;
                const isSorted = !!sortInfo;
                const sortDirection = sortInfo ? sortInfo.split(' ')[1] : null;
                
                return (
                  <>
                    <MenuItem onClick={() => handleColumnAction('sort-asc')}>
                      <ListItemIcon>
                        <Icon icon="mdi:sort-ascending" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Sort A to Z" 
                        secondary={isSorted && sortDirection === 'ASC' ? 'Currently sorted' : undefined}
                      />
                    </MenuItem>
                    <MenuItem onClick={() => handleColumnAction('sort-desc')}>
                      <ListItemIcon>
                        <Icon icon="mdi:sort-descending" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Sort Z to A" 
                        secondary={isSorted && sortDirection === 'DESC' ? 'Currently sorted' : undefined}
                      />
                    </MenuItem>
                    {isSorted && (
                      <MenuItem onClick={() => handleColumnAction('clear-sort')}>
                        <ListItemIcon>
                          <Icon icon="mdi:sort-variant-remove" />
                        </ListItemIcon>
                        <ListItemText primary="Clear sorting" />
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={() => handleColumnAction('filter')}>
                      <ListItemIcon>
                        <Icon icon="mdi:filter" />
                      </ListItemIcon>
                      <ListItemText primary="Filter" />
                    </MenuItem>
                    <MenuItem onClick={() => handleColumnAction('group')}>
                      <ListItemIcon>
                        <Icon icon="mdi:group" />
                      </ListItemIcon>
                      <ListItemText primary="Group by this column" />
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => handleColumnAction('hide')}>
                      <ListItemIcon>
                        <Icon icon="mdi:eye-off" />
                      </ListItemIcon>
                      <ListItemText primary="Hide column" />
                    </MenuItem>
                    <MenuItem onClick={() => handleColumnAction('pin')}>
                      <ListItemIcon>
                        <Icon icon="mdi:pin" />
                      </ListItemIcon>
                      <ListItemText primary="Pin column" />
                    </MenuItem>
                    <MenuItem onClick={() => handleColumnAction('resize')}>
                      <ListItemIcon>
                        <Icon icon="mdi:resize" />
                      </ListItemIcon>
                      <ListItemText primary="Resize column" />
                    </MenuItem>
                  </>
                );
              })()}
            </Menu>
          </CardContent>
        </Card>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Tooltip title={t('wizard.grouping', 'Grouping')}>
                <Button
                  size="small"
                  variant={showGrouping ? 'contained' : 'outlined'}
                  onClick={() => setShowGrouping(!showGrouping)}
                  startIcon={<Icon icon="mdi:group" />}
                >
                  {t('wizard.grouping', 'Grouping')}
                </Button>
              </Tooltip>
              <Tooltip title={t('wizard.joins', 'Joins')}>
                <Button
                  size="small"
                  variant={showJoins ? 'contained' : 'outlined'}
                  onClick={() => setShowJoins(!showJoins)}
                  startIcon={<Icon icon="mdi:link" />}
                >
                  {t('wizard.joins', 'Joins')}
                </Button>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Configuration Panels */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {/* Other configuration panels remain the same */}

          {showGrouping && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon="mdi:group" style={{ fontSize: '20px', color: '#3b82f6' }} />
                    {t('wizard.grouping', 'Grouping')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableGrouping.map((group) => (
                      <Chip
                        key={group}
                        label={group}
                        onClick={() => handleGroupingToggle(group)}
                        color={selectedGrouping.includes(group) ? 'primary' : 'default'}
                        variant={selectedGrouping.includes(group) ? 'filled' : 'outlined'}
                        size="small"
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {showJoins && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon="mdi:link" style={{ fontSize: '20px', color: '#3b82f6' }} />
                    {t('wizard.joins', 'Joins')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableJoins.map((join) => (
                      <Chip
                        key={join}
                        label={join}
                        onClick={() => handleJoinToggle(join)}
                        color={selectedJoins.includes(join) ? 'primary' : 'default'}
                        variant={selectedJoins.includes(join) ? 'filled' : 'outlined'}
                        size="small"
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>



      {/* Advanced Filter Builder Dialog */}
      <Dialog
        open={showAdvancedFilterBuilder}
        onClose={() => setShowAdvancedFilterBuilder(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            {t('wizard.advancedFilterBuilder', 'Advanced Filter Builder')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {advancedFilterGroups.map((group, groupIndex) => (
              <Card key={group.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">
                      {t('wizard.filterGroup', 'Filter Group {{index}}', { index: groupIndex + 1 })}
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>{t('wizard.joinOperator', 'Join Operator')}</InputLabel>
                      <Select
                        value={group.joinOperator || 'AND'}
                        onChange={(e) => {
                          setAdvancedFilterGroups(prev => 
                            prev.map(g => 
                              g.id === group.id 
                                ? { ...g, joinOperator: e.target.value as 'AND' | 'OR' }
                                : g
                            )
                          );
                        }}
                      >
                        <MenuItem value="AND">AND</MenuItem>
                        <MenuItem value="OR">OR</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {group.conditions.map((condition, conditionIndex) => (
                    <Box key={condition.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>{t('wizard.field', 'Field')}</InputLabel>
                            <Select
                              value={condition.field}
                              onChange={(e) => updateCondition(group.id, condition.id, '', 'field', e.target.value)}
                            >
                              {filterableFields.map((field) => (
                                <MenuItem key={field.name} value={field.name}>
                                  {field.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>{t('wizard.operator', 'Operator')}</InputLabel>
                            <Select
                              value={condition.operator}
                              onChange={(e) => updateCondition(group.id, condition.id, '', 'operator', e.target.value)}
                              disabled={!condition.field}
                            >
                              {condition.field && getFilterOperators(
                                filterableFields.find(f => f.name === condition.field)?.type || 'text'
                              ).map((op) => (
                                <MenuItem key={op.value} value={op.value}>
                                  {op.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label={t('wizard.value', 'Value')}
                            value={condition.value}
                            onChange={(e) => updateCondition(group.id, condition.id, '', 'value', e.target.value)}
                            disabled={!condition.operator || ['blank', 'notBlank', 'true', 'false'].includes(condition.operator)}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={2}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {/* Function button */}
                            <Tooltip title={condition.function ? `Function: ${condition.function}` : 'Add Excel function'}>
                              <IconButton
                                size="small"
                                onClick={() => handleBuilderFunctionOpen(condition.id)}
                                color={condition.function ? 'primary' : 'default'}
                                sx={{ 
                                  border: condition.function ? '2px solid' : '1px solid',
                                  borderColor: condition.function ? 'primary.main' : 'grey.300'
                                }}
                              >
                                <Icon icon="mdi:function" />
                              </IconButton>
                            </Tooltip>
                            
                            {/* Remove button */}
                            <IconButton
                              color="error"
                              onClick={() => removeCondition(group.id, condition.id)}
                              disabled={group.conditions.length === 1}
                            >
                              <Icon icon="mdi:delete" />
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      {/* Function display */}
                      {condition.function && (
                        <Box sx={{ mt: 1, p: 1, bgcolor: 'primary.50', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Icon icon="mdi:function" size="small" />
                            Function: {condition.function}
                            {condition.functionParams && condition.functionParams.length > 0 && (
                              <span> - Params: {condition.functionParams.join(', ')}</span>
                            )}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}

                  <Button
                    size="small"
                    startIcon={<Icon icon="mdi:plus" />}
                    onClick={() => addCondition(group.id)}
                  >
                    {t('wizard.addCondition', 'Add Condition')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAdvancedFilterBuilder(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={() => {
              applyAdvancedFilter();
              setShowAdvancedFilterBuilder(false);
            }}
            variant="contained"
          >
            {t('wizard.apply', 'Apply')}
          </Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
};

export default DataFilteringStep; 