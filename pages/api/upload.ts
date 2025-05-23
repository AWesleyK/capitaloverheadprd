// /pages/api/upload.ts
import { IncomingForm } from "formidable";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      console.error("Formidable error:", err);
      return res.status(500).json({ error: "Upload failed" });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    // Use "uploads" as fallback if no folder is specified
    const folder = fields.folder && typeof fields.folder === "string"
      ? fields.folder.replace(/[^a-zA-Z0-9/_-]/g, "") // sanitize
      : "uploads";

    try {
      const stream = fs.createReadStream(file.filepath);

      const result = await put(
        `${folder}/${Date.now()}_${file.originalFilename}`,
        stream,
        {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN!,
        }
      );

      return res.status(200).json({ url: result.url });
    } catch (e) {
      console.error("Blob upload failed:", e);
      return res.status(500).json({ error: "Blob upload failed" });
    }
  });
}
