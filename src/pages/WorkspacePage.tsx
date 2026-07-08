import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  FileText,
  CheckSquare,
  MessageSquare,
  BookOpen,
  Loader2,
  CheckCircle2,
  Circle,
  Star,
  Clock,
  AlertCircle,
} from "lucide-react";

type Tab = "chat" | "notes" | "checklist" | "milestones" | "details";

export default function WorkspacePage() {
  const { contractId } = useParams<{ contractId: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messageInput, setMessageInput] = useState("");
  const [notesContent, setNotesContent] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const id = parseInt(contractId ?? "0");
  const utils = trpc.useUtils();

  const { data: contract, isLoading } = trpc.contract.getById.useQuery(
    { id },
    { enabled: id > 0 }
  );

  const { data: messages } = trpc.workspace.messages.useQuery(
    { contractId: id },
    { enabled: id > 0, refetchInterval: 5000 }
  );

  const { data: notes } = trpc.workspace.notes.useQuery(
    { contractId: id },
    { enabled: id > 0 }
  );

  useEffect(() => {
    if (notes) setNotesContent(notes.content);
  }, [notes]);

  const sendMessage = trpc.workspace.sendMessage.useMutation({
    onSuccess: () => {
      utils.workspace.messages.invalidate({ contractId: id });
      setMessageInput("");
    },
  });

  const updateNotes = trpc.workspace.updateNotes.useMutation({
    onSuccess: () => {
      toast.success("Notes saved");
    },
  });

  const updateChecklist = trpc.contract.updateChecklist.useMutation({
    onSuccess: () => utils.contract.getById.invalidate({ id }),
  });

  const completeContract = trpc.contract.complete.useMutation({
    onSuccess: () => {
      utils.contract.getById.invalidate({ id });
      toast.success("Contract completed! Credits released.");
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <h2 className="text-xl font-bold mb-2">Contract Not Found</h2>
        <Link to="/contracts">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Contracts
          </Button>
        </Link>
      </div>
    );
  }

  const checklist = (contract.checklist as Array<{ text: string; completed: boolean }>) ?? [];
  const milestones = (contract.milestones as Array<{
    title: string;
    description?: string;
    dueDate: string;
    status: string;
  }>) ?? [];
  const completedChecklist = checklist.filter((i) => i.completed).length;
  const checklistProgress = checklist.length > 0 ? (completedChecklist / checklist.length) * 100 : 0;
  const completedMilestones = milestones.filter((m) => m.status === "completed").length;
  const milestoneProgress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessage.mutate({ contractId: id, content: messageInput.trim() });
  };

  const toggleChecklistItem = (index: number) => {
    const updated = checklist.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );
    updateChecklist.mutate({ contractId: id, checklist: updated });
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "chat", label: "Chat", icon: MessageSquare },
    { key: "notes", label: "Notes", icon: BookOpen },
    { key: "checklist", label: `Checklist (${completedChecklist}/${checklist.length})`, icon: CheckSquare },
    { key: "milestones", label: "Milestones", icon: Clock },
    { key: "details", label: "Details", icon: FileText },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-border/30 bg-card/50 backdrop-blur px-4 py-3 shrink-0">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/contracts">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-semibold truncate max-w-[200px] md:max-w-md">
                {contract.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px] h-4 capitalize">
                  {contract.status.replace("_", " ")}
                </Badge>
                <span>{contract.escrowCredits} credits</span>
              </div>
            </div>
          </div>
          {contract.status === "active" && (
            <Button
              size="sm"
              className="gradient-accent text-white gap-1"
              onClick={() => {
                const rating = parseInt(prompt("Rate this collaboration (1-5):") ?? "5");
                if (rating >= 1 && rating <= 5) {
                  completeContract.mutate({ contractId: id, rating });
                }
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-2 max-w-6xl mx-auto overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.key)}
                className="gap-1.5 text-xs shrink-0"
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden max-w-6xl mx-auto w-full">
        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages && messages.length > 0 ? (
                messages.map((msg) => {
                  const isMe = msg.senderUserId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                          isMe
                            ? "gradient-accent text-white"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-border/30 p-3 flex gap-2 shrink-0">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button
                size="icon"
                className="gradient-accent text-white shrink-0"
                onClick={handleSendMessage}
                disabled={sendMessage.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">
                Shared markdown notes for this project
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateNotes.mutate({ contractId: id, content: notesContent })}
                disabled={updateNotes.isPending}
              >
                Save
              </Button>
            </div>
            <Textarea
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              className="flex-1 resize-none font-mono text-sm leading-relaxed"
              placeholder="# Project Notes\n\nUse markdown to organize your thoughts..."
            />
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === "checklist" && (
          <div className="p-4 overflow-y-auto h-full">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{Math.round(checklistProgress)}%</span>
              </div>
              <Progress value={checklistProgress} className="h-2" />
            </div>
            {checklist.length > 0 ? (
              <div className="space-y-2">
                {checklist.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/40 cursor-pointer transition-colors"
                    onClick={() => toggleChecklistItem(index)}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No checklist items</p>
            )}
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === "milestones" && (
          <div className="p-4 overflow-y-auto h-full">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Milestone Progress</span>
                <span>{Math.round(milestoneProgress)}%</span>
              </div>
              <Progress value={milestoneProgress} className="h-2" />
            </div>
            {milestones.length > 0 ? (
              <div className="space-y-3">
                {milestones.map((m, i) => (
                  <Card key={i} className="glass border-0">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {m.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h3 className={`font-medium text-sm ${m.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                            {m.title}
                          </h3>
                          {m.description && (
                            <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(m.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={m.status === "completed" ? "default" : "outline"} className="text-[10px]">
                          {m.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No milestones set</p>
            )}
          </div>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="p-4 overflow-y-auto h-full">
            <div className="space-y-4 max-w-lg">
              <div>
                <h3 className="text-sm font-semibold mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">{contract.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Est. Hours</h3>
                  <p className="text-sm text-muted-foreground">{contract.estimatedHours}h</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Complexity</h3>
                  <Badge variant="outline" className="capitalize">{contract.complexity}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Escrow</h3>
                  <p className="text-sm text-muted-foreground">{contract.escrowCredits} credits</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Deadline</h3>
                  <p className="text-sm text-muted-foreground">
                    {contract.deadline ? new Date(contract.deadline).toLocaleDateString() : "No deadline"}
                  </p>
                </div>
              </div>
              {contract.deliverables && (contract.deliverables as string[]).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Deliverables</h3>
                  <ul className="space-y-1">
                    {(contract.deliverables as string[]).map((d, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {contract.finalRating && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Rating</h3>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${s <= contract.finalRating! ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  {contract.reviewComment && (
                    <p className="text-sm text-muted-foreground mt-2 italic">&ldquo;{contract.reviewComment}&rdquo;</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
