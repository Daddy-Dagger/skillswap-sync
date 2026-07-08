import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  Handshake,
  FileText,
  Star,
  TrendingUp,
  ArrowRight,
  Users,
  CreditCard,
  Clock,
  Award,
  BarChart3,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: profileData } = trpc.profile.me.useQuery(undefined, {
    retry: false,
  });

  const { data: contracts } = trpc.contract.myContracts.useQuery(undefined, {
    retry: false,
  });

  const { data: matches } = trpc.matching.myMatches.useQuery(undefined, {
    retry: false,
  });

  const { data: creditData } = trpc.credit.balance.useQuery();

  const { data: notifications } = trpc.notification.list.useQuery(
    { limit: 5 },
    { retry: false }
  );

  const profile = profileData?.profile;
  const activeContracts = contracts?.filter(
    (c) => c.status === "active" || c.status === "pending_acceptance"
  ) ?? [];
  const acceptedMatches = matches?.filter((m) => m.status === "accepted") ?? [];
  const unreadNotifs = notifications?.filter((n) => !n.isRead) ?? [];

  // Calculate reputation tier progress
  const reputation = profile?.reputationScore ?? 0;
  const tierProgress = Math.min(100, (reputation / 1000) * 100);
  const nextTier = reputation < 100 ? "Intermediate" : reputation < 500 ? "Advanced" : "Expert";
  const nextTierThreshold = reputation < 100 ? 100 : reputation < 500 ? 500 : 1000;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, <span className="text-gradient">{user?.name?.split(" ")[0] ?? "Builder"}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s what&apos;s happening in your SkillSwap network
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/discover">
            <Button className="gradient-accent text-white gap-2">
              <Zap className="w-4 h-4" />
              Discover
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Credit Balance</p>
                <p className="text-2xl font-bold text-gradient">{creditData?.balance ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Active Matches</p>
                <p className="text-2xl font-bold">{acceptedMatches.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Handshake className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Active Contracts</p>
                <p className="text-2xl font-bold">{activeContracts.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reputation</p>
                <p className="text-2xl font-bold">{reputation}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reputation Progress */}
          <Card className="glass border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Reputation Progress
              </CardTitle>
              <CardDescription>
                Earn reputation by completing contracts and receiving positive reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {(profile?.qualityTier ?? "beginner")} Tier
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Next: {nextTier} at {nextTierThreshold} pts
                  </span>
                </div>
                <span className="text-xs font-medium">{Math.round(tierProgress)}%</span>
              </div>
              <Progress value={tierProgress} className="h-2" />
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{profile?.totalProjects ?? 0} projects</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{profile?.totalHours ?? 0} hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{profile?.completionRate ?? 100}% completion</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-3">
                <Link to="/discover">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:gradient-accent hover:text-white group">
                    <Users className="w-6 h-6 group-hover:text-white" />
                    <span className="text-xs">Find Collaborators</span>
                  </Button>
                </Link>
                <Link to="/contracts">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:gradient-accent hover:text-white group">
                    <FileText className="w-6 h-6 group-hover:text-white" />
                    <span className="text-xs">View Contracts</span>
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:gradient-accent hover:text-white group">
                    <Star className="w-6 h-6 group-hover:text-white" />
                    <span className="text-xs">Edit Profile</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Active Contracts */}
          <Card className="glass border-0">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Active Contracts</CardTitle>
                <CardDescription>Your ongoing collaborations</CardDescription>
              </div>
              <Link to="/contracts">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {activeContracts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No active contracts yet</p>
                  <Link to="/discover" className="inline-block mt-2">
                    <Button size="sm" variant="outline">Find a collaborator</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeContracts.slice(0, 3).map((contract) => (
                    <Link
                      key={contract.id}
                      to={`/workspace/${contract.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 hover:bg-secondary/70 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{contract.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] h-5 capitalize">
                            {contract.status.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {contract.escrowCredits} credits
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card className="glass border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Notifications</span>
                {unreadNotifs.length > 0 && (
                  <Badge variant="destructive" className="h-5 text-[10px]">
                    {unreadNotifs.length} new
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications && notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.slice(0, 5).map((n) => (
                    <Link
                      key={n.id}
                      to={n.actionUrl ?? "#"}
                      className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${
                        !n.isRead ? "bg-primary/5" : "hover:bg-secondary/40"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? "bg-primary" : "bg-transparent"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No notifications yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Matches */}
          <Card className="glass border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Matches</CardTitle>
            </CardHeader>
            <CardContent>
              {acceptedMatches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No matches yet. Start swiping!
                </p>
              ) : (
                <div className="space-y-3">
                  {acceptedMatches.slice(0, 5).map((match) => (
                    <Link
                      key={match.id}
                      to={`/profile/${match.matchUserId}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/40 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {match.matchName?.[0] ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{match.matchName ?? "Unknown"}</p>
                        <p className="text-xs text-muted-foreground truncate">{match.matchHeadline ?? "No headline"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Overview */}
          <Card className="glass border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {profileData?.userSkills && profileData.userSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.userSkills.slice(0, 8).map((us) => (
                    <Badge key={us.id} variant="secondary" className="text-xs">
                      {us.skill.displayName}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">No skills added yet</p>
                  <Link to="/onboarding">
                    <Button size="sm" variant="outline">Add Skills</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
