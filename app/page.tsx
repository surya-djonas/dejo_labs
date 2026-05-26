import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BarChart, Clock, Shield, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Live Classroom Quiz Platform
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Engage your students with real-time quizzes, live classes, and comprehensive analytics.
            The modern way to teach and learn.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/signin">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 hover:bg-white/20">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="h-10 w-10" />}
              title="Real-Time Quizzes"
              description="Launch instant quizzes during live classes with synchronized countdown timers across all devices."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="Live Classrooms"
              description="Integrated Google Meet support with automatic attendance tracking and session management."
            />
            <FeatureCard
              icon={<BarChart className="h-10 w-10" />}
              title="Advanced Analytics"
              description="Detailed performance insights, participation rates, and engagement metrics for teachers and students."
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10" />}
              title="Attendance Tracking"
              description="Automatic attendance recording with join/leave timestamps and duration tracking."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10" />}
              title="Enterprise Security"
              description="Bank-level security with JWT authentication, role-based access, and encrypted data."
            />
            <FeatureCard
              icon={<GraduationCap className="h-10 w-10" />}
              title="Multiple Question Types"
              description="MCQ, multiple-select, true/false, short answer, numerical, and poll questions."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard number="10,000+" label="Active Students" />
            <StatCard number="500+" label="Teachers" />
            <StatCard number="50,000+" label="Quizzes Conducted" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Classroom?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of educators using our platform to create engaging, interactive learning experiences.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Teaching Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2026 Classroom Quiz Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-5xl font-bold text-primary mb-2">{number}</div>
      <div className="text-xl text-muted-foreground">{label}</div>
    </div>
  );
}
