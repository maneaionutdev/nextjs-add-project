import { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/server/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).json({ message: 'We only support GET' });
  try {
    console.log(req.query);
    const getAll = req.query.getAll === 'true';
    if (getAll) {
      const projects = await prisma.project.findMany();
      return res.status(200).json({ message: 'Success', data: projects });
    }
    const projects = await prisma.project.findMany({
      where: {
        isPublished: true,
      },
    });
    res.status(200).json({ message: 'Success', data: projects });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'failed to load data' });
  }
};

export default handler;
