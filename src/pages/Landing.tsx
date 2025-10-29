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
  Award,
  Zap,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Player Profiles",
      description: "Create detailed cricket profiles with stats, photos, and playing preferences",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Trophy,
      title: "Tournaments",
      description: "Join exciting cricket tournaments across Bengaluru with prizes and glory",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      icon: Target,
      title: "Team Management",
      description: "Form teams, register for tournaments, and manage your cricket squad",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Award,
      title: "Rewards & Recognition",
      description: "Compete for trophies, prizes, and recognition in the cricket community",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  const stats = [
    { number: "500+", label: "Active Players", icon: Users },
    { number: "50+", label: "Tournaments", icon: Trophy },
    { number: "25+", label: "Areas Covered", icon: MapPin },
    { number: "100+", label: "Teams Formed", icon: Target }
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
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">BGC</span>
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
                    navigate(user?.role === "admin" ? "/admin" : "/dashboard");
                  } else {
                    navigate("/auth");
                  }
                }}
                className="font-medium shadow-md hover:shadow-lg transition-all"
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
      <section className="section-padding relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop"
            alt="Cricket players"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/70 to-background/80" />
        </div>
        
        <div className="container-modern">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Bengaluru's Premier Cricket Community</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
                The Bengaluru
                <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Gully Cricket
                </span>
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
                className="text-lg px-8 py-6 font-medium shadow-lg hover:shadow-xl transition-all"
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
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2000&auto=format&fit=crop"
            alt="Cricket action"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/90 to-primary/95" />
        </div>
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
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/20 backdrop-blur-sm mb-3">
                  <stat.icon className="w-6 h-6 text-blue-600 drop-shadow-lg" />
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2 drop-shadow-lg">
                  {stat.number}
                </div>
                <div className="text-blue-700 font-medium drop-shadow">{stat.label}</div>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Features</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Everything You Need for Cricket
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From player profiles to tournament management, we've got you covered
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
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
                    className="card-modern hover:shadow-xl transition-all duration-300 h-full cursor-pointer hover:scale-105 group border-2 hover:border-primary/20"
                    onClick={() => navigate(getNavigationPath(feature.title))}
                  >
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
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
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=2000&auto=format&fit=crop"
            alt="Cricket team celebration"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/75 to-background/85" />
        </div>
        
        <div className="container-modern">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Join Now</span>
            </div>
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
              className="text-lg px-8 py-6 font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/30">
        <div className="container-modern">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md">
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