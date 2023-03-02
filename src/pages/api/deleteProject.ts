import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs/promises';

import { prisma } from '@/server/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'DELETE') return res.status(405).json({ message: 'We only support DELETE' });
  if (!req.query.id) return res.status(400).json({ message: 'Missing id' });

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: Number(req.query.id),
      },
    });

    if (project === null) return res.status(404).json({ message: 'Portofolio not found' });

    let images = project.images as string[];

    images.forEach(async (image) => {
      await fs.unlink(path.join(process.cwd(), '/public/images', image));
    });

    const deletedProject = await prisma.project.delete({
      where: {
        id: Number(req.query.id),
      },
    });

    res.status(200).json({ message: 'Success', data: deletedProject });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: 'failed to load data' });
  }
};

export default handler;
