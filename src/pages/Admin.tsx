import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Shield, Trophy, Users, Mail, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type TournamentStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
type PaymentStatus = "pending" | "paid" | "verified";

export default function Admin() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) navigate("/auth");
      else if (user?.role !== "admin") navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const myTournaments = useQuery(api.tournaments.getMyTournaments, user?.role === "admin" ? {} : undefined);
  const allMessages = useQuery(api.messages.getAllMessages, user?.role === "admin" ? {} : undefined);

  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const teamsForSelected = useQuery(
    api.teams.getTeamsByTournament,
    selectedTournamentId ? { tournamentId: selectedTournamentId as any } : "skip"
  );

  const updateTournamentStatus = useMutation(api.tournaments.updateTournamentStatus);
  const updatePaymentStatus = useMutation(api.teams.updatePaymentStatus);
  const markMessageAsRead = useMutation(api.messages.markMessageAsRead);
  const respondToMessage = useMutation(api.messages.respondToMessage);

  const [responding, setResponding] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<string>("");

  const tournamentOptions = useMemo(
    () => (myTournaments ?? []).map((t: any) => ({ id: t._id as string, name: t.name as string })),
    [myTournaments]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-modern">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg grid place-items-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">Admin Dashboard</span>
            </div>
            <div className="text-sm text-muted-foreground">Manage tournaments, teams, and messages</div>
          </div>
        </div>
      </nav>

      <section className="section-padding">
        <div className="container-modern space-y-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="card-modern">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Tournaments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(myTournaments ?? []).map((t: any) => (
                    <div key={t._id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.date}</div>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">{t.location}</div>
                      <div className="space-y-1">
                        <div className="text-xs">Status</div>
                        <Select
                          value={t.status as TournamentStatus}
                          onValueChange={async (val: TournamentStatus) => {
                            try {
                              await updateTournamentStatus({ tournamentId: t._id, status: val as any });
                              toast("Tournament status updated");
                            } catch (e: any) {
                              toast(e?.message ?? "Failed to update status");
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedTournamentId(t._id)}
                      >
                        View Teams
                      </Button>
                    </div>
                  ))}
                </div>
                {(myTournaments ?? []).length === 0 && (
                  <div className="text-sm text-muted-foreground">No tournaments yet.</div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="card-modern">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Teams
                  </span>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Select tournament</Label>
                    <Select
                      value={selectedTournamentId ?? ""}
                      onValueChange={(v) => setSelectedTournamentId(v)}
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Choose tournament" />
                      </SelectTrigger>
                      <SelectContent>
                        {tournamentOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTournamentId ? (
                  <ScrollArea className="h-[50vh]">
                    <div className="pr-2 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(teamsForSelected ?? []).map((team: any) => (
                        <div key={team._id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{team.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(team.registrationDate).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">Owner: {team.ownerUniqueId}</div>
                          <div className="space-y-1">
                            <div className="text-xs">Payment Status</div>
                            <Select
                              value={team.paymentStatus as PaymentStatus}
                              onValueChange={async (val: PaymentStatus) => {
                                try {
                                  await updatePaymentStatus({ teamId: team._id, status: val as any });
                                  toast("Payment status updated");
                                } catch (e: any) {
                                  toast(e?.message ?? "Failed to update payment status");
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <div className="text-xs font-medium">Players</div>
                            <div className="space-y-1 text-sm">
                              {team.players.map((p: any) => (
                                <div key={p.playerId} className="flex items-center justify-between">
                                  <span className="truncate">{p.playerName}</span>
                                  <span className="text-xs text-muted-foreground">{p.playerUniqueId}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {(teamsForSelected ?? []).length === 0 && (
                      <div className="text-sm text-muted-foreground mt-2">No teams registered yet.</div>
                    )}
                  </ScrollArea>
                ) : (
                  <div className="text-sm text-muted-foreground">Select a tournament to view teams.</div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="card-modern">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[50vh]">
                  <div className="pr-2 space-y-3">
                    {(allMessages ?? []).map((m: any) => (
                      <div key={m._id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between">
                          <div className="font-medium">{m.subject}</div>
                          <div className="text-xs text-muted-foreground">
                            {m.isRead ? "Read" : "Unread"} • {m.fromUserName} ({m.fromUserUniqueId})
                          </div>
                        </div>
                        <div className="text-sm">{m.content}</div>
                        {m.adminResponse && (
                          <div className="text-sm text-primary">Response: {m.adminResponse}</div>
                        )}
                        <div className="flex items-center gap-2">
                          {!m.isRead && (
                            <Button
                              variant="outline"
                              onClick={async () => {
                                try {
                                  await markMessageAsRead({ messageId: m._id });
                                  toast("Marked as read");
                                } catch (e: any) {
                                  toast(e?.message ?? "Failed to mark as read");
                                }
                              }}
                            >
                              Mark as Read
                            </Button>
                          )}
                          <div className="flex items-center gap-2 w-full">
                            <Input
                              placeholder="Write a response..."
                              value={responding === m._id ? responseText : ""}
                              onChange={(e) => {
                                setResponding(m._id);
                                setResponseText(e.target.value);
                              }}
                            />
                            <Button
                              onClick={async () => {
                                if (!(responding === m._id && responseText.trim())) return;
                                try {
                                  await respondToMessage({ messageId: m._id, response: responseText.trim() });
                                  toast("Responded");
                                  setResponding(null);
                                  setResponseText("");
                                } catch (e: any) {
                                  toast(e?.message ?? "Failed to respond");
                                }
                              }}
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(allMessages ?? []).length === 0 && (
                      <div className="text-sm text-muted-foreground">No messages.</div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}