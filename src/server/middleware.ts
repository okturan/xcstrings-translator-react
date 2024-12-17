import { IncomingMessage, ServerResponse } from "http";
import { LocalizableStringsManager, SaveTranslationBody } from "../utils/LocalizableStringsManager";

async function parseRequestBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  req.on("data", (chunk: Buffer) => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export function createSaveTranslationMiddleware(manager: LocalizableStringsManager) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url !== "/api/save-translation" || req.method !== "POST") {
      return next();
    }

    try {
      const body = await parseRequestBody<SaveTranslationBody>(req);
      await manager.updateTranslation(body);
      
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error saving translation:", errorMessage);
      
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: errorMessage }));
    }
  };
}
