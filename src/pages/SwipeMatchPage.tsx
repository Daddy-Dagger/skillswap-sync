import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  X,
  Heart,
  Star,
  MapPin,
  Briefcase,
  ArrowRight,
  Sparkles,
  Zap,
  Loader2,
} from "lucide-react";

export default function SwipeMatchPage() {
  const utils = trpc.useUtils();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | "super" | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [lastMatch, setLastMatch] = useState<{ matchId: number; score: number } | null>(null);

  const { data: profiles, isLoading } = trpc.profile.discover.useQuery({ limit: 20 });
  const { data: skills } = trpc.skills.list.useQuery();

  const swipeMutation = trpc.matching.swipe.useMutation({
    onSuccess: (data) => {
      if (data.match) {
        setLastMatch(data.match);
        setShowMatch(true);
        utils.matching.myMatches.invalidate();
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const currentProfile = profiles?.[currentIndex];

  const handleSwipe = async (action: "like" | "pass" | "superlike") => {
    if (!currentProfile) return;

    setDirection(action === "pass" ? "left" : action === "like" ? "right" : "super");

    // Animate out
    setTimeout(async () => {
      await swipeMutation.mutateAsync({
        swipedUserId: currentProfile.userId,
        action,
      });
      setCurrentIndex((i) => i + 1);
      setDirection(null);
    }, 300);
  };

  // Get skills for this profile (we'd need a separate query in real app)
  const profileSkills = skills?.slice(0, 5) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-[80vh] p-8">
        <Card className="glass border-0 max-w-md text-center p-8">
          <SearchIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">No more profiles</h2>
          <p className="text-muted-foreground text-sm mb-6">
            We&apos;ve shown you all available collaborators. Check back later for new members!
          </p>
          <Link to="/matches">
            <Button className="gradient-accent text-white gap-2">
              View Your Matches <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-[80vh] p-8">
        <Card className="glass border-0 max-w-md text-center p-8">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-bold mb-2">You&apos;ve seen everyone!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Great job swiping! Come back later for more collaborators.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/matches">
              <Button variant="outline" className="gap-2">
                View Matches <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button onClick={() => setCurrentIndex(0)} variant="outline">
              Start Over
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const animationClass = direction === "left"
    ? "-translate-x-[120%] rotate-[-12deg] opacity-0"
    : direction === "right" || direction === "super"
    ? "translate-x-[120%] rotate-[12deg] opacity-0"
    : "";

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Discover Collaborators</h1>
        <p className="text-sm text-muted-foreground">
          Swipe to find your perfect skill match
        </p>
      </div>

      {/* Card Stack */}
      <div className="relative">
        {/* Profile Card */}
        <Card
          className={`glass border-0 shadow-2xl transition-all duration-300 ease-out ${animationClass}`}
        >
          <CardContent className="p-0">
            {/* Avatar & Header */}
            <div className="relative p-6 pb-4 text-center border-b border-border/20">
              <div className="w-24 h-24 rounded-full gradient-accent mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {currentProfile.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <h2 className="text-xl font-bold">{currentProfile.name ?? "Anonymous"}</h2>
              {currentProfile.headline && (
                <p className="text-sm text-muted-foreground mt-1">{currentProfile.headline}</p>
              )}
              <div className="flex items-center justify-center gap-3 mt-3 text-xs text-muted-foreground">
                {currentProfile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {currentProfile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> {currentProfile.availability?.replace("_", " ")}
                </span>
              </div>
              {currentProfile.bio && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3 max-w-sm mx-auto">
                  {currentProfile.bio}
                </p>
              )}

              {/* Quality Tier Badge */}
              <div className="mt-3">
                <Badge variant="secondary" className="capitalize text-xs">
                  {currentProfile.qualityTier} Tier
                </Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 border-b border-border/20">
              <div className="text-center">
                <p className="text-lg font-bold">{currentProfile.reputationScore ?? 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Reputation</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{currentProfile.reputationScore ?? 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Reputation</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{currentProfile.completionRate ?? 100}%</p>
                <p className="text-[10px] text-muted-foreground uppercase">Completion</p>
              </div>
            </div>

            {/* Skills */}
            <div className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {profileSkills.map((skill) => (
                  <Badge key={skill.id} variant="outline" className="text-[10px]">
                    {skill.displayName}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Compatibility Score */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Compatibility</span>
                <span className="text-xs font-medium">
                  {Math.round(Math.random() * 40 + 60)}% {/* Placeholder - real app would calculate */}
                </span>
              </div>
              <Progress value={Math.random() * 40 + 60} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Next card peek */}
        {profiles[currentIndex + 1] && (
          <Card className="absolute inset-0 glass border-0 shadow-lg -z-10 scale-95 translate-y-2 opacity-50" />
        )}
      </div>

      {/* Swipe Buttons */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={() => handleSwipe("pass")}
          disabled={swipeMutation.isPending}
          className="w-16 h-16 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors border border-destructive/20"
        >
          <X className="w-7 h-7 text-destructive" />
        </button>

        <button
          onClick={() => handleSwipe("superlike")}
          disabled={swipeMutation.isPending}
          className="w-14 h-14 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors border border-primary/20"
        >
          <Star className="w-6 h-6 text-primary" />
        </button>

        <button
          onClick={() => handleSwipe("like")}
          disabled={swipeMutation.isPending}
          className="w-16 h-16 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center transition-colors border border-emerald-500/20"
        >
          <Heart className="w-7 h-7 text-emerald-500" />
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        {profiles.length - currentIndex} profiles remaining
      </p>

      {/* Match Modal */}
      {showMatch && lastMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <Card className="glass border-0 max-w-sm w-full text-center p-8 glow-accent">
            <div className="w-20 h-20 rounded-full gradient-accent mx-auto mb-4 flex items-center justify-center animate-float">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">It&apos;s a Match!</h2>
            <p className="text-muted-foreground text-sm mb-2">
              You and {currentProfile?.name ?? "this user"} want to collaborate!
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge variant="secondary">{lastMatch.score}% Compatible</Badge>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMatch(false);
                  setLastMatch(null);
                }}
                className="flex-1"
              >
                Keep Swiping
              </Button>
              <Link to="/matches" className="flex-1">
                <Button className="w-full gradient-accent text-white gap-2">
                  View Matches <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
