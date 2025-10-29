import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type TournamentStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

interface Tournament {
  _id: string;
  name: string;
  date: string;
  location: string;
  status: TournamentStatus;
}

interface TournamentManagementProps {
  tournaments: Tournament[];
  onStatusUpdate: (tournamentId: string, status: TournamentStatus) => Promise<void>;
  onSelectTournament: (tournamentId: string) => void;
}

export function TournamentManagement({ 
  tournaments, 
  onStatusUpdate, 
  onSelectTournament 
}: TournamentManagementProps) {
  return (
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
            {tournaments.map((t) => (
              <div key={t._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.date}</div>
                </div>
                <div className="text-sm text-muted-foreground truncate">{t.location}</div>
                <div className="space-y-1">
                  <div className="text-xs">Status</div>
                  <Select
                    value={t.status}
                    onValueChange={async (val: TournamentStatus) => {
                      try {
                        await onStatusUpdate(t._id, val);
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
                  onClick={() => onSelectTournament(t._id)}
                >
                  View Teams
                </Button>
              </div>
            ))}
          </div>
          {tournaments.length === 0 && (
            <div className="text-sm text-muted-foreground">No tournaments yet.</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
