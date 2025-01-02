import { NextResponse } from 'next/server';
import { MoniteService } from '@/lib/monite/service';
import { validateToken } from '@/lib/utils/auth';
import { EntityCreateSchema } from '@/lib/validations/entity';
import { MoniteEntity } from '@/lib/monite/types';
import { handleError } from '@/lib/middleware/error-handler';
import { moniteLogger } from '@/lib/utils/logger';

export async function POST(request: Request) {
  try {
    const token = await validateToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = EntityCreateSchema.parse(body);

    const entityData = {
      ...validatedData,
      status: validatedData.status || 'active'
    };

    const moniteService = new MoniteService(
      process.env.MONITE_API_URL!,
      process.env.MONITE_CLIENT_ID!,
      process.env.MONITE_CLIENT_SECRET!
    );

    moniteLogger.debug('Creating entity', { data: entityData });
    const entity = await moniteService.createEntity(entityData) as MoniteEntity;
    moniteLogger.info('Entity created successfully', { entityId: entity.id });

    return NextResponse.json(entity, { status: 201 });
  } catch (error) {
    moniteLogger.error('Failed to create entity', error);
    return handleError(error);
  }
}

export async function GET(request: Request) {
  try {
    const token = await validateToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const moniteService = new MoniteService(
      process.env.MONITE_API_URL!,
      process.env.MONITE_CLIENT_ID!,
      process.env.MONITE_CLIENT_SECRET!
    );

    moniteLogger.debug('Fetching entities');
    const { data: entities } = await moniteService.listEntities() as { data: MoniteEntity[] };
    moniteLogger.info('Entities fetched successfully', { count: entities.length });

    return NextResponse.json({ data: entities });
  } catch (error) {
    moniteLogger.error('Failed to fetch entities', error);
    return handleError(error);
  }
}