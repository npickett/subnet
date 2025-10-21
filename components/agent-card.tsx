'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Agent } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Share2, GitFork } from 'lucide-react';
import { useState } from 'react';
import { AVAILABLE_TOOLS } from '@/lib/types';

interface AgentCardProps {
  agent: Agent;
  onDelete?: (agentId: string) => void;
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${agent.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }

      onDelete?.(agent.id);
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (agent.slug) {
      const shareUrl = `${window.location.origin}/share/${agent.slug}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert(`Share URL: ${shareUrl}`);
      }
    }
  };

  const handleFork = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/create?fork=${agent.id}`);
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl">{agent.title}</CardTitle>
            <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-muted h-8 w-8"
              onClick={handleFork}
              title="Fork agent"
            >
              <GitFork className="h-4 w-4" />
            </Button>
            {agent.slug && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-muted h-8 w-8"
                onClick={handleShare}
                title="Share agent"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <p className="text-muted-foreground text-sm font-medium">Tools:</p>
          <div className="flex flex-wrap gap-2">
            {agent.tools.slice(0, 2).map((tool) => (
              <Badge key={tool} variant="secondary" className="text-xs">
                {AVAILABLE_TOOLS.find((t) => t.value === tool)?.label}
              </Badge>
            ))}
            {agent.tools.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{agent.tools.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/run/${agent.id}`} className="w-full">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
            View Agent
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
