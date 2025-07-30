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

export interface BankStatementParseResponse {
  message: string;
  fileName: string;
  recordsCount: number;
  createdRecords: number;
  metadata: {
    groupBy?: string;
    sheetName: string;
    horizontalOffset: number;
    verticalOffset: number;
    fieldsMapped: number;
  };
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
        'Content-Type': 'multipart/form-data; charset=utf-8',
      },
    });

    return response.data as ParseResponse;
  }

  /**
   * Upload and parse bank statement file
   */
  async parseBankStatement(file: File, directoryId: string, companyId: string): Promise<BankStatementParseResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directoryId', directoryId);
    formData.append('companyId', companyId);

    const response = await api.post('/api/file-parser/parse-bank-statement', formData, {
      headers: {
        'Content-Type': 'multipart/form-data; charset=utf-8',
      },
    });

    return response.data as BankStatementParseResponse;
  }
}

export const fileParserService = new FileParserService(); 