import React, { useState, useEffect } from 'react';
import { WizardStepProps } from '../../../types/wizard';
import { useReportWizard } from '../hooks/useReportWizard';
import { reportTemplateAPI } from '../../services/api/reportTemplates';

const PREVIEW_FORMATS = [
  { value: 'html', label: 'HTML' },
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
];
const PREVIEW_ROLES = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'guest', label: 'Guest' },
];

export const ReviewStep: React.FC<WizardStepProps> = () => {
  const { aggregateValidations, wizardData } = useReportWizard();
  const validationSummary = aggregateValidations();

  // Preview state
  const [format, setFormat] = useState('html');
  const [role, setRole] = useState('user');
  const [sampleData, setSampleData] = useState('{}');
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch preview on change
  useEffect(() => {
    let cancelled = false;
    async function fetchPreview() {
      setLoading(true);
      setError(null);
      setPreviewHtml('');
      try {
        const parsedSampleData = sampleData ? JSON.parse(sampleData) : {};
        const result = await reportTemplateAPI.previewTemplate({
          wizardData,
          format,
          role,
          sampleData: parsedSampleData,
        });
        if (!cancelled) {
          if (format === 'html' && result.html) {
            setPreviewHtml(result.html);
          } else if (result.error) {
            setError(result.error);
          } else {
            setError('Preview not available for this format.');
          }
        }
      } catch (err: unknown) {
        setError((err instanceof Error ? err.message : 'Failed to load preview'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPreview();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardData, format, role, sampleData]);

  return (
    <div className="review-step-container" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Validation Summary */}
      <section>
        <h2>Validation Summary</h2>
        {validationSummary.isValid ? (
          <div style={{ color: 'green' }}>All checks passed. Ready for deployment.</div>
        ) : (
          <div style={{ color: 'red' }}>Critical issues detected. Please resolve before deployment.</div>
        )}
        <ul>
          {validationSummary.errors.map((err, idx) => (
            <li key={idx} style={{ color: 'red' }}>Error: {err.message} {err.field && <span>({err.field})</span>}</li>
          ))}
          {validationSummary.warnings.map((warn, idx) => (
            <li key={idx} style={{ color: 'orange' }}>Warning: {warn.message} {warn.field && <span>({warn.field})</span>}</li>
          ))}
          {validationSummary.recommendations && validationSummary.recommendations.map((rec, idx) => (
            <li key={idx} style={{ color: 'blue' }}>Recommendation: {rec.message} {rec.field && <span>({rec.field})</span>}</li>
          ))}
        </ul>
      </section>

      {/* Configuration Overview */}
      <section>
        <h2>Configuration Overview</h2>
        <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>
          {JSON.stringify(wizardData, null, 2)}
        </pre>
      </section>

      {/* Interactive Preview */}
      <section>
        <h2>Template Preview</h2>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
          <label>
            Format:
            <select value={format} onChange={e => setFormat(e.target.value)} style={{ marginLeft: 8 }}>
              {PREVIEW_FORMATS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          <label>
            Role:
            <select value={role} onChange={e => setRole(e.target.value)} style={{ marginLeft: 8 }}>
              {PREVIEW_ROLES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          <label style={{ flex: 1 }}>
            Sample Data (JSON):
            <input
              type="text"
              value={sampleData}
              onChange={e => setSampleData(e.target.value)}
              style={{ width: '100%', marginLeft: 8 }}
              placeholder="{}"
            />
          </label>
        </div>
        {loading && <div style={{ color: '#888' }}>Loading preview...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && format === 'html' && previewHtml && (
          <iframe
            title="Template Preview"
            srcDoc={previewHtml}
            style={{ width: '100%', minHeight: 400, border: '1px solid #ccc', borderRadius: 8, background: '#fff' }}
          />
        )}
        {!loading && !error && format !== 'html' && (
          <div style={{ color: '#888' }}>[Preview for this format is not yet implemented]</div>
        )}
      </section>

      {/* Deployment Configurator Placeholder */}
      <section>
        <h2>Deployment Configuration</h2>
        <div style={{ color: '#888' }}>[Deployment configuration UI coming soon]</div>
      </section>

      {/* Testing Panel Placeholder */}
      <section>
        <h2>Testing & Quality Assurance</h2>
        <div style={{ color: '#888' }}>[Testing and QA tools coming soon]</div>
      </section>

      {/* Documentation Generator Placeholder */}
      <section>
        <h2>Documentation</h2>
        <div style={{ color: '#888' }}>[Documentation generation coming soon]</div>
      </section>
    </div>
  );
}; 