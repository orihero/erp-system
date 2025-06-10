import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Preview';
import DownloadIcon from '@mui/icons-material/Download';
import ReportConfig from './components/ReportConfig';
import useReportConfig from '../../hooks/useReportConfig';
import reportService from '../../services/reportService';

const ReportConfigPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    config,
    updateConfig,
    saveConfig,
    previewReport,
    generateReport,
  } = useReportConfig();

  useEffect(() => {
    const loadTemplate = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const template = await reportService.getTemplate(id);
        updateConfig(template);
      } catch (err) {
        setError('Failed to load report template');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [id, updateConfig]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const savedTemplate = await saveConfig();
      setSuccess('Report template saved successfully');
      if (!id) {
        navigate(`/reports/config/${savedTemplate.id}`);
      }
    } catch (err) {
      setError('Failed to save report template');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      setLoading(true);
      const preview = await previewReport();
      // TODO: Implement preview display
      console.log('Preview data:', preview);
    } catch (err) {
      setError('Failed to preview report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const blob = await generateReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.name || 'report'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to generate report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          {id ? 'Edit Report Template' : 'Create Report Template'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={handlePreview}
            disabled={loading || !config.id}
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleGenerate}
            disabled={loading || !config.id}
          >
            Generate
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 2 }}>
          <ReportConfig />
        </Paper>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ReportConfigPage; 