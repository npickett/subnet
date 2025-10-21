import { redirect } from 'next/navigation';
import { db } from '@/db';
import { agentsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function ShareRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.slug, slug)).limit(1);

  if (!agent) {
    redirect('/');
  }

  redirect(`/run/${agent.id}`);
}
