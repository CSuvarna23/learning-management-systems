import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Sparkles } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-10 left-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-56 w-56 rounded-full bg-coral/15 blur-3xl" />
        <div className="max-w-md text-primary-foreground relative z-10">
          <div className="h-14 w-14 rounded-xl bg-primary-foreground/15 backdrop-blur flex items-center justify-center mb-8">
            <BookOpen className="h-7 w-7" />
          </div>
          <h1 className="text-4xl font-display mb-4">Start learning today</h1>
          <p className="text-lg opacity-80 font-body leading-relaxed">Access structured courses and track your progress as you grow.</p>
          <div className="mt-8 flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-foreground/10 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 opacity-80" />
            <span className="text-sm opacity-90">Free access to all available courses</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="h-8 w-8 rounded-lg gradient-hero flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-foreground">LearnFromScratch</span>
            </Link>
            <h2 className="text-2xl font-display text-foreground">Create an account</h2>
            <p className="text-muted-foreground mt-1">Get started for free</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
