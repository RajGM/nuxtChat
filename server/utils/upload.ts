import { getDocumentProxy, extractText } from "unpdf";

export async function extractTextFromPDF(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const result = await extractText(pdf, { mergePages: true });
  return Array.isArray(result.text) ? result.text.join(" ") : result.text;
}

export async function uploadPDF(
  file: File,
  sessionId: string
): Promise<string> {
  console.log("UPLOADING PDF");
  const blob = await hubBlob().put(`${Date.now()}-${file.name}`, file, {
    prefix: sessionId,
  });
  console.log("UPLOAD DONE BLOB");
  return blob.pathname;
}

export async function insertDocument(
  file: File,
  textContent: string,
  sessionId: string,
  r2Url: string
) {
  console.log(file, textContent, sessionId, r2Url);
  const row = {
    name: file.name,
    size: file.size,
    textContent,
    sessionId,
    r2Url,
  };
  console.log(
    "NSERTING DOC - ERROR POINT:",
    row.name,
    row.size,
    row.r2Url,
    row.sessionId
  );
  return useDrizzle()
    .insert(tables.documents)
    .values(row)
    .returning({ insertedId: tables.documents.id });
}

export async function processVectors(
  chunks: string[],
  sessionId: string,
  documentId: string,
  streamResponse: (message: object) => Promise<void>
) {
  const chunkSize = 10;
  let progress = 0;

  await Promise.all(
    Array.from(
      { length: Math.ceil(chunks.length / chunkSize) },
      async (_, index) => {
        const start = index * chunkSize;
        const chunkBatch = chunks.slice(start, start + chunkSize);

        // Generate embeddings for the current batch
        const embeddingResult = await hubAI().run(
          "@cf/baai/bge-large-en-v1.5",
          {
            text: chunkBatch,
          }
        );
        const embeddingBatch: number[][] = embeddingResult.data;

        // Insert chunks into the database
        const chunkInsertResults = await useDrizzle()
          .insert(tables.documentChunks)
          .values(
            chunkBatch.map((chunk) => ({
              text: chunk,
              sessionId,
              documentId,
            }))
          )
          .returning({ insertedChunkId: tables.documentChunks.id });

        // Extract the inserted chunk IDs
        const chunkIds = chunkInsertResults.map(
          (result) => result.insertedChunkId
        );

        // Insert vectors into Vectorize index
        await hubVectorize("documents").insert(
          embeddingBatch.map((embedding, i) => ({
            id: chunkIds[i],
            values: embedding,
            namespace: "default",
            metadata: {
              sessionId,
              documentId,
              chunkId: chunkIds[i],
              text: chunkBatch[i],
            },
          }))
        );

        progress += (chunkBatch.length / chunks.length) * 100;
        await streamResponse({
          message: `Embedding... (${progress.toFixed(2)}%)`,
          progress,
        });
      }
    )
  );
}

//----------------------------------------------
// docxExtractor.ts
import mammoth from "mammoth";

export async function extractTextFromDocx(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  // Convert the ArrayBuffer into a Node.js Buffer
  const nodeBuffer = Buffer.from(buffer);
  const result = await mammoth.extractRawText({ buffer: nodeBuffer });
  return result.value;
}

// csvExtractor.ts
import { parse } from "csv-parse/sync";

export async function extractTextFromCsv(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const csvString = new TextDecoder("utf-8").decode(buffer);

  // Parse CSV into rows
  const records = parse(csvString, {
    columns: false,
    skip_empty_lines: true,
  });

  // Join rows into a single text string (rows separated by newline)
  return records.map((row: string[]) => row.join(", ")).join("\n");
}

// xlsxExtractor.ts
import ExcelJS from "exceljs";

export async function extractTextFromXlsx(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  let extractedText = "";
  workbook.eachSheet((worksheet) => {
    worksheet.eachRow((row) => {
      // row.values can include empty or undefined values; filter them out.
      const rowText = row.values
        .filter((cell) => cell !== null && cell !== undefined)
        .map((cell) => cell.toString())
        .join(" ");
      extractedText += rowText + "\n";
    });
  });
  return extractedText;
}

export async function extractTextFromTxt(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return new TextDecoder().decode(buffer);
}

import Anthropic from '@anthropic-ai/sdk';


export async function extractTextFromImageUsingClaude(
  file: File
): Promise<string> {
  const client = new Anthropic({
    apiKey: process.env['CLAUDE_KEY'], // This is the default and can be omitted
  });
  // Convert the file to a Base64-encoded string.
  const buffer = await file.arrayBuffer();
  const base64Image = Buffer.from(buffer).toString("base64");

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: file.type,
                data: base64Image, // Pass the Base64 image data
              },
            },
            {
              type: 'text',
              text: 'Extract the Text out of this Image', // Your prompt
            },
          ],
        },
      ],
    });

    console.log('Response from Claude:', response.content[0].text);
    return response.content[0].text;
  } catch (error) {
    console.error('Error sending image to Claude:', error);
  }
  
}

export async function extractTextFromFile(file: File): Promise<string> {
  // Make it case-insensitive
  console.log(file);
  const normalizedType = file.type.toLowerCase();
  console.log("NORMALIZED TYPE:", normalizedType);
  switch (normalizedType) {
    // PDF
    case "pdf":
    case "application/pdf":
      return extractTextFromPDF(file);

    case "docx":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractTextFromDocx(file);

    // TXT
    case "txt":
    case "text/plain":
      return extractTextFromTxt(file);

    // CSV
    case "csv":
    case "text/csv":
      return extractTextFromCsv(file);

    // XLSX
    case "xlsx":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return extractTextFromXlsx(file);

    // Image files (using Google Cloud Vision API)
    case "jpg":
    case "jpeg":
    case "image/jpeg":
    case "png":
    case "image/png":
    case "gif":
    case "image/gif":
      return extractTextFromImageUsingClaude(file);

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}
