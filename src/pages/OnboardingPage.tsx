import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  GraduationCap,
  Briefcase,
  Globe,
  Github,
  Linkedin,
  Palette,
} from "lucide-react";

const proficiencyLevels = ["learning", "beginner", "intermediate", "advanced", "expert"] as const;
const availabilityOptions = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "weekends", label: "Weekends only" },
  { value: "limited", label: "Limited" },
] as const;
const experienceOptions = ["0-1", "1-2", "2-3", "3-5", "5+"] as const;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile data
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState<string>("part_time");
  const [yearsOfExperience, setYearsOfExperience] = useState<string>("0-1");
  const [isStudent, setIsStudent] = useState(false);
  const [institution, setInstitution] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");

  // Skills
  const [selectedSkills, setSelectedSkills] = useState<Array<{ skillId: number; proficiency: string }>>([]);
  const [wantedSkillIds, setWantedSkillIds] = useState<number[]>([]);

  const { data: skills } = trpc.skills.list.useQuery();
  const { data: categories } = trpc.skills.categories.useQuery();

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => utils.profile.me.invalidate(),
  });
  const addSkill = trpc.skills.addSkill.useMutation({
    onSuccess: () => utils.skills.mySkills.invalidate(),
  });
  const addWanted = trpc.skills.addWantedSkill.useMutation({
    onSuccess: () => utils.skills.myWantedSkills.invalidate(),
  });
  const completeOnboarding = trpc.profile.completeOnboarding.useMutation();
  const claimBonus = trpc.credit.claimSignupBonus.useMutation();

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const toggleOfferedSkill = (skillId: number) => {
    setSelectedSkills((prev) => {
      const exists = prev.find((s) => s.skillId === skillId);
      if (exists) return prev.filter((s) => s.skillId !== skillId);
      return [...prev, { skillId, proficiency: "beginner" }];
    });
  };

  const updateSkillProficiency = (skillId: number, proficiency: string) => {
    setSelectedSkills((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, proficiency } : s))
    );
  };

  const toggleWantedSkill = (skillId: number) => {
    setWantedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // Save profile
      await updateProfile.mutateAsync({
        headline: headline || undefined,
        bio: bio || undefined,
        location: location || undefined,
        availability: availability as any,
        yearsOfExperience: yearsOfExperience as any,
        isStudent,
        institution: institution || undefined,
        githubUrl: githubUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        portfolioUrl: portfolioUrl || undefined,
        figmaUrl: figmaUrl || undefined,
      });

      // Save offered skills
      for (const skill of selectedSkills) {
        await addSkill.mutateAsync({
          skillId: skill.skillId,
          proficiencyLevel: skill.proficiency as any,
          yearsExperience: 0,
        });
      }

      // Save wanted skills
      for (const skillId of wantedSkillIds) {
        await addWanted.mutateAsync({ skillId, priority: "medium" });
      }

      // Claim signup bonus
      await claimBonus.mutateAsync();

      // Complete onboarding
      await completeOnboarding.mutateAsync();

      toast.success("Welcome to SkillSwap Sync!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gradient">SkillSwap Sync</span>
        </div>

        <Card className="glass border-0 shadow-2xl">
          <CardContent className="p-6 md:p-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Let&apos;s Build Your Profile</h2>
                  <p className="text-muted-foreground text-sm">
                    Tell the community who you are and what you do
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Headline *</Label>
                    <Input
                      placeholder="e.g., Frontend Developer & UI Designer"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      placeholder="Tell us about yourself, your goals, and what you're looking for..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="mt-1.5 min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Location
                      </Label>
                      <Input
                        placeholder="City, Country"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" /> Availability
                      </Label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {availabilityOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" /> Experience
                      </Label>
                      <select
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                        className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {experienceOptions.map((o) => (
                          <option key={o} value={o}>{o} years</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="flex items-center gap-1">
                        Are you a student?
                      </Label>
                      <div className="flex gap-3 mt-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={isStudent ? "default" : "outline"}
                          onClick={() => setIsStudent(true)}
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={!isStudent ? "default" : "outline"}
                          onClick={() => setIsStudent(false)}
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  </div>

                  {isStudent && (
                    <div>
                      <Label>Institution</Label>
                      <Input
                        placeholder="University or Bootcamp name"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Links */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Your Online Presence</h2>
                  <p className="text-muted-foreground text-sm">
                    Connect your profiles to build trust
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <Github className="w-4 h-4" /> GitHub
                    </Label>
                    <Input
                      placeholder="https://github.com/username"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </Label>
                    <Input
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4" /> Portfolio
                    </Label>
                    <Input
                      placeholder="https://yourportfolio.com"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <Palette className="w-4 h-4" /> Figma
                    </Label>
                    <Input
                      placeholder="https://figma.com/@username"
                      value={figmaUrl}
                      onChange={(e) => setFigmaUrl(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Offered Skills */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Skills You Offer</h2>
                  <p className="text-muted-foreground text-sm">
                    Select skills you can teach or provide to others
                  </p>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {categories?.map((cat) => (
                    <div key={cat.id}>
                      <h3 className="text-sm font-semibold mb-2">{cat.displayName}</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills
                          ?.filter((s) => s.categoryId === cat.id)
                          .map((skill) => {
                            const selected = selectedSkills.find((s) => s.skillId === skill.id);
                            return (
                              <div key={skill.id} className="flex flex-col gap-1">
                                <Badge
                                  variant={selected ? "default" : "outline"}
                                  className="cursor-pointer text-xs py-1.5 px-3 hover:opacity-80 transition-opacity"
                                  onClick={() => toggleOfferedSkill(skill.id)}
                                >
                                  {selected && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                  {skill.displayName}
                                </Badge>
                                {selected && (
                                  <select
                                    value={selected.proficiency}
                                    onChange={(e) => updateSkillProficiency(skill.id, e.target.value)}
                                    className="text-[10px] rounded border border-input bg-background px-1 py-0.5"
                                  >
                                    {proficiencyLevels.map((l) => (
                                      <option key={l} value={l}>{l}</option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Wanted Skills */}
            {step === 4 && (
              <div className="space-y-5 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Skills You Want</h2>
                  <p className="text-muted-foreground text-sm">
                    Select skills you want to learn or receive help with
                  </p>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {categories?.map((cat) => (
                    <div key={cat.id}>
                      <h3 className="text-sm font-semibold mb-2">{cat.displayName}</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills
                          ?.filter((s) => s.categoryId === cat.id)
                          .map((skill) => {
                            const isSelected = wantedSkillIds.includes(skill.id);
                            return (
                              <Badge
                                key={skill.id}
                                variant={isSelected ? "default" : "outline"}
                                className="cursor-pointer text-xs py-1.5 px-3 hover:opacity-80 transition-opacity"
                                onClick={() => toggleWantedSkill(skill.id)}
                              >
                                {isSelected && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {skill.displayName}
                              </Badge>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border/30">
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>

              {step < totalSteps ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  className="gap-2 gradient-accent text-white"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="gap-2 gradient-accent text-white"
                >
                  {isSubmitting ? "Finishing..." : "Finish & Start"}
                  <Zap className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
