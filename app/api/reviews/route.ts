import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewsTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/reviews?agentId=123 - Get reviews for a specific agent
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.agent_id, parseInt(agentId)))
      .orderBy(desc(reviewsTable.created_at));

    // Map database fields to match Review interface
    const mappedReviews = reviews.map((review) => ({
      id: review.id.toString(),
      agentId: review.agent_id.toString(),
      authorName: review.author_name,
      rating: review.rating,
      comment: review.comment || undefined,
      createdAt: review.created_at.toISOString(),
    }));

    return NextResponse.json(mappedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, authorName, rating, comment } = body;

    if (!agentId || !authorName || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const [newReview] = await db
      .insert(reviewsTable)
      .values({
        agent_id: parseInt(agentId),
        author_name: authorName,
        rating,
        comment: comment || null,
      })
      .returning();

    // Map database fields to match Review interface
    const mappedReview = {
      id: newReview.id.toString(),
      agentId: newReview.agent_id.toString(),
      authorName: newReview.author_name,
      rating: newReview.rating,
      comment: newReview.comment || undefined,
      createdAt: newReview.created_at.toISOString(),
    };

    return NextResponse.json(mappedReview, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
