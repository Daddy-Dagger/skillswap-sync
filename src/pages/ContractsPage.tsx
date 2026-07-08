import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MessageSquare,
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
            const checklist = (contract.checklist as any[]) ?? [];
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
    </div>
  );
}
