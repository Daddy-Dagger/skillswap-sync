import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, ArrowLeft, Sparkles, Users, Shield, TrendingUp } from "lucide-react";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

const benefits = [
  { icon: Sparkles, text: "50 free starting credits" },
  { icon: Users, text: "Connect with skilled collaborators" },
  { icon: Shield, text: "Verified reputation system" },
  { icon: TrendingUp, text: "Build your portfolio" },
];

export default function Login() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <Card className="glass border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to SkillSwap</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to start trading skills and building your career
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sign in button */}
            <Button
              className="w-full gradient-accent text-white gap-2 h-11 text-base"
              size="lg"
              onClick={() => {
                window.location.href = getOAuthUrl();
              }}
            >
              <Zap className="w-5 h-5" />
              Sign in with Kimi
            </Button>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.text}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/40"
                  >
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs text-muted-foreground">{b.text}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
