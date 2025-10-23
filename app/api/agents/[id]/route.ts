import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { agentsTable, reviewsTable } from '@/db/schema';
import { eq, avg, count } from 'drizzle-orm';

// GET /api/agents/[id] - Get a specific agent
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);

    if (isNaN(agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, agentId)).limit(1);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Fetch rating stats for this agent
    const [ratingStats] = await db
      .select({
        avgRating: avg(reviewsTable.rating),
        reviewCount: count(reviewsTable.id),
      })
      .from(reviewsTable)
      .where(eq(reviewsTable.agent_id, agentId));

    // Map database fields to match Agent interface
    const mappedAgent = {
      id: agent.id.toString(),
      title: agent.name,
      description: agent.description,
      prompt: agent.prompt,
      tools: (agent.tools as string[]) || [],
      slug: agent.slug || undefined,
      forkedFrom: agent.forked_from?.toString(),
      averageRating: ratingStats?.avgRating ? parseFloat(ratingStats.avgRating) : undefined,
      reviewCount: ratingStats?.reviewCount || 0,
      runCount: agent.run_count,
      forkCount: agent.fork_count,
      shareCount: agent.share_count,
    };

    return NextResponse.json(mappedAgent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
}

// PUT /api/agents/[id] - Update a specific agent
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);

    if (isNaN(agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, prompt, tools } = body;

    if (!title || !description || !prompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [updatedAgent] = await db
      .update(agentsTable)
      .set({
        name: title,
        description,
        prompt,
        tools: tools || [],
      })
      .where(eq(agentsTable.id, agentId))
      .returning();

    if (!updatedAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Map database fields to match Agent interface
    const mappedAgent = {
      id: updatedAgent.id.toString(),
      title: updatedAgent.name,
      description: updatedAgent.description,
      prompt: updatedAgent.prompt,
      tools: (updatedAgent.tools as string[]) || [],
      slug: updatedAgent.slug || undefined,
      forkedFrom: updatedAgent.forked_from?.toString(),
      runCount: updatedAgent.run_count,
      forkCount: updatedAgent.fork_count,
      shareCount: updatedAgent.share_count,
    };

    return NextResponse.json(mappedAgent);
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

// DELETE /api/agents/[id] - Delete a specific agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);

    if (isNaN(agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const [deletedAgent] = await db
      .delete(agentsTable)
      .where(eq(agentsTable.id, agentId))
      .returning();

    if (!deletedAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}
