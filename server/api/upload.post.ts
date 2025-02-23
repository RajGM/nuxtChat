// original: https://github.com/RafalWilinski/cloudflare-rag/blob/2f4341bcf462c8f86001b601e59e60c25b1a6ea8/functions/api/upload.ts

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const useExampleSessions = () => [
  {
    id: "3aa8c534-2d63-4221-bde2-0e3e2b39cfd9",
    name: "Cloudflare-Inc-NET-US-Q2-2024-Earnings-Call-1-August-2024-5_00-PM-ET.pdf",
  },
];

export default defineEventHandler(async (event) => {
  console.log("INSIDEPOST RQEUEST");
  const formData = await readFormData(event);
  const sessionId = formData.get("sessionId") as string;
  const file = formData.get("file") as File | null;
  /*
  //--------------------------------------------------

  async function fetchFromGoogleDriveUrl(
    googleDriveUrl: string,
    token: string,
    fileName?: string
  ): Promise<File> {
    console.log("token", token);
    console.log("Download URL:", googleDriveUrl);
    const fileResponse = await fetch(googleDriveUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Log status and headers for debugging
    console.log("Status:", fileResponse.status);
    console.log("Content-Type:", fileResponse.headers.get("content-type"));

    const blob = await fileResponse.blob();
    console.log("Fetched blob for debugging:", blob);

    const finalFile = new File([blob], fileName || "untitled", {
      type: blob.type,
    });
    return finalFile;
  }

  const googleDriveUrl = formData.get("googleDriveUrl") as string | null;
  const token = formData.get("token") as string | null;
  const fileName = formData.get("fileName") as string | null;
  let file2: File | null = null;
  if (googleDriveUrl) {
    file2 = await fetchFromGoogleDriveUrl(googleDriveUrl, token, fileName);
    const txt = extractText(file2),
    console.log("TEXT", txt);
    return txt;
  }

  //--------------------------------------------------
*/
//   if (!sessionId)
//     throw createError({ statusCode: 400, message: "Missing sessionId" });
//   if (!file || !file.size)
//     throw createError({ statusCode: 400, message: "No file provided" });


  ensureBlob(file, {
    maxSize: "8MB",
    types: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
      "text/plain", // txt
      "text/csv", // csv
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
      "image/jpeg", // JPEG
      "image/png", // PNG
      "image/gif", // GIF
      "image/bmp", // BMP
      "image/webp", // WebP
      "image/svg+xml", // SVG
      "image/tiff", // TIFF
    ],
  });

  console.log("GETTING THE FILE");
  // prevent uploading files to example sessions
  const exampleSessionIds = useExampleSessions();
  if (exampleSessionIds.some(({ id }) => id === sessionId)) {
    throw createError({
      statusCode: 400,
      message: "File uploading unavailable on example sessions",
    });
  }

  // create stream and return it
  const eventStream = createEventStream(event);
  const streamResponse = (data: object) =>
    eventStream.push(JSON.stringify(data));

  // prevent worker from being killed while processing
  console.log("WAIT UNTIL");
  console.log("---------------------------------");
  event.waitUntil(
    (async () => {
      try {
        // upload file, extract text, and insert document
        const [r2Url, textContent] = await Promise.all([
          //const [textContent] = await Promise.all([
          uploadPDF(file, sessionId),
          extractTextFromFile(file),
        ]);
        console.log("textContent", !textContent);
        await streamResponse({ message: "Extracted text from PDF" });

        console.log("BEFORE INSERTING");
        const insertResult = await insertDocument(
          file,
          textContent,
          sessionId,
          r2Url
        );
        const documentId = insertResult[0].insertedId;

        console.log("DOCUMENT ID", documentId);
        // split text into chunks
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 500,
          chunkOverlap: 100,
        });
        const chunks = await splitter.splitText(textContent);
        await streamResponse({ message: "Split text into chunks" });

        console.log("CHUNKS SPLITTED", chunks);

        // generate and store vectors for each chunk
        await processVectors(chunks, sessionId, documentId, streamResponse);
        await streamResponse({
          message: "Inserted vectors",
          chunks: chunks.length,
        });
      } catch (error) {
        console.log("Error processing upload:", error);
        await streamResponse({ error: (error as Error).message });
      } finally {
        eventStream.close();
      }
    })()
  );

  return eventStream.send();
});
