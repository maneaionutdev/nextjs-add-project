import { isValidBody, prisma } from '@/server/utils';
import { NextApiRequest, NextApiResponse } from 'next';

type RequestBody = {
  id: number;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PATCH') return res.status(405).json({ message: 'We only support PATCH' });
  if (!isValidBody<RequestBody>(req.body, ['id'])) {
    return res.status(402).json({ message: 'Missing id' });
  }
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: Number(req.body.id),
      },
    });

    if (project === null) return res.status(404).json({ message: 'Portofolio not found' });
    console.log(project.isPublished);

    const publishedProject = await prisma.project.update({
      where: {
        id: Number(req.body.id),
      },
      data: {
        isPublished: !project.isPublished,
      },
    });

    res.status(200).json({ message: 'Success', data: publishedProject });
  } catch (error: any) {
    console.log(error);
  }
};

export default handler;
