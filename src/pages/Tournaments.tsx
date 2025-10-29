import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Banknote, Calendar, Home, MapPin, Plus, Trophy, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Tournaments() {
  const navigate = useNavigate();
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const tournaments = useQuery(api.tournaments.getAllTournaments);
  const allPlayers = useQuery(api.players.getAllPlayers);
  const registerTeam = useMutation(api.teams.registerTeam);

  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const canRegister = useMemo(() => {
    return !!(isAuthenticated && user && user.uniqueId);
  }, [isAuthenticated, user]);

  const handleToggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const resetDialog = () => {
    setTeamName("");
    setSelected(new Set());
    setSelectedTournamentId(null);
  };

  const openForTournament = (tId: string) => {
    setSelectedTournamentId(tId);
    setOpen(true);
  };

  const submitRegistration = async () => {
    if (!selectedTournamentId) return;
    if (!teamName.trim()) {
      toast("Please provide a team name");
      return;
    }
    if (selected.size === 0) {
      toast("Select at least one player");
      return;
    }
    try {
      const chosen = (allPlayers ?? []).filter((p: any) => selected.has(p._id));
      await registerTeam({
        teamName,
        tournamentId: selectedTournamentId as any,
        players: chosen.map((p: any) => ({
          playerId: p._id,
          playerName: p.user?.name ?? "Unknown",
          playerUniqueId: p.user?.uniqueId ?? "",
        })),
      });
      toast("Team registered. Awaiting payment verification.");
      setOpen(false);
      resetDialog();
    } catch (e: any) {
      toast(e?.message ?? "Failed to register team");
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
              <div className="w-10 h-10 bg-primary rounded-lg grid place-items-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">Tournaments</span>
            </div>
            {!authLoading && (
              <div className="text-sm text-muted-foreground">
                {isAuthenticated ? (
                  <span>Signed in{user?.uniqueId ? ` • ${user.uniqueId}` : ""}</span>
                ) : (
                  <span>Browse tournaments</span>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <section className="section-padding">
        <div className="container-modern">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight">Available Tournaments</h1>
            <p className="text-muted-foreground mt-2">
              Join upcoming cricket tournaments across Bengaluru. Team owners register on behalf of their teams.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(tournaments ?? []).map((t: any, idx: number) => (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Card className="card-modern h-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <span className="tracking-tight">{t.name}</span>
                      <span className="text-xs text-muted-foreground uppercase">{t.status}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>Max teams: {t.maxTeams}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Banknote className="w-4 h-4 text-muted-foreground" />
                      <span>Entry fee per person: ₹{t.entryFeePerPerson}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{t.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{t.location}</span>
                    </div>
                    {t.mapLink && (
                      <a
                        href={t.mapLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline text-primary"
                      >
                        Open Map
                      </a>
                    )}
                    <div className="text-sm">
                      <span className="font-medium">Overs per match:</span> {t.oversPerMatch}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Rewards:</span> {t.rewards}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Registration deadline:</span> {t.registrationDeadline}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      UPI ID (pay externally): <span className="font-mono">{t.upiId}</span>
                    </div>

                    <div className="pt-2">
                      {canRegister ? (
                        <Dialog open={open && selectedTournamentId === t._id} onOpenChange={(v) => { if (!v) setOpen(false); }}>
                          <DialogTrigger asChild>
                            <Button
                              className="w-full"
                              onClick={() => openForTournament(t._id)}
                              disabled={t.status !== "upcoming"}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Register Team
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Register Team for {t.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Team name</Label>
                                <Input
                                  value={teamName}
                                  onChange={(e) => setTeamName(e.target.value)}
                                  placeholder="Enter your team name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Select players</Label>
                                <ScrollArea className="h-64 rounded-md border">
                                  <div className="p-3 space-y-2">
                                    {(allPlayers ?? []).map((p: any) => (
                                      <label
                                        key={p._id}
                                        className="flex items-center gap-3 rounded-md border p-2 cursor-pointer"
                                      >
                                        <Checkbox
                                          checked={selected.has(p._id)}
                                          onCheckedChange={() => handleToggle(p._id)}
                                        />
                                        <div className="text-sm">
                                          <div className="font-medium">{p.user?.name ?? "Unknown"}</div>
                                          <div className="text-muted-foreground">{p.user?.uniqueId ?? ""}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {p.area} • {p.age} yrs • Bat: {p.battingHand} • Bowl: {p.bowlingHand}
                                          </div>
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                </ScrollArea>
                                <div className="text-xs text-muted-foreground">
                                  Tip: Players must have created their profiles to appear here.
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => { setOpen(false); resetDialog(); }}>
                                  Cancel
                                </Button>
                                <Button onClick={submitRegistration}>Submit Registration</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button className="w-full" disabled>
                          Sign in and complete profile to register
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
