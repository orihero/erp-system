import React, { useState, useCallback } from 'react';
import { WizardStepProps, BasicInfoData } from '../../../../types/wizard';
import { Input } from '../../ReportWizard/Input';
import axios from 'axios';

interface NameInputProps extends WizardStepProps<BasicInfoData> {
  companyId: string;
}

export const NameInput: React.FC<NameInputProps> = ({ data, onDataChange, companyId }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const validateName = useCallback(async (value: string): Promise<string[] | undefined> => {
    if (!value || !companyId) return ['Name and company are required.'];
    try {
      const res = await axios.post('/api/report-templates/validate-name', {
        name: value,
        companyId,
      });
      if (res.data.isAvailable) {
        setSuggestions([]);
        return undefined;
      } else {
        setSuggestions(res.data.suggestions || []);
        return ['Name is already taken.'];
      }
    } catch (err: any) {
      setSuggestions([]);
      return [err.response?.data?.error || 'Validation failed.'];
    }
  }, [companyId]);

  return (
    <div>
      <Input
        label="Template Name"
        value={data.name || ''}
        onChange={e => onDataChange({ ...data, name: e.target.value })}
        onValidate={validateName}
        required
        placeholder="Enter a unique template name"
        debounceMs={400}
      />
      {suggestions.length > 0 && (
        <div className="text-sm text-gray-500 mt-1">
          Suggestions: {suggestions.map(s => (
            <span key={s} className="inline-block bg-gray-100 rounded px-2 py-1 mr-2 cursor-pointer" onClick={() => onDataChange({ ...data, name: s })}>{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}; 