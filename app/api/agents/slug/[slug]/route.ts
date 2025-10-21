import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { agentsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/agents/slug/[slug] - Get a specific agent by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.slug, slug)).limit(1);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Map database fields to match Agent interface
    const mappedAgent = {
      id: agent.id.toString(),
      title: agent.name,
      description: agent.description,
      prompt: agent.prompt,
      tools: (agent.tools as string[]) || [],
      slug: agent.slug || undefined,
    };

    return NextResponse.json(mappedAgent);
  } catch (error) {
    console.error('Error fetching agent by slug:', error);
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
}
