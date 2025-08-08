import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Avatar, 
  Paper,
  Menu,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import type { Company } from '@/api/services/companies';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/api/services/companies';
import InsertWizard from '../companies/components/InsertWizard';

interface InsertionData {
  type: string;
  directory?: any;
  filters?: string[];
  sorting?: string[];
  grouping?: string[];
  joins?: string[];
}

interface WireframePreviewProps {
  visible: boolean;
  position: { x: number; y: number };
  data: InsertionData | null;
  onPlace: (position: { x: number; y: number }) => void;
}

const WireframePreview: React.FC<WireframePreviewProps> = ({ 
  visible, 
  position, 
  data, 
  onPlace 
}) => {
  const { t } = useTranslation();

  console.log('WireframePreview render:', { visible, position, data });

  if (!visible || !data || data.type !== 'table') {
    console.log('WireframePreview not rendering:', { visible, data: data?.type });
    return null;
  }

  const handleClick = () => {
    onPlace(position);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        pointerEvents: 'auto',
        cursor: 'crosshair',
      }}
      onClick={handleClick}
    >
      {/* Table Wireframe */}
      <Box
        sx={{
          width: 600,
          border: '2px dashed #3b82f6',
          borderRadius: 1,
          bgcolor: 'rgba(59, 130, 246, 0.05)',
          p: 2,
          backdropFilter: 'blur(4px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Table Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 2,
          pb: 1,
          borderBottom: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <Icon icon="mdi:table" style={{ fontSize: '20px', color: '#3b82f6' }} />
          <Typography variant="subtitle1" sx={{ color: '#3b82f6', fontWeight: 600 }}>
            {data.directory?.name || 'Table'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280', ml: 'auto' }}>
            {t('reports.clickToPlace', 'Click to place')}
          </Typography>
        </Box>

        {/* Table Preview */}
        <TableContainer sx={{ maxHeight: 200 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {data.directory?.fields?.slice(0, 4).map((field: any, index: number) => (
                  <TableCell 
                    key={field.id || index}
                    sx={{ 
                      fontWeight: 'bold',
                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                      borderBottom: '2px solid rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    {field.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Sample rows */}
              {[1, 2, 3].map((row) => (
                <TableRow key={row} hover>
                  {data.directory?.fields?.slice(0, 4).map((field: any, index: number) => (
                    <TableCell key={field.id || index}>
                      <Box sx={{ 
                        height: 16, 
                        bgcolor: 'rgba(59, 130, 246, 0.1)', 
                        borderRadius: 1,
                        width: `${Math.random() * 60 + 40}%`
                      }} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Configuration Summary */}
        <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            {data.filters?.length ? `${data.filters.length} filters` : 'No filters'} • 
            {data.sorting?.length ? `${data.sorting.length} sorts` : 'No sorting'} • 
            {data.grouping?.length ? `${data.grouping.length} groups` : 'No grouping'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const ReportEditorPage: React.FC = () => {
  const { t } = useTranslation();
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [documentTitle, setDocumentTitle] = useState('Untitled document');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [insertMenuAnchor, setInsertMenuAnchor] = useState<null | HTMLElement>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedInsertType, setSelectedInsertType] = useState<string>('');
  
  // Wireframe preview state
  const [wireframeVisible, setWireframeVisible] = useState(false);
  const [wireframePosition, setWireframePosition] = useState({ x: 0, y: 0 });
  const [insertionData, setInsertionData] = useState<InsertionData | null>(null);
  const [placedElements, setPlacedElements] = useState<Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: InsertionData;
  }>>([]);
  
  const contentRef = useRef<HTMLDivElement>(null);

  // Debug state changes
  useEffect(() => {
    console.log('State changed:', {
      wireframeVisible,
      insertionData: insertionData ? { type: insertionData.type, directory: insertionData.directory?.name } : null,
      placedElements: placedElements.length
    });
  }, [wireframeVisible, insertionData, placedElements]);

  // Fetch company data
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const response = await companiesApi.getCompanies();
      const companies = response.data.companies;
      return companies.find(c => c.id === companyId);
    },
    enabled: !!companyId,
  });

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentTitle(event.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleInsertMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setInsertMenuAnchor(event.currentTarget);
  };

  const handleInsertMenuClose = () => {
    setInsertMenuAnchor(null);
  };

  const handleInsertOption = (option: string) => {
    setSelectedInsertType(option);
    setWizardOpen(true);
    handleInsertMenuClose();
  };

  const handleWizardClose = () => {
    setWizardOpen(false);
    setSelectedInsertType('');
    setWireframeVisible(false);
    setInsertionData(null);
  };

  const handleWizardComplete = (data: InsertionData) => {
    console.log('Wizard completed with data:', data);
    console.log('Setting states: insertionData, wireframeVisible=true, wizardOpen=false');
    setInsertionData(data);
    setWireframeVisible(true);
    setWizardOpen(false);
    setSelectedInsertType('');
  };

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (wireframeVisible && insertionData) {
      console.log('Mouse move - wireframe visible:', wireframeVisible, 'insertionData:', insertionData);
      // Get the Paper component's position
      const paperElement = event.currentTarget as HTMLElement;
      const rect = paperElement.getBoundingClientRect();
      
      // Calculate position relative to the Paper component, accounting for padding
      const newPosition = {
        x: event.clientX - rect.left - 32, // 32px is the Paper's padding (p: 4 = 32px)
        y: event.clientY - rect.top - 32,
      };
      
      console.log('New wireframe position:', newPosition);
      setWireframePosition(newPosition);
    }
  }, [wireframeVisible, insertionData]);

  const handleMouseLeave = useCallback(() => {
    if (wireframeVisible) {
      setWireframeVisible(false);
    }
  }, [wireframeVisible]);

  const handleWireframePlace = useCallback((position: { x: number; y: number }) => {
    if (insertionData) {
      const newElement = {
        id: `element-${Date.now()}`,
        type: insertionData.type,
        position,
        data: insertionData,
      };
      
      setPlacedElements(prev => [...prev, newElement]);
      setWireframeVisible(false);
      setInsertionData(null);
    }
  }, [insertionData]);

  const handleClose = () => {
    navigate(-1);
  };

  if (companyLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!company) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Company not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#fff',
        }}
      >
        {/* Left side - Document title and file icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon 
            icon="mdi:file-document" 
            style={{ fontSize: '24px', color: '#5f6368' }} 
          />
          {isEditingTitle ? (
            <TextField
              value={documentTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              autoFocus
              variant="standard"
              sx={{
                '& .MuiInput-underline:before': { borderBottom: 'none' },
                '& .MuiInput-underline:after': { borderBottom: 'none' },
                '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
              }}
            />
          ) : (
            <Typography
              variant="h6"
              onClick={handleTitleClick}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#f1f3f4',
                  borderRadius: 1,
                  px: 1,
                },
              }}
            >
              {documentTitle}
            </Typography>
          )}
        </Box>

        {/* Center - Insert menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleInsertMenuOpen}
            startIcon={<Icon icon="mdi:plus" />}
            sx={{
              textTransform: 'none',
              borderColor: '#dadce0',
              color: '#5f6368',
              '&:hover': {
                borderColor: '#dadce0',
                bgcolor: '#f8f9fa',
              },
            }}
          >
            {t('reports.insert', 'Insert')}
          </Button>
          <Menu
            anchorEl={insertMenuAnchor}
            open={Boolean(insertMenuAnchor)}
            onClose={handleInsertMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                borderRadius: 2,
              }
            }}
          >
            <MenuItem onClick={() => handleInsertOption('text')}>
              <Icon icon="mdi:format-text" style={{ marginRight: '12px', fontSize: '20px' }} />
              {t('reports.insertText', 'Text')}
            </MenuItem>
            <MenuItem onClick={() => handleInsertOption('table')}>
              <Icon icon="mdi:table" style={{ marginRight: '12px', fontSize: '20px' }} />
              {t('reports.insertTable', 'Table')}
            </MenuItem>
            <MenuItem onClick={() => handleInsertOption('chart')}>
              <Icon icon="mdi:chart-line" style={{ marginRight: '12px', fontSize: '20px' }} />
              {t('reports.insertChart', 'Chart')}
            </MenuItem>
          </Menu>
        </Box>

        {/* Right side - Account details and close button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {company.name}
          </Typography>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#3b82f6' }}>
            {company.name?.[0] || 'U'}
          </Avatar>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClose}
            sx={{
              textTransform: 'none',
              borderColor: '#dadce0',
              color: '#5f6368',
              '&:hover': {
                borderColor: '#dadce0',
                bgcolor: '#f8f9fa',
              },
            }}
          >
            {t('common.close', 'Close')}
          </Button>
        </Box>
      </Box>

             {/* Content area - Google Docs style with placed elements */}
       <Box
         ref={contentRef}
         sx={{
           flex: 1,
           display: 'flex',
           justifyContent: 'center',
           alignItems: 'flex-start',
           bgcolor: '#fafafa',
           p: 4,
           position: 'relative',
         }}
       >
                 <Paper
           elevation={0}
           sx={{
             width: '100%',
             maxWidth: '816px', // Standard A4 width
             minHeight: '1056px', // Standard A4 height
             bgcolor: '#fff',
             borderRadius: 0,
             p: 4,
             boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
             position: 'relative',
             cursor: wireframeVisible ? 'crosshair' : 'default',
           }}
           onMouseMove={handleMouseMove}
           onMouseLeave={handleMouseLeave}
         >
          {/* Placed Elements */}
          {placedElements.map((element) => (
            <Box
              key={element.id}
              sx={{
                position: 'absolute',
                left: element.position.x,
                top: element.position.y,
                zIndex: 1,
              }}
            >
              {element.type === 'table' && (
                <Box sx={{ width: 600 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 2,
                    pb: 1,
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <Icon icon="mdi:table" style={{ fontSize: '20px', color: '#3b82f6' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {element.data.directory?.name || 'Table'}
                    </Typography>
                  </Box>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {element.data.directory?.fields?.slice(0, 4).map((field: any, index: number) => (
                            <TableCell 
                              key={field.id || index}
                              sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}
                            >
                              {field.name}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[1, 2, 3].map((row) => (
                          <TableRow key={row}>
                            {element.data.directory?.fields?.slice(0, 4).map((field: any, index: number) => (
                              <TableCell key={field.id || index}>
                                Sample data {row}-{index + 1}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          ))}

          {/* Wireframe Preview */}
          <WireframePreview
            visible={wireframeVisible}
            position={wireframePosition}
            data={insertionData}
            onPlace={handleWireframePlace}
          />

          {/* Empty content area - only show if no elements placed */}
          {placedElements.length === 0 && (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Icon 
                  icon="mdi:cursor-text" 
                  style={{ fontSize: '48px', marginBottom: '16px' }} 
                />
                <Typography variant="body1">
                  {t('reports.startTyping', 'Start typing to create your report...')}
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Insert Wizard */}
      <InsertWizard
        open={wizardOpen}
        onClose={handleWizardClose}
        insertType={selectedInsertType}
        company={company}
        fullScreen={true}
        onComplete={handleWizardComplete}
      />
    </Box>
  );
};

export default ReportEditorPage; 