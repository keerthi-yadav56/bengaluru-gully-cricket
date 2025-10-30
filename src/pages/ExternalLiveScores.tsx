import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import { motion } from "framer-motion";
import { Home, Radio, RefreshCw, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface CricketMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  score?: Array<{
    r: number;
    w: number;
    o: number;
    inning: string;
  }>;
  teamInfo?: Array<{
    name: string;
    shortname: string;
    img: string;
  }>;
}

export default function ExternalLiveScores() {
  const navigate = useNavigate();
  const fetchMatches = useAction(api.externalCricket.fetchLiveCricketMatches);
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMatches = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMatches({});
      if (data?.data) {
        setMatches(data.data);
        setLastUpdated(new Date());
        toast.success("Scores updated successfully");
      } else {
        toast.error("No match data available");
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to load cricket scores");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
    const interval = setInterval(loadMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("live") || lowerStatus.includes("innings break")) {
      return "bg-red-500/10 text-red-700 border-red-500/20";
    }
    if (lowerStatus.includes("match not started") || lowerStatus.includes("upcoming")) {
      return "bg-blue-500/10 text-blue-700 border-blue-500/20";
    }
    if (lowerStatus.includes("match ended") || lowerStatus.includes("completed")) {
      return "bg-green-500/10 text-green-700 border-green-500/20";
    }
    return "bg-gray-500/10 text-gray-700 border-gray-500/20";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-modern">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg grid place-items-center shadow-md">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Live Cricket Scores</span>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={loadMatches}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="section-padding">
        <div className="container-modern space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">IPL • ICC • International Matches</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">Live Cricket Scores</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real-time updates from IPL, ICC tournaments, and international cricket matches
            </p>
          </motion.div>

          {isLoading && matches.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading live cricket scores...</p>
            </div>
          ) : matches.length === 0 ? (
            <Card className="card-modern">
              <CardContent className="py-12 text-center">
                <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No live matches at the moment</p>
                <Button onClick={loadMatches} className="mt-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Scores
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {matches.map((match, idx) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <Card className="card-modern hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-tight">{match.name}</CardTitle>
                        <Badge className={`text-xs uppercase ${getStatusBadge(match.status)}`}>
                          {match.status.includes("Live") ? "🔴 LIVE" : match.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {match.matchType} • {match.venue}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {match.score && match.score.length > 0 ? (
                        <div className="space-y-2">
                          {match.score.map((scoreData, idx) => (
                            <div key={idx} className="bg-muted/50 p-3 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{scoreData.inning}</span>
                                <span className="text-2xl font-bold">
                                  {scoreData.r}/{scoreData.w}
                                  <span className="text-sm text-muted-foreground ml-2">
                                    ({scoreData.o} ov)
                                  </span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-muted/30 p-4 rounded-lg text-center text-sm text-muted-foreground">
                          {match.status.includes("not started") 
                            ? `Match starts: ${new Date(match.dateTimeGMT).toLocaleString()}`
                            : "Score details not available"}
                        </div>
                      )}
                      
                      {match.teams && match.teams.length > 0 && (
                        <div className="flex items-center justify-between text-sm pt-2 border-t">
                          <span className="font-medium">{match.teams[0]}</span>
                          <span className="text-muted-foreground">vs</span>
                          <span className="font-medium">{match.teams[1]}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
