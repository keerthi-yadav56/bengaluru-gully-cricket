import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Users, 
  MapPin, 
  Calendar, 
  Star,
  ArrowRight,
  Target,
  Award
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Player Profiles",
      description: "Create detailed cricket profiles with stats, photos, and playing preferences"
    },
    {
      icon: Trophy,
      title: "Tournaments",
      description: "Join exciting cricket tournaments across Bengaluru with prizes and glory"
    },
    {
      icon: Target,
      title: "Team Management",
      description: "Form teams, register for tournaments, and manage your cricket squad"
    },
    {
      icon: Award,
      title: "Rewards & Recognition",
      description: "Compete for trophies, prizes, and recognition in the cricket community"
    }
  ];

  const stats = [
    { number: "500+", label: "Active Players" },
    { number: "50+", label: "Tournaments" },
    { number: "25+", label: "Areas Covered" },
    { number: "100+", label: "Teams Formed" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-modern">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">BGC</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {!isLoading && (
                <div className="flex items-center gap-2">
              <Button 
                onClick={() => {
                  if (isAuthenticated) {
                    // If admin, go to admin panel; otherwise go to dashboard
                    navigate(user?.role === "admin" ? "/admin" : "/dashboard");
                  } else {
                    navigate("/auth");
                  }
                }}
                className="font-medium"
              >
                {isAuthenticated ? (user?.role === "admin" ? "Admin Panel" : "Dashboard") : "Get Started"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/admin")}
                    className="font-medium"
                  >
                    Admin Panel
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-modern">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
                The Bengaluru
                <span className="block text-primary">Gully Cricket</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Join the ultimate cricket community in Bengaluru. Create your profile, 
                participate in tournaments, and connect with fellow cricket enthusiasts.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                onClick={() => {
                  if (isAuthenticated) {
                    navigate(user?.role === "admin" ? "/admin" : "/dashboard");
                  } else {
                    navigate("/auth");
                  }
                }}
                className="text-lg px-8 py-6 font-medium"
              >
                {isAuthenticated ? `Welcome back, ${user?.name}` : "Join the Community"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/tournaments")}
                className="text-lg px-8 py-6 font-medium"
              >
                View Tournaments
                <Trophy className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/players")}
                className="text-lg px-8 py-6 font-medium"
              >
                Explore Players
                <Users className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container-modern">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-modern">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Everything You Need for Cricket
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From player profiles to tournament management, we've got you covered
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              // Determine navigation path based on feature title
              const getNavigationPath = (title: string) => {
                switch (title) {
                  case "Player Profiles":
                    return "/players";
                  case "Tournaments":
                    return "/tournaments";
                  case "Team Management":
                    return isAuthenticated ? "/dashboard" : "/auth";
                  case "Rewards & Recognition":
                    return "/tournaments";
                  default:
                    return "/";
                }
              };

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    className="card-modern hover:shadow-lg transition-all duration-300 h-full cursor-pointer hover:scale-105"
                    onClick={() => navigate(getNavigationPath(feature.title))}
                  >
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary/5">
        <div className="container-modern">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold tracking-tight mb-6">
              Ready to Play Cricket?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of cricket players in Bengaluru. Create your profile, 
              find tournaments, and start playing today.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 font-medium"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container-modern">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold">The Bengaluru Gully Cricket</span>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="text-muted-foreground text-sm">
                © 2024 BGC. All rights reserved.
              </div>
              <div className="text-sm text-muted-foreground">
                Developed by <span className="font-medium text-foreground">Keerthi Yadav</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}