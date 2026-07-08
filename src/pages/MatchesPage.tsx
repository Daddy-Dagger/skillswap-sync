import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Handshake, MessageSquare, Loader2 } from "lucide-react";

export default function MatchesPage() {
  const { data: matches, isLoading } = trpc.matching.myMatches.useQuery();
  const utils = trpc.useUtils();

  const acceptMutation = trpc.matching.accept.useMutation({
    onSuccess: () => utils.matching.myMatches.invalidate(),
  });

  const declineMutation = trpc.matching.decline.useMutation({
    onSuccess: () => utils.matching.myMatches.invalidate(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const acceptedMatches = matches?.filter((m) => m.status === "accepted") ?? [];
  const pendingMatches = matches?.filter((m) => m.status === "pending") ?? [];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Matches</h1>
          <p className="text-sm text-muted-foreground">
            Collaborators you&apos;ve matched with
          </p>
        </div>
        <Link to="/discover">
          <Button className="gradient-accent text-white gap-2">
            <Handshake className="w-4 h-4" /> Find More
          </Button>
        </Link>
      </div>

      {/* Pending Matches */}
      {pendingMatches.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Pending ({pendingMatches.length})
          </h2>
          <div className="space-y-3">
            {pendingMatches.map((match) => (
              <Card key={match.id} className="glass border-0">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-lg font-bold text-white shrink-0">
                    {match.matchName?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{match.matchName ?? "Unknown"}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {match.matchHeadline ?? "No headline"}
                    </p>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {match.compatibilityScore}% match
                    </Badge>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => declineMutation.mutate({ matchId: match.id })}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      className="gradient-accent text-white"
                      onClick={() => acceptMutation.mutate({ matchId: match.id })}
                    >
                      Accept
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Matches */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Active ({acceptedMatches.length})
        </h2>
        {acceptedMatches.length === 0 ? (
          <Card className="glass border-0 text-center py-12">
            <Handshake className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="font-semibold mb-1">No active matches yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start swiping to find collaborators
            </p>
            <Link to="/discover">
              <Button className="gradient-accent text-white">Discover</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {acceptedMatches.map((match) => (
              <Card key={match.id} className="glass border-0 hover:glass-dark transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-lg font-bold text-white shrink-0">
                      {match.matchName?.[0] ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{match.matchName ?? "Unknown"}</h3>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {match.matchQualityTier}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {match.matchHeadline ?? "No headline"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">
                          {match.compatibilityScore}% compatible
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link to={`/profile/${match.matchUserId}`}>
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                      </Link>
                      {!match.createdContract && (
                        <Link to={`/contracts?matchId=${match.id}&userId=${match.matchUserId}`}>
                          <Button size="sm" className="gradient-accent text-white gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> Sync
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
