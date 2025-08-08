import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReportWizard } from '../../components/reportBuilder/ReportWizard/ReportWizard';
import { ReportTemplate } from '../../types/reportTemplate';

const ReportWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId?: string }>();

  const handleComplete = (template: ReportTemplate) => {
    // Navigate back to reports page after completion
    navigate('/reports');
  };

  const handleCancel = () => {
    // Navigate back to reports page on cancel
    navigate('/reports');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <ReportWizard
        templateId={templateId}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ReportWizardPage; 