import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BookOpen, ArrowRight, LogOut, Sparkles, GraduationCap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Subject {
  id: string;
  title: string;
  slug: string;
  description: string | null;
}

const CARD_GRADIENTS = ["subject-card-1", "subject-card-2", "subject-card-3"];
const CARD_ICONS = [
  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><BookOpen className="h-5 w-5 text-primary" /></div>,
  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center"><GraduationCap className="h-5 w-5 text-accent" /></div>,
  <div className="h-10 w-10 rounded-lg bg-coral/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-coral" /></div>,
];

export default function Index() {
  const { user, signOut } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("subjects")
      .select("id, title, slug, description")
      .eq("is_published", true)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setSubjects(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-hero flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-display text-foreground">LearnHub</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
        <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-2xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Start your learning journey
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-foreground leading-tight text-balance">
              Learn at your<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-sky">own pace</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Structured courses with video lessons. Track your progress and pick up right where you left off.
            </p>
            {!user && (
              <div className="flex items-center gap-4 mt-8">
                <Link to="/register">
                  <Button size="lg" className="shadow-lg shadow-primary/25">
                    Start learning <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">Sign in</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="container">
        <div className="grid grid-cols-3 gap-4 rounded-xl border bg-card p-6 -mt-2 mb-12 shadow-sm">
          <div className="text-center">
            <p className="text-2xl font-display text-primary">{subjects.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Subjects</p>
          </div>
          <div className="text-center border-x">
            <p className="text-2xl font-display text-accent">∞</p>
            <p className="text-xs text-muted-foreground mt-0.5">Access</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display text-coral">Free</p>
            <p className="text-xs text-muted-foreground mt-0.5">Always</p>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="container pb-20">
        <h2 className="text-2xl font-display text-foreground mb-8">Available Subjects</h2>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="rounded-xl border border-dashed p-16 text-center">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <p className="text-muted-foreground">No subjects available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject, i) => (
              <Link
                key={subject.id}
                to={user ? `/subjects/${subject.id}` : "/login"}
                className={`group block rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in ${CARD_GRADIENTS[i % 3]}`}
                style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
              >
                {CARD_ICONS[i % 3]}
                <h3 className="mt-4 text-xl font-display text-card-foreground group-hover:text-primary transition-colors">
                  {subject.title}
                </h3>
                {subject.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{subject.description}</p>
                )}
                <div className="mt-5 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                  Start learning <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
