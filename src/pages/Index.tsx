import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BookOpen, ArrowRight, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Subject {
  id: string;
  title: string;
  slug: string;
  description: string | null;
}

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
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <BookOpen className="h-6 w-6" />
            <span className="text-lg font-display">LearnHub</span>
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
      <section className="container py-16 md:py-24">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-display text-foreground leading-tight">
            Learn at your own pace
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg">
            Structured courses with video lessons. Track your progress and pick up right where you left off.
          </p>
          {!user && (
            <Link to="/register">
              <Button size="lg" className="mt-8">
                Start learning <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Subjects */}
      <section className="container pb-16">
        <h2 className="text-2xl font-display text-foreground mb-8">Available Subjects</h2>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No subjects available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject, i) => (
              <Link
                key={subject.id}
                to={user ? `/subjects/${subject.id}` : "/login"}
                className="group block rounded-lg border bg-card p-6 transition-all hover:shadow-md hover:border-primary/30 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <h3 className="text-xl font-display text-card-foreground group-hover:text-primary transition-colors">
                  {subject.title}
                </h3>
                {subject.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{subject.description}</p>
                )}
                <div className="mt-4 flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Start learning <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
