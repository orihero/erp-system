import React from 'react';
import { WizardStepProps, BasicInfoData } from '../../../../types/wizard';
import { NameInput } from './NameInput';
import { CategorySelector } from './CategorySelector';
import { DescriptionEditor } from './DescriptionEditor';
import { AdvancedOptions } from './AdvancedOptions';

interface BasicInfoStepExtraProps {
  companyId: string;
}

// Accept companyId as a prop, but keep WizardStepProps for wizard compatibility
export const BasicInfoStep: React.FC<WizardStepProps & BasicInfoStepExtraProps> = (props) => {
  const { companyId, data, onDataChange, wizardData, validation } = props;
  const basicInfoData = data as BasicInfoData;
  return (
    <div className="flex flex-col gap-6">
      <NameInput data={basicInfoData} onDataChange={onDataChange} companyId={companyId} wizardData={wizardData} validation={validation} />
      <CategorySelector data={basicInfoData} onDataChange={onDataChange} wizardData={wizardData} validation={validation} />
      <DescriptionEditor data={basicInfoData} onDataChange={onDataChange} wizardData={wizardData} validation={validation} />
      <AdvancedOptions data={basicInfoData} onDataChange={onDataChange} wizardData={wizardData} validation={validation} />
    </div>
  );
}; 