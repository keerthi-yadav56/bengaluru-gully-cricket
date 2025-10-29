import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type PaymentStatus = "pending" | "paid" | "verified";

interface Team {
  _id: string;
  name: string;
  registrationDate: string;
  ownerUniqueId: string;
  paymentStatus: PaymentStatus;
  players: Array<{
    playerId: string;
    playerName: string;
    playerUniqueId: string;
  }>;
}

interface TournamentOption {
  id: string;
  name: string;
}

interface TeamManagementProps {
  teams: Team[];
  tournamentOptions: TournamentOption[];
  selectedTournamentId: string | null;
  onSelectTournament: (tournamentId: string) => void;
  onPaymentStatusUpdate: (teamId: string, status: PaymentStatus) => Promise<void>;
}

export function TeamManagement({
  teams,
  tournamentOptions,
  selectedTournamentId,
  onSelectTournament,
  onPaymentStatusUpdate,
}: TeamManagementProps) {
  return (
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
                onValueChange={(v) => onSelectTournament(v)}
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
                {teams.map((team) => (
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
                        value={team.paymentStatus}
                        onValueChange={async (val: PaymentStatus) => {
                          try {
                            await onPaymentStatusUpdate(team._id, val);
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
                        {team.players.map((p) => (
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
              {teams.length === 0 && (
                <div className="text-sm text-muted-foreground mt-2">No teams registered yet.</div>
              )}
            </ScrollArea>
          ) : (
            <div className="text-sm text-muted-foreground">Select a tournament to view teams.</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
