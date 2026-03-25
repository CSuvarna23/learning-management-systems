import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BookOpen, ArrowRight, LogOut, Search, Star, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import courseWebDev from "@/assets/course-web-dev.jpg";
import courseReact from "@/assets/course-react.jpg";
import courseDatabase from "@/assets/course-database.jpg";

interface Subject {
  id: string;
  title: string;
  slug: string;
  description: string | null;
}

const COURSE_IMAGES: Record<string, string> = {
  "intro-web-dev": courseWebDev,
  "react-fundamentals": courseReact,
  "database-design": courseDatabase,
};

const COURSE_BADGES: Record<string, { category: string; level: string }> = {
  "intro-web-dev": { category: "Web Development", level: "Beginner" },
  "react-fundamentals": { category: "Frontend", level: "Intermediate" },
  "database-design": { category: "Backend", level: "Beginner" },
};

const CATEGORIES = ["All", "Web Development", "Frontend", "Backend", "Data Science", "Design"];

export default function Index() {
  const { user, signOut } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

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

  const filtered = subjects.filter(s => {
    const matchesSearch = !search || s.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || COURSE_BADGES[s.slug]?.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-amber-foreground" />
            </div>
            <span className="text-lg font-display text-foreground">LearnFromScratch</span>
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
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-amber text-amber-foreground hover:bg-amber/90">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-hero py-16 md:py-20">
        <div className="container text-center">
          <h1 className="text-3xl md:text-5xl font-display text-primary-foreground mb-4">
            Explore Our Courses
          </h1>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg mx-auto">
            Discover courses taught by industry experts. Learn at your own pace.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-12 h-12 rounded-xl bg-card border-0 shadow-lg text-base"
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Category filters */}
      <section className="container py-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-amber text-amber-foreground"
                  : "bg-card border text-muted-foreground hover:text-foreground hover:border-foreground/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section className="container pb-20">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed p-16 text-center">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <p className="text-muted-foreground">No courses found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((subject, i) => {
              const badge = COURSE_BADGES[subject.slug] || { category: "General", level: "Beginner" };
              const image = COURSE_IMAGES[subject.slug];
              return (
                <Link
                  key={subject.id}
                  to={user ? `/subjects/${subject.id}` : "/login"}
                  className="group block rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {image ? (
                      <img src={image} alt={subject.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={768} height={512} />
                    ) : (
                      <div className="w-full h-full gradient-hero flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-primary-foreground/50" />
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-card/90 backdrop-blur-sm text-xs font-medium text-foreground">
                        {badge.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-md bg-amber text-amber-foreground text-xs font-medium">
                        {badge.level}
                      </span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-display text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {subject.title}
                    </h3>
                    {subject.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{subject.description}</p>
                    )}
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber fill-amber" /> 4.8</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 1,200</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 12h</span>
                    </div>
                    <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300">
                      Start learning <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
