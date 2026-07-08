import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Loader2,
  Handshake,
  FileText,
  CheckCircle2,
  Star,
  CreditCard,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  match: { icon: Handshake, color: "text-emerald-500" },
  contract_request: { icon: FileText, color: "text-amber-500" },
  contract_accepted: { icon: CheckCircle2, color: "text-blue-500" },
  milestone_due: { icon: Bell, color: "text-purple-500" },
  contract_completed: { icon: CheckCircle2, color: "text-emerald-500" },
  review_received: { icon: Star, color: "text-amber-400" },
  endorsement: { icon: Sparkles, color: "text-primary" },
  credit_received: { icon: CreditCard, color: "text-green-500" },
  message: { icon: MessageSquare, color: "text-blue-400" },
  system: { icon: Bell, color: "text-muted-foreground" },
  tier_changed: { icon: TrendingUp, color: "text-primary" },
};

export default function NotificationsPage() {
  const utils = trpc.useUtils();
  const { data: notifications, isLoading } = trpc.notification.list.useQuery({ limit: 100 });

  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Stay updated on your collaborations
          </p>
        </div>
        {notifications && notifications.some((n) => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            Mark All Read
          </Button>
        )}
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => {
            const config = typeConfig[n.type] ?? { icon: Bell, color: "text-muted-foreground" };
            const Icon = config.icon;
            return (
              <Card
                key={n.id}
                className={`glass border-0 transition-colors ${!n.isRead ? "bg-primary/5" : ""}`}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4.5 h-4.5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!n.isRead ? "text-foreground" : ""}`}>
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                      {n.actionUrl && (
                        <Link to={n.actionUrl}>
                          <Button variant="link" size="sm" className="h-auto p-0 text-[10px]">
                            View
                          </Button>
                        </Link>
                      )}
                      {!n.isRead && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-[10px]"
                          onClick={() => markRead.mutate({ notificationId: n.id })}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="glass border-0 text-center py-12">
          <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="font-semibold mb-1">No notifications</h3>
          <p className="text-sm text-muted-foreground">
            You&apos;re all caught up! Start collaborating to get notifications.
          </p>
        </Card>
      )}
    </div>
  );
}
