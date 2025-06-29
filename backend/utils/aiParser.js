const axios = require("axios");
const XLSX = require("xlsx");

class AIParser {
  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
    this.openRouterBaseUrl = "https://openrouter.ai/api/v1";
  }

  /**
   * Parse Excel file using AI with custom prompt
   * @param {Buffer} fileBuffer - Excel file buffer
   * @param {string} fileName - Original file name
   * @param {string} customPrompt - Custom parsing prompt from frontend
   * @returns {Promise<Array>} Parsed records
   */
  async parseExcelFileWithCustomPrompt(fileBuffer, fileName, customPrompt) {
    try {
      // Read Excel file
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert the entire sheet to JSON (array of arrays, all rows)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        raw: false,
      });

      // Send ALL data to AI, do not extract headers or filter rows
      const parsedData = await this.parseWithCustomPrompt(
        jsonData,
        fileName,
        customPrompt
      );
      return parsedData;
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      throw error;
    }
  }

  /**
   * Use AI to parse and normalize data with custom prompt
   * @param {Array} rawData - Raw extracted data from Excel
   * @param {string} fileName - Original file name
   * @param {string} customPrompt - Custom parsing prompt
   * @returns {Promise<Array>} Normalized records
   */
  async parseWithCustomPrompt(rawData, fileName, customPrompt) {
    const fullPrompt = `${customPrompt}

Raw data from Excel file "${fileName}":
${JSON.stringify(rawData.slice(0, 10), null, 2)}

IMPORTANT: Your response MUST be ONLY a valid JSON array of objects. Do NOT include any explanations, text, or markdown. Do NOT wrap the JSON in code blocks. If you cannot parse, return an empty array [].

Rules:
1. Return only valid JSON array, no explanations, no markdown, no extra text
2. Handle empty/null values appropriately
3. Preserve all text content in original language
4. Convert dates to YYYY-MM-DD format when possible
5. Convert numeric fields to appropriate types

Expected output: JSON array of objects`;

    try {
      const response = await axios.post(
        `${this.openRouterBaseUrl}/chat/completions`,
        {
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            {
              role: "system",
              content:
                "You are an expert at parsing structured data from Excel files. Always respond with valid JSON only, no additional text or explanations.",
            },
            {
              role: "user",
              content: fullPrompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 4000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
            "X-Title": "ERP File Parser",
          },
        }
      );

      const aiResponse = response.data.choices[0].message.content;

      // Clean AI response: remove BOM and trim whitespace
      let cleanedResponse = aiResponse;
      if (typeof cleanedResponse === 'string') {
        cleanedResponse = cleanedResponse.replace(/^\uFEFF/, '').trim();
      }
      // Parse AI response as JSON
      let parsedData;
      try {
        parsedData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        // Try to extract JSON from response if it contains extra text
        const jsonMatch = cleanedResponse.match(/\[.*\]/s);
        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[0]);
          } catch (jsonExtractError) {
            // Log the cleaned string with visible whitespace and char codes
            console.error('AI response (cleaned, invalid JSON):', cleanedResponse.split('').map(c => `${c} (U+${c.charCodeAt(0).toString(16).padStart(4, '0')})`).join(''));
            throw new Error('AI response could not be parsed as JSON. Please check the AI output format.');
          }
        } else {
          // Log the cleaned string with visible whitespace and char codes
          console.error('AI response (cleaned, invalid JSON):', cleanedResponse.split('').map(c => `${c} (U+${c.charCodeAt(0).toString(16).padStart(4, '0')})`).join(''));
          throw new Error('AI response is not valid JSON and no JSON array could be extracted.');
        }
      }

      // Add fileName to each record if not present
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const generatedFileName = `${fileName.replace(
        /\.xlsx?$/i,
        ""
      )}_${timestamp}`;

      return parsedData.map((record) => ({
        ...record,
        fileName: record.fileName || generatedFileName,
      }));
    } catch (error) {
      console.error("Error calling AI API:", error);
      throw new Error("Failed to parse data with AI: " + error.message);
    }
  }

  /**
   * Group parsed records by fileName for display
   * @param {Array} records - Parsed bank statement records
   * @returns {Object} Grouped records by fileName
   */
  groupRecordsByFileName(records) {
    const grouped = {};

    records.forEach((record) => {
      const fileName = record.fileName;
      if (!grouped[fileName]) {
        grouped[fileName] = {
          fileName,
          recordCount: 0,
          totalDebit: 0,
          totalCredit: 0,
          records: [],
        };
      }

      grouped[fileName].records.push(record);
      grouped[fileName].recordCount++;
      grouped[fileName].totalDebit += parseFloat(record.debitTurnover || 0);
      grouped[fileName].totalCredit += parseFloat(record.creditTurnover || 0);
    });

    return grouped;
  }
}

module.exports = AIParser;
