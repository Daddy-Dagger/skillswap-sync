import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileText,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MessageSquare,
  Coins,
  Plus,
  Trash2,
  CalendarDays,
  Sparkles,
} from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  pending_acceptance: "bg-amber-500",
  active: "bg-blue-500",
  milestone_review: "bg-purple-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-500",
  disputed: "bg-red-600",
  rejected: "bg-gray-400",
  closed: "bg-gray-400",
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Clock className="w-3.5 h-3.5" />,
  pending_acceptance: <AlertCircle className="w-3.5 h-3.5" />,
  active: <Clock className="w-3.5 h-3.5" />,
  milestone_review: <AlertCircle className="w-3.5 h-3.5" />,
  completed: <CheckCircle2 className="w-3.5 h-3.5" />,
  cancelled: <XCircle className="w-3.5 h-3.5" />,
  disputed: <XCircle className="w-3.5 h-3.5" />,
  rejected: <XCircle className="w-3.5 h-3.5" />,
  closed: <CheckCircle2 className="w-3.5 h-3.5" />,
};

export default function ContractsPage() {
  const [filter, setFilter] = useState<string>("all");
  const { data: contracts, isLoading } = trpc.contract.myContracts.useQuery();

  // Search parameters for creating a contract from a match
  const [searchParams, setSearchParams] = useSearchParams();
  const matchIdParam = searchParams.get("matchId");
  const userIdParam = searchParams.get("userId");

  const matchId = matchIdParam ? parseInt(matchIdParam) : null;
  const recipientUserId = userIdParam ? parseInt(userIdParam) : null;

  // Retrieve user profiles
  const { data: profileData } = trpc.profile.byUserId.useQuery(
    { userId: recipientUserId! },
    { enabled: !!recipientUserId }
  );
  const recipientName = profileData?.user?.name ?? "Collaborator";

  const { data: myProfileData } = trpc.profile.me.useQuery();
  const creditBalance = myProfileData?.profile?.creditBalance ?? 0;

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedHours, setEstimatedHours] = useState<number>(10);
  const [escrowCredits, setEscrowCredits] = useState<number>(20);
  const [complexity, setComplexity] = useState<"simple" | "moderate" | "complex">("moderate");
  const [deadline, setDeadline] = useState("");

  // Checklist helper state
  const [checklist, setChecklist] = useState<{ text: string; completed: boolean }[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  // Milestones helper state
  const [milestones, setMilestones] = useState<{ title: string; description: string; dueDate: string; status: string }[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDescription, setNewMilestoneDescription] = useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("");



  const utils = trpc.useUtils();
  const createContractMutation = trpc.contract.create.useMutation({
    onSuccess: () => {
      utils.contract.myContracts.invalidate();
      toast.success("Contract created successfully!");
      setSearchParams({});
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create contract");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchId || !recipientUserId) return;

    if (title.trim().length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }
    if (description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }
    if (estimatedHours < 1 || estimatedHours > 500) {
      toast.error("Estimated hours must be between 1 and 500");
      return;
    }
    if (escrowCredits < 1) {
      toast.error("Escrow credits must be at least 1");
      return;
    }
    if (escrowCredits > creditBalance) {
      toast.error(`Insufficient credit balance. You only have ${creditBalance} credits.`);
      return;
    }

    createContractMutation.mutate({
      matchId,
      recipientUserId,
      title: title.trim(),
      description: description.trim(),
      estimatedHours,
      escrowCredits,
      complexity,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      checklist,
      milestones,
    });
  };

  const filteredContracts = contracts?.filter((c) => {
    if (filter === "all") return true;
    if (filter === "active") return c.status === "active" || c.status === "pending_acceptance";
    if (filter === "completed") return c.status === "completed" || c.status === "closed";
    if (filter === "issues") return c.status === "disputed" || c.status === "cancelled";
    return true;
  }) ?? [];

  const filters = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
    { key: "issues", label: "Issues" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sync Contracts</h1>
          <p className="text-sm text-muted-foreground">
            Manage your collaborations and track progress
          </p>
        </div>
        <Link to="/matches">
          <Button className="gradient-accent text-white gap-2">
            <FileText className="w-4 h-4" /> New Contract
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <Card className="glass border-0 text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="font-semibold mb-1">No contracts found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start by matching with a collaborator
          </p>
          <Link to="/discover">
            <Button className="gradient-accent text-white">Find Collaborators</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredContracts.map((contract) => {
            const checklist = (contract.checklist as { text: string; completed: boolean }[]) ?? [];
            const completedItems = checklist.filter((i) => i.completed).length;
            const totalItems = checklist.length;
            const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

            return (
              <Card key={contract.id} className="glass border-0 hover:glass-dark transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{contract.title}</h3>
                        <Badge
                          className={`text-[10px] text-white gap-1 ${statusColors[contract.status] ?? "bg-gray-500"}`}
                        >
                          {statusIcons[contract.status]}
                          {contract.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {contract.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>{contract.escrowCredits} credits</span>
                        <span>{contract.estimatedHours}h estimated</span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {contract.complexity}
                        </Badge>
                        {contract.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due {new Date(contract.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {totalItems > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span>{completedItems}/{totalItems}</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Link to={`/workspace/${contract.id}`}>
                        <Button size="sm" className="gradient-accent text-white gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> Workspace
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Contract Creation Modal */}
      <Dialog key={matchId && recipientUserId ? `${matchId}-${recipientUserId}` : 'closed'} open={!!(matchId && recipientUserId)} onOpenChange={(open) => { if (!open) setSearchParams({}); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              Create Sync Contract
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Propose a collaboration agreement with <span className="font-semibold text-foreground">{recipientName}</span>. 
              Credits will be locked in escrow until the contract is completed.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contract Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Develop landing page and configure auth flow"
                  className="mt-1 bg-background/50 border-white/10 focus-visible:ring-primary/20"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a detailed description of the tasks, deliverables, and scope of work..."
                  className="mt-1 h-24 bg-background/50 border-white/10 focus-visible:ring-primary/20"
                  required
                />
              </div>
            </div>

            {/* Numerical Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-xl border border-white/5">
              <div>
                <Label htmlFor="escrowCredits" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" /> Escrow Credits
                </Label>
                <Input
                  id="escrowCredits"
                  type="number"
                  min={1}
                  value={escrowCredits}
                  onChange={(e) => setEscrowCredits(parseInt(e.target.value) || 0)}
                  className="mt-1 bg-background/50 border-white/10 focus-visible:ring-primary/20"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1 flex justify-between">
                  <span>Available balance: {creditBalance} credits</span>
                  {escrowCredits > creditBalance && <span className="text-red-500 font-medium">Insufficient funds</span>}
                </p>
              </div>

              <div>
                <Label htmlFor="estimatedHours" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" /> Estimated Hours
                </Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min={1}
                  max={500}
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 0)}
                  className="mt-1 bg-background/50 border-white/10 focus-visible:ring-primary/20"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1">Recommended scale: 1 to 500 hours.</p>
              </div>

              <div>
                <Label htmlFor="complexity" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  Complexity Tier
                </Label>
                <select
                  id="complexity"
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value as "simple" | "moderate" | "complex")}
                  className="w-full mt-1.5 h-9 rounded-md border border-white/10 bg-background/50 px-3 text-sm focus-visible:ring-primary/20"
                >
                  <option value="simple">Simple (easy task, short term)</option>
                  <option value="moderate">Moderate (regular project collaboration)</option>
                  <option value="complex">Complex (large codebase, multi-faceted)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="deadline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-purple-500" /> Target Deadline (Optional)
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 bg-background/50 border-white/10 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            {/* Checklist & Milestones */}
            <Tabs defaultValue="checklist" className="w-full">
              <TabsList className="grid grid-cols-2 bg-secondary/30">
                <TabsTrigger value="checklist">Project Checklist</TabsTrigger>
                <TabsTrigger value="milestones">Key Milestones</TabsTrigger>
              </TabsList>

              <TabsContent value="checklist" className="space-y-3 mt-2">
                <div className="flex gap-2">
                  <Input
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="e.g., Integrate Auth0 provider"
                    className="bg-background/50 border-white/10"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newChecklistItem.trim()) {
                          setChecklist([...checklist, { text: newChecklistItem.trim(), completed: false }]);
                          setNewChecklistItem("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (newChecklistItem.trim()) {
                        setChecklist([...checklist, { text: newChecklistItem.trim(), completed: false }]);
                        setNewChecklistItem("");
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {checklist.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-secondary/10 border border-white/5">
                      <span className="text-sm">{item.text}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                        onClick={() => setChecklist(checklist.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  {checklist.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No tasks added to the checklist yet. (Optional)</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="milestones" className="space-y-3 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    placeholder="Milestone title"
                    className="bg-background/50 border-white/10"
                  />
                  <Input
                    type="date"
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                    className="bg-background/50 border-white/10"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newMilestoneDescription}
                    onChange={(e) => setNewMilestoneDescription(e.target.value)}
                    placeholder="Brief description of the milestone criteria (Optional)"
                    className="flex-1 bg-background/50 border-white/10"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (!newMilestoneTitle.trim() || !newMilestoneDueDate) {
                        toast.error("Milestone title and due date are required");
                        return;
                      }
                      setMilestones([
                        ...milestones,
                        {
                          title: newMilestoneTitle.trim(),
                          description: newMilestoneDescription.trim(),
                          dueDate: new Date(newMilestoneDueDate).toISOString(),
                          status: "pending",
                        },
                      ]);
                      setNewMilestoneTitle("");
                      setNewMilestoneDescription("");
                      setNewMilestoneDueDate("");
                    }}
                  >
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {milestones.map((m, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-secondary/10 border border-white/5">
                      <div className="min-w-0">
                        <span className="text-sm font-medium block truncate">{m.title}</span>
                        <span className="text-[10px] text-muted-foreground block">
                          Due: {new Date(m.dueDate).toLocaleDateString()}
                          {m.description && ` • ${m.description}`}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500 shrink-0"
                        onClick={() => setMilestones(milestones.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  {milestones.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No milestones added yet. (Optional)</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Dialog Footer */}
            <DialogFooter className="flex items-center justify-between pt-4 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSearchParams({})}
                disabled={createContractMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-accent text-white gap-2"
                disabled={createContractMutation.isPending || escrowCredits > creditBalance}
              >
                {createContractMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Propose & Lock Escrow
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
