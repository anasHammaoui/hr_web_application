import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const updateRequestSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  adminNote: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = updateRequestSchema.parse(body);

    const updatedRequest = await prisma.timeOffRequest.update({
      where: { id: params.id },
      data: {
        status: data.status,
        adminNote: data.adminNote,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
