import { handleForm, prisma } from '@/server/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

type RequestBody = {
  title: string;
  description: string;
  link: string;
  oldFiles?: string[];
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PATCH') return res.status(405).json({ message: 'We only support PATCH' });
  if (!req.query.id) return res.status(400).json({ message: 'Missing id' });
  try {
    const response = await handleForm(req);
    const fields = response.fields as RequestBody;
    const project = await prisma.project.findUnique({
      where: {
        id: Number(req.query.id),
      },
    });

    if (project === null) return res.status(404).json({ message: 'Project not found' });

    let images = project.images as string[];

    if (typeof fields.oldFiles === 'string') fields.oldFiles = JSON.parse(fields.oldFiles);
    if (fields.oldFiles) {
      fields.oldFiles = fields.oldFiles.map((file) => file.replace('/images/', ''));
    }

    let remainingImages: string[] = [];
    images.forEach(async (image) => {
      if (!fields.oldFiles?.includes(image)) {
        console.log(process.cwd(), '/public/images', image);
        await fs.unlink(path.join(process.cwd(), '/public/images', image));
      } else {
        remainingImages.push(image);
      }
    });

    const editProject = await prisma.project.update({
      where: {
        id: Number(req.query.id),
      },
      data: {
        title: fields.title,
        description: fields.description,
        link: fields.link,
        images: [...response.files, ...remainingImages],
      },
    });

    res.status(200).json({ message: 'Success', data: editProject });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: 'failed to load data' });
  }
};
export default handler;
