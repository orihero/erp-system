module.exports = {
  async generatePreview({ wizardData, format = 'html', role = 'user', sampleData = {}, user }) {
    // Basic implementation: Render a simple HTML table if wizardData has tabular data
    let html = `<html><head><title>Template Preview</title></head><body>`;
    html += `<h2>Template Preview (Role: ${role})</h2>`;
    if (wizardData && wizardData['field-config'] && Array.isArray(wizardData['field-config'].fields)) {
      const fields = wizardData['field-config'].fields;
      html += `<table border='1' cellpadding='4' style='border-collapse:collapse;'>`;
      html += `<tr>` + fields.map(f => `<th>${f.label || f.name}</th>`).join('') + `</tr>`;
      // Render sample rows if available
      if (Array.isArray(sampleData.rows)) {
        for (const row of sampleData.rows) {
          html += `<tr>` + fields.map(f => `<td>${row[f.name] ?? ''}</td>`).join('') + `</tr>`;
        }
      } else {
        html += `<tr><td colspan='${fields.length}'>No sample data</td></tr>`;
      }
      html += `</table>`;
    } else {
      html += `<pre style="background:#f5f5f5;padding:16px;border-radius:8px;max-width:800px;overflow:auto;">${JSON.stringify(wizardData, null, 2)}</pre>`;
    }
    html += `<h3>Sample Data</h3>`;
    html += `<pre style="background:#f0f0f0;padding:12px;border-radius:6px;max-width:800px;overflow:auto;">${JSON.stringify(sampleData, null, 2)}</pre>`;
    html += `<div style="margin-top:24px;color:#888;">[This is a basic preview. Real report rendering should be implemented here.]</div>`;
    html += `</body></html>`;
    return { html };
  },

  async generateReport(template, parameters, format = 'csv', executionId) {
    // Only support tabular reports and csv for now
    const { ReportExecutionHistory, Directory, DirectoryField, CompanyDirectory, DirectoryRecord, DirectoryValue } = require('../models');
    const execution = await ReportExecutionHistory.findByPk(executionId);
    if (!execution) throw new Error('Execution record not found');
    try {
      await execution.markAsRunning();
      if (template.templateType !== 'tabular') throw new Error('Only tabular reports are supported');
      if (format !== 'csv') throw new Error('Only CSV export is supported');
      // Extract directory_id and company_id from dataSourceConfig
      const { directoryId, companyId } = template.dataSourceConfig;
      if (!directoryId || !companyId) throw new Error('directoryId and companyId required in dataSourceConfig');
      // Fetch directory fields
      const directory = await Directory.findByPk(directoryId, {
        include: [{ model: DirectoryField, as: 'fields' }]
      });
      if (!directory) throw new Error('Directory not found');
      const fields = directory.fields;
      // Fetch company directory
      const companyDirectory = await CompanyDirectory.findOne({
        where: { directory_id: directoryId, company_id: companyId }
      });
      if (!companyDirectory) throw new Error('CompanyDirectory not found');
      // Fetch records and values
      const records = await DirectoryRecord.findAll({
        where: { company_directory_id: companyDirectory.id },
        include: [{
          model: DirectoryValue,
          as: 'recordValues',
          include: [{ model: DirectoryField, as: 'field' }]
        }]
      });
      // Build CSV
      const csvRows = [];
      // Header
      csvRows.push(fields.map(f => '"' + (f.name || f.id) + '"').join(','));
      // Data rows
      for (const record of records) {
        const valueMap = {};
        for (const val of record.recordValues) {
          valueMap[val.field_id] = val.value;
        }
        csvRows.push(fields.map(f => '"' + (valueMap[f.id] ?? '') + '"').join(','));
      }
      // Save CSV to file
      const fs = require('fs');
      const path = require('path');
      const outputDir = path.join(__dirname, '../logs/report-outputs');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      const outputPath = path.join(outputDir, `${executionId}.csv`);
      fs.writeFileSync(outputPath, csvRows.join('\n'), 'utf8');
      await execution.markAsCompleted(outputPath, 'csv', null);
      return { outputPath };
    } catch (err) {
      await execution.markAsFailed(err.message);
      throw err;
    }
  }
}; 