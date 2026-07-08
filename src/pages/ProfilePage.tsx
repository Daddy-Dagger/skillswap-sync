import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Github,
  Linkedin,
  Globe,
  Palette,
  Award,
  Clock,
  BarChart3,
  Star,
  TrendingUp,
  Edit3,
  Calendar,
} from "lucide-react";

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const targetUserId = userId ? parseInt(userId) : currentUser?.id;
  const isOwnProfile = !userId || parseInt(userId) === currentUser?.id;

  const { data: profileData } = trpc.profile.byUserId.useQuery(
    { userId: targetUserId! },
    { enabled: !!targetUserId }
  );

  const profile = profileData?.profile;
  const user = profileData?.user;

  if (!profileData) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading profile...</div>
    );
  }

  const reputation = profile?.reputationScore ?? 0;
  const tierProgress = Math.min(100, (reputation / 1000) * 100);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="glass border-0 overflow-hidden">
        <div className="h-32 gradient-accent relative" />
        <CardContent className="relative px-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-4 gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-background gradient-accent flex items-center justify-center text-3xl font-bold text-white shadow-xl">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">{user?.name ?? "User"}</h1>
              {profile?.headline && (
                <p className="text-muted-foreground text-sm">{profile.headline}</p>
              )}
            </div>
            {isOwnProfile && (
              <Link to="/onboarding">
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </Button>
              </Link>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
            {profile?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> {profile?.availability?.replace("_", " ")}
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> {profile?.yearsOfExperience ?? "0-1"} years
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Joined{" "}
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
            </span>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="text-sm leading-relaxed mb-4">{profile.bio}</p>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-2">
            {profile?.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-secondary">
                  <Github className="w-3 h-3" /> GitHub
                </Badge>
              </a>
            )}
            {profile?.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-secondary">
                  <Linkedin className="w-3 h-3" /> LinkedIn
                </Badge>
              </a>
            )}
            {profile?.portfolioUrl && (
              <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-secondary">
                  <Globe className="w-3 h-3" /> Portfolio
                </Badge>
              </a>
            )}
            {profile?.figmaUrl && (
              <a href={profile.figmaUrl} target="_blank" rel="noopener noreferrer">
                <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-secondary">
                  <Palette className="w-3 h-3" /> Figma
                </Badge>
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Skills Offered */}
          <Card className="glass border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" /> Skills Offered
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileData.userSkills && profileData.userSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.userSkills.map((us) => (
                    <Badge key={us.id} variant="secondary" className="gap-1.5 py-1.5 px-3">
                      {us.skill.displayName}
                      <span className="text-[10px] opacity-60 capitalize">({us.proficiencyLevel})</span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No skills added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Skills Wanted */}
          <Card className="glass border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Skills Wanted
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileData.wantedSkills && profileData.wantedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.wantedSkills.map((ws) => (
                    <Badge key={ws.id} variant="outline" className="gap-1.5 py-1.5 px-3">
                      {ws.skill.displayName}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No wanted skills yet</p>
              )}
            </CardContent>
          </Card>

          {/* Contribution Records */}
          <Card className="glass border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" /> Verified Contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Award className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Complete contracts to build your contribution record</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          {/* Reputation */}
          <Card className="glass border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Reputation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Score</span>
                  <span className="text-xs font-medium">{reputation} / {Math.ceil(reputation / 100) * 100}</span>
                </div>
                <Progress value={tierProgress} className="h-2" />
              </div>
              <Badge variant="secondary" className="w-full justify-center capitalize">
                {profile?.qualityTier ?? "Beginner"} Tier
              </Badge>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <Card className="glass border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-muted-foreground" /> Projects
                </span>
                <span className="font-medium">{profile?.totalProjects ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" /> Hours
                </span>
                <span className="font-medium">{profile?.totalHours ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" /> Completion
                </span>
                <span className="font-medium">{profile?.completionRate ?? 100}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-muted-foreground" /> Trust
                </span>
                <span className="font-medium">{profile?.trustScore ?? 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Student Badge */}
          {profile?.isStudent && (
            <Card className="glass border-0 border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Verified Student</p>
                    <p className="text-xs text-muted-foreground">{profile.institution}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
