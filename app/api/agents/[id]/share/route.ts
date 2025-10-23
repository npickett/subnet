import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { agentsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/agents/[id]/share - Increment share count
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);

    if (isNaN(agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    // Fetch the agent
    const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, agentId)).limit(1);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Increment the share count
    await db
      .update(agentsTable)
      .set({ share_count: agent.share_count + 1 })
      .where(eq(agentsTable.id, agentId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error incrementing share count:', error);
    return NextResponse.json({ error: 'Failed to increment share count' }, { status: 500 });
  }
}
