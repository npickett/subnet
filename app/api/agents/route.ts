import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { agentsTable, reviewsTable } from '@/db/schema';
import { desc, eq, avg, count } from 'drizzle-orm';
import slugify from 'slugify';

// GET /api/agents - Get first 50 agents
export async function GET() {
  try {
    const agents = await db.select().from(agentsTable).orderBy(desc(agentsTable.id)).limit(50);

    // Fetch rating stats for all agents
    const agentIds = agents.map((a) => a.id);
    const ratingStats = await db
      .select({
        agentId: reviewsTable.agent_id,
        avgRating: avg(reviewsTable.rating),
        reviewCount: count(reviewsTable.id),
      })
      .from(reviewsTable)
      .where(eq(reviewsTable.agent_id, reviewsTable.agent_id))
      .groupBy(reviewsTable.agent_id);

    const ratingMap = new Map(
      ratingStats.map((stat) => [
        stat.agentId,
        {
          averageRating: stat.avgRating ? parseFloat(stat.avgRating) : undefined,
          reviewCount: stat.reviewCount || 0,
        },
      ]),
    );

    // Map database fields to match Agent interface
    const mappedAgents = agents.map((agent) => {
      const stats = ratingMap.get(agent.id);
      return {
        id: agent.id.toString(),
        title: agent.name,
        description: agent.description,
        prompt: agent.prompt,
        tools: (agent.tools as string[]) || [],
        slug: agent.slug || undefined,
        forkedFrom: agent.forked_from?.toString(),
        averageRating: stats?.averageRating,
        reviewCount: stats?.reviewCount || 0,
      };
    });

    return NextResponse.json(mappedAgents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, prompt, tools, forkedFrom } = body;

    if (!title || !description || !prompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = slugify(title, { lower: true, strict: true });

    const [newAgent] = await db
      .insert(agentsTable)
      .values({
        name: title,
        description,
        prompt,
        tools: tools || [],
        slug,
        forked_from: forkedFrom ? parseInt(forkedFrom) : null,
      })
      .returning();

    // Map database fields to match Agent interface
    const mappedAgent = {
      id: newAgent.id.toString(),
      title: newAgent.name,
      description: newAgent.description,
      prompt: newAgent.prompt,
      tools: (newAgent.tools as string[]) || [],
      slug: newAgent.slug || undefined,
      forkedFrom: newAgent.forked_from?.toString(),
    };

    return NextResponse.json(mappedAgent, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}
