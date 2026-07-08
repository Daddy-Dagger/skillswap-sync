import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user?.isOnboarded) {
        navigate("/dashboard");
      } else if (isAuthenticated && !user?.isOnboarded) {
        navigate("/onboarding");
      } else {
        navigate("/");
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
