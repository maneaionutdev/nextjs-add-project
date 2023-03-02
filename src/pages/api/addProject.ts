import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';

import type { NextApiRequest, NextApiResponse } from 'next';
import { handleForm, prisma } from '@/server/utils';

type RequestBody = {
  title: string;
  description: string;
  link: string;
};

interface ResponseData extends RequestBody {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'We only support POST' });

  try {
    const response = await handleForm(req);
    const fields = response.fields as RequestBody;

    const newProject = await prisma.project.create({
      data: {
        title: fields.title,
        description: fields.description,
        link: fields.link,
        images: response.files,
      },
    });

    res.status(200).json({ message: 'Success', data: newProject });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: 'failed to load data' });
  }
};

export default handler;
