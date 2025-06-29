import React, { useState } from 'react';
import BankStatementUpload from './BankStatementUpload';
import BankStatementEditor from './BankStatementEditor';

interface BankStatementRecord {
  id?: string;
  fileName: string;
  documentDate: string;
  account: string;
  organizationName: string;
  documentNumber: number;
  documentType: number;
  branch: number;
  debitTurnover: number;
  creditTurnover: number;
  paymentPurpose: string;
  cashSymbol?: number;
  taxId: string;
}

const BankStatement: React.FC = () => {
  const [currentView, setCurrentView] = useState<'upload' | 'editor'>('upload');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedRecords, setSelectedRecords] = useState<BankStatementRecord[]>([]);

  const handleViewRecords = (fileName: string, records: BankStatementRecord[]) => {
    setSelectedFileName(fileName);
    setSelectedRecords(records);
    setCurrentView('editor');
  };

  const handleBackToUpload = () => {
    setCurrentView('upload');
    setSelectedFileName('');
    setSelectedRecords([]);
  };

  const handleSaveRecords = async (records: BankStatementRecord[]) => {
    // In a real implementation, you would save the records to the backend
    // using the existing directory records API or a new dedicated API.
    // For now, this is a mock save operation.
    console.log('Saving records:', records);
    
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Records saved successfully');
        resolve();
      }, 1000);
    });
  };

  if (currentView === 'editor') {
    return (
      <BankStatementEditor
        fileName={selectedFileName}
        records={selectedRecords}
        onBack={handleBackToUpload}
        onSave={handleSaveRecords}
      />
    );
  }

  return (
    <BankStatementUpload onViewRecords={handleViewRecords} />
  );
};

export default BankStatement; 