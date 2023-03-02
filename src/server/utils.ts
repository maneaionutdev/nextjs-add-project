import { PrismaClient } from '@prisma/client';
import type { NextApiRequest } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

function isValidBody<T extends Record<string, unknown>>(body: any, fields: (keyof T)[]): body is T {
  return Object.keys(body).every((key) => fields.includes(key));
}

const handleForm = async (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: string[] }> => {
  const folderPath = path.join(process.cwd(), '/public/images');
  const options: formidable.Options = {
    uploadDir: folderPath,
    multiples: true,
    filename: (name, ext, path, form) => {
      return Date.now().toString() + '_' + path.originalFilename;
    },
    maxFileSize: 4000 * 1024 * 1024,
  };
  const form = formidable(options);

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        throw err;
      }
      const requiredFields = ['title', 'description', 'link'];
      const missingFields = requiredFields.filter((field) => !(field in fields));
      const { file } = files;
      console.log(file);
      if (missingFields.length > 0) {
        console.log(missingFields);
        if (Array.isArray(file)) {
          file.forEach(async (f) => {
            await fs.unlink(f.filepath);
          });
        } else {
          await fs.unlink(file.filepath);
        }

        reject(`Missing fields: ${missingFields.join(', ')}`);
      }

      const filesPaths = file ? (Array.isArray(file) ? file.map((f) => f.newFilename) : [file.newFilename]) : [];
      resolve({ fields, files: filesPaths });
    });
  });
};

export { prisma, isValidBody, handleForm };
