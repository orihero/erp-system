import api from '../config';

export interface ParsedRecord {
  [key: string]: unknown;
}

export interface ParseResponse {
  message: string;
  recordsCount: number;
  fileName: string;
  records: ParsedRecord[];
}

class FileParserService {
  /**
   * Upload and parse Excel file with custom prompt
   */
  async parseExcelFile(file: File, prompt: string): Promise<ParseResponse> {
    const formData = new FormData();
    formData.append('excelFile', file);
    formData.append('prompt', prompt);

    const response = await api.post('/api/file-parser/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data as ParseResponse;
  }
}

export const fileParserService = new FileParserService(); 