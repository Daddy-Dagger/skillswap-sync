import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  UserCircle,
  Bell,
  Shield,
  CreditCard,
  Loader2,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const { data: profileData } = trpc.profile.me.useQuery();
  const utils = trpc.useUtils();

  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  useEffect(() => {
    if (profileData?.profile) {
      setHeadline(profileData.profile.headline ?? "");
      setBio(profileData.profile.bio ?? "");
      setLocation(profileData.profile.location ?? "");
      setGithubUrl(profileData.profile.githubUrl ?? "");
      setLinkedinUrl(profileData.profile.linkedinUrl ?? "");
      setPortfolioUrl(profileData.profile.portfolioUrl ?? "");
    }
  }, [profileData]);

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      utils.profile.me.invalidate();
      toast.success("Profile updated successfully");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const handleSave = () => {
    updateProfile.mutate({
      headline: headline || undefined,
      bio: bio || undefined,
      location: location || undefined,
      githubUrl: githubUrl || undefined,
      linkedinUrl: linkedinUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCircle className="w-4 h-4 text-primary" /> Profile Information
          </CardTitle>
          <CardDescription>Update your public profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Headline</Label>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g., Frontend Developer & UI Designer"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Bio</Label>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="mt-1.5"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>GitHub</Label>
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>LinkedIn</Label>
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Portfolio</Label>
              <Input
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1.5"
              />
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="gradient-accent text-white gap-2"
          >
            {updateProfile.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Notifications
          </CardTitle>
          <CardDescription>Choose what you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Match notifications", desc: "When you match with a new collaborator", defaultOn: true },
            { label: "Contract updates", desc: "Status changes on your contracts", defaultOn: true },
            { label: "Messages", desc: "New messages in workspaces", defaultOn: true },
            { label: "Credit transactions", desc: "When credits are earned or spent", defaultOn: false },
            { label: "Marketing emails", desc: "Tips, updates, and community news", defaultOn: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.defaultOn} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Privacy
          </CardTitle>
          <CardDescription>Control your profile visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Public profile", desc: "Allow others to find and view your profile", defaultOn: true },
            { label: "Show contribution records", desc: "Display your project history publicly", defaultOn: true },
            { label: "Show reputation score", desc: "Display your reputation publicly", defaultOn: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.defaultOn} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Credit Info */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> Credit Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/40">
            <span className="text-sm">Current Balance</span>
            <span className="text-lg font-bold text-gradient">
              {profileData?.profile?.creditBalance ?? 0} credits
            </span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Credits are earned by completing contracts and can be used to request help from other collaborators.</p>
            <p>New users start with 50 free credits.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
