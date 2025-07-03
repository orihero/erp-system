import React from 'react';

type WizardStepProps = {
  step: unknown;
  data: unknown;
  wizardData: unknown;
  validation: unknown;
  onDataChange: (data: unknown) => void;
};

export const WizardStep: React.FC<WizardStepProps> = () => (
  <div>Wizard Step Placeholder</div>
); 