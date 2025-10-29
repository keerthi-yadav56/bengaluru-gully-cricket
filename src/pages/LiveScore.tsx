import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Home, Radio, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function LiveScore() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user } = useAuth();
  const myTournaments = useQuery(api.tournaments.getMyTournaments, user?.role === "admin" ? {} : undefined);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const matches = useQuery(
    api.matches.getMatchesByTournament,
    selectedTournamentId ? { tournamentId: selectedTournamentId as any } : "skip"
  );
  const teams = useQuery(
    api.teams.getTeamsByTournament,
    selectedTournamentId ? { tournamentId: selectedTournamentId as any } : "skip"
  );

  const createMatch = useMutation(api.matches.createMatch);
  const updateMatchScore = useMutation(api.matches.updateMatchScore);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const [newMatch, setNewMatch] = useState({
    team1Id: "",
    team2Id: "",
    matchDate: "",
  });

  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [scoreUpdate, setScoreUpdate] = useState({
    team1Score: "",
    team2Score: "",
    team1Overs: "",
    team2Overs: "",
    currentBatting: "",
    status: "",
    winner: "",
  });

  const handleCreateMatch = async () => {
    if (!selectedTournamentId || !newMatch.team1Id || !newMatch.team2Id || !newMatch.matchDate) {
      toast("Please fill all fields");
      return;
    }

    const team1 = (teams ?? []).find((t: any) => t._id === newMatch.team1Id);
    const team2 = (teams ?? []).find((t: any) => t._id === newMatch.team2Id);

    if (!team1 || !team2) {
      toast("Invalid teams selected");
      return;
    }

    try {
      await createMatch({
        tournamentId: selectedTournamentId as any,
        team1Id: newMatch.team1Id as any,
        team2Id: newMatch.team2Id as any,
        team1Name: team1.name,
        team2Name: team2.name,
        matchDate: newMatch.matchDate,
      });
      toast("Match created successfully");
      setNewMatch({ team1Id: "", team2Id: "", matchDate: "" });
    } catch (e: any) {
      toast(e?.message ?? "Failed to create match");
    }
  };

  const handleUpdateScore = async (matchId: string) => {
    try {
      await updateMatchScore({
        matchId: matchId as any,
        team1Score: scoreUpdate.team1Score || undefined,
        team2Score: scoreUpdate.team2Score || undefined,
        team1Overs: scoreUpdate.team1Overs || undefined,
        team2Overs: scoreUpdate.team2Overs || undefined,
        currentBatting: scoreUpdate.currentBatting ? (scoreUpdate.currentBatting as any) : undefined,
        status: scoreUpdate.status ? (scoreUpdate.status as any) : undefined,
        winner: scoreUpdate.winner || undefined,
      });
      toast("Score updated successfully");
      setEditingMatchId(null);
      setScoreUpdate({
        team1Score: "",
        team2Score: "",
        team1Overs: "",
        team2Overs: "",
        currentBatting: "",
        status: "",
        winner: "",
      });
    } catch (e: any) {
      toast(e?.message ?? "Failed to update score");
    }
  };

  const startEditing = (match: any) => {
    setEditingMatchId(match._id);
    setScoreUpdate({
      team1Score: match.team1Score || "",
      team2Score: match.team2Score || "",
      team1Overs: match.team1Overs || "",
      team2Overs: match.team2Overs || "",
      currentBatting: match.currentBatting || "",
      status: match.status || "",
      winner: match.winner || "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-red-500/10 text-red-700 border-red-500/20";
      case "upcoming": return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "completed": return "bg-green-500/10 text-green-700 border-green-500/20";
      default: return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
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
              <span className="text-xl font-bold tracking-tight">Live Score Updates</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {user?.uniqueId ? `Admin: ${user.uniqueId}` : "Admin Panel"}
            </div>
          </div>
        </div>
      </nav>

      <section className="section-padding">
        <div className="container-modern space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Select Tournament
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedTournamentId ?? ""} onValueChange={setSelectedTournamentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tournament" />
                  </SelectTrigger>
                  <SelectContent>
                    {(myTournaments ?? []).map((t: any) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.div>

          {selectedTournamentId && (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Create New Match
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Team 1</Label>
                        <Select value={newMatch.team1Id} onValueChange={(v) => setNewMatch({ ...newMatch, team1Id: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team 1" />
                          </SelectTrigger>
                          <SelectContent>
                            {(teams ?? []).map((t: any) => (
                              <SelectItem key={t._id} value={t._id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Team 2</Label>
                        <Select value={newMatch.team2Id} onValueChange={(v) => setNewMatch({ ...newMatch, team2Id: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team 2" />
                          </SelectTrigger>
                          <SelectContent>
                            {(teams ?? []).map((t: any) => (
                              <SelectItem key={t._id} value={t._id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Match Date</Label>
                        <Input
                          type="datetime-local"
                          value={newMatch.matchDate}
                          onChange={(e) => setNewMatch({ ...newMatch, matchDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleCreateMatch}>Create Match</Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Radio className="w-5 h-5" />
                      Matches
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(matches ?? []).map((match: any) => (
                      <div key={match._id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-lg">
                            {match.team1Name} vs {match.team2Name}
                          </div>
                          <Badge className={`text-xs uppercase ${getStatusColor(match.status)}`}>
                            {match.status}
                          </Badge>
                        </div>

                        {editingMatchId === match._id ? (
                          <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                            <div className="grid md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>{match.team1Name} Score</Label>
                                <Input
                                  placeholder="150/5"
                                  value={scoreUpdate.team1Score}
                                  onChange={(e) => setScoreUpdate({ ...scoreUpdate, team1Score: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{match.team1Name} Overs</Label>
                                <Input
                                  placeholder="18.3"
                                  value={scoreUpdate.team1Overs}
                                  onChange={(e) => setScoreUpdate({ ...scoreUpdate, team1Overs: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{match.team2Name} Score</Label>
                                <Input
                                  placeholder="145/7"
                                  value={scoreUpdate.team2Score}
                                  onChange={(e) => setScoreUpdate({ ...scoreUpdate, team2Score: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{match.team2Name} Overs</Label>
                                <Input
                                  placeholder="20.0"
                                  value={scoreUpdate.team2Overs}
                                  onChange={(e) => setScoreUpdate({ ...scoreUpdate, team2Overs: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Current Batting</Label>
                                <Select value={scoreUpdate.currentBatting} onValueChange={(v) => setScoreUpdate({ ...scoreUpdate, currentBatting: v })}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select batting team" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="team1">{match.team1Name}</SelectItem>
                                    <SelectItem value="team2">{match.team2Name}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={scoreUpdate.status} onValueChange={(v) => setScoreUpdate({ ...scoreUpdate, status: v })}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="live">Live</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>Winner (if completed)</Label>
                                <Input
                                  placeholder="Team name"
                                  value={scoreUpdate.winner}
                                  onChange={(e) => setScoreUpdate({ ...scoreUpdate, winner: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => handleUpdateScore(match._id)}>Save Score</Button>
                              <Button variant="outline" onClick={() => setEditingMatchId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <div className="font-medium">{match.team1Name}</div>
                                <div className="text-2xl font-bold">
                                  {match.team1Score || "0/0"}
                                  {match.team1Overs && <span className="text-sm text-muted-foreground ml-2">({match.team1Overs})</span>}
                                </div>
                              </div>
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <div className="font-medium">{match.team2Name}</div>
                                <div className="text-2xl font-bold">
                                  {match.team2Score || "0/0"}
                                  {match.team2Overs && <span className="text-sm text-muted-foreground ml-2">({match.team2Overs})</span>}
                                </div>
                              </div>
                            </div>
                            {match.currentBatting && (
                              <div className="text-sm text-muted-foreground">
                                Currently batting: {match.currentBatting === "team1" ? match.team1Name : match.team2Name}
                              </div>
                            )}
                            {match.winner && (
                              <div className="text-sm font-medium text-green-600">
                                Winner: {match.winner}
                              </div>
                            )}
                            <Button variant="outline" onClick={() => startEditing(match)}>
                              Update Score
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    {matches?.length === 0 && (
                      <div className="text-sm text-muted-foreground">No matches created yet.</div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
