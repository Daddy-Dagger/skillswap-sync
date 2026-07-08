import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Medal,
  Crown,
  Award,
  TrendingUp,
  Star,
  Loader2,
  Zap,
  Users,
} from "lucide-react";

type Tab = "reputation" | "contributors" | "rising";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("reputation");

  const { data: reputationData, isLoading: repLoading } = trpc.leaderboard.topReputation.useQuery();
  const { data: contributorsData, isLoading: contribLoading } = trpc.leaderboard.topContributors.useQuery();

  const isLoading = repLoading || contribLoading;

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "reputation", label: "Top Reputation", icon: Trophy },
    { key: "contributors", label: "Top Contributors", icon: TrendingUp },
    { key: "rising", label: "Rising Stars", icon: Star },
  ];

  const getData = () => {
    switch (activeTab) {
      case "reputation": return reputationData ?? [];
      case "contributors": return contributorsData ?? [];
      case "rising": return (reputationData ?? []).filter((u) => (u.totalProjects ?? 0) > 0 && (u.totalProjects ?? 0) <= 3);
      default: return [];
    }
  };

  const data = getData();

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-amber-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-300" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground">#{index + 1}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-primary mb-4">
          <Trophy className="w-3.5 h-3.5" />
          <span>Community Leaderboard</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Top <span className="text-gradient">SkillSwappers</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Recognizing the most active, trusted, and collaborative members of our community
        </p>
      </div>

      {/* Top 3 Podium */}
      {data.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center pb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-lg font-bold text-white shadow-lg mb-2">
              {data[1]?.name?.[0] ?? "2"}
            </div>
            <p className="text-sm font-medium">{data[1]?.name ?? "-"}</p>
            <Badge variant="secondary" className="text-[10px] mt-1">#2</Badge>
          </div>
          {/* 1st Place */}
          <div className="flex flex-col items-center pb-4">
            <div className="w-20 h-20 rounded-full gradient-accent flex items-center justify-center text-2xl font-bold text-white shadow-xl mb-2 animate-float">
              {data[0]?.name?.[0] ?? "1"}
            </div>
            <p className="text-base font-bold">{data[0]?.name ?? "-"}</p>
            <Badge className="gradient-accent text-white text-[10px] mt-1">#1</Badge>
          </div>
          {/* 3rd Place */}
          <div className="flex flex-col items-center pb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-lg font-bold text-white shadow-lg mb-2">
              {data[2]?.name?.[0] ?? "3"}
            </div>
            <p className="text-sm font-medium">{data[2]?.name ?? "-"}</p>
            <Badge variant="secondary" className="text-[10px] mt-1">#3</Badge>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.key)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* List */}
      <Card className="glass border-0">
        <CardContent className="p-0">
          {data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No data yet. Be the first!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {data.map((user, index) => (
                <Link
                  key={user.userId}
                  to={`/profile/${user.userId}`}
                  className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="w-8 flex justify-center">{getRankIcon(index)}</div>
                  <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {user.name?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{user.name ?? "Unknown"}</p>
                      <Badge variant="secondary" className="text-[9px] capitalize shrink-0">
                        {user.qualityTier ?? "beginner"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.headline ?? "No headline"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gradient">
                      {activeTab === "contributors"
                        ? ((user as any).contributionScore ?? 0)
                        : ((user as any).reputationScore ?? 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {activeTab === "contributors" ? "contributions" : "reputation"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <Link to="/discover">
          <Button className="gradient-accent text-white gap-2">
            <Zap className="w-4 h-4" /> Start Building Your Reputation
          </Button>
        </Link>
      </div>
    </div>
  );
}
