'use client';

import { useEffect, useState } from 'react';
import type { Agent } from '@/lib/types';
import { Header } from '@/components/header';
import { AgentCard } from '@/components/agent-card';

export default function HomePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const response = await fetch('/api/agents');
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        const data = await response.json();
        setAgents(data);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgents();
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-4xl font-bold">Discover Agents</h1>
          <p className="text-muted-foreground">
            SubNet is a network of agents powered by Subconscious
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-lg">Loading agents...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground mb-4 text-lg">
              Hmm we didn't find any agents. Create the first agent on SubNet!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onDelete={(agentId) => {
                  setAgents(agents.filter((a) => a.id !== agentId));
                }}
                onUpdate={async (agentId) => {
                  try {
                    const response = await fetch(`/api/agents/${agentId}`);
                    if (response.ok) {
                      const updatedAgent = await response.json();
                      setAgents(agents.map((a) => (a.id === agentId ? updatedAgent : a)));
                    }
                  } catch (error) {
                    console.error('Error refreshing agent:', error);
                  }
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
