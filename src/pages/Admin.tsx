import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { Home, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { TournamentManagement } from "@/components/admin/TournamentManagement";
import { TeamManagement } from "@/components/admin/TeamManagement";
import { MessageManagement } from "@/components/admin/MessageManagement";
import { TournamentCreation } from "@/components/admin/TournamentCreation";

type TournamentStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
type PaymentStatus = "pending" | "paid" | "verified";

export default function Admin() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

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
  const createTournament = useMutation(api.tournaments.createTournament);

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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 bg-primary rounded-lg grid place-items-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {user?.uniqueId ? `Admin: ${user.uniqueId}` : "Admin Panel"}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  signOut();
                  navigate("/auth");
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="section-padding">
        <div className="container-modern space-y-8">
          <TournamentCreation
            onCreateTournament={async (tournamentData) => {
              await createTournament(tournamentData);
            }}
          />

          <TournamentManagement
            tournaments={myTournaments ?? []}
            onStatusUpdate={async (tournamentId, status) => {
              await updateTournamentStatus({ tournamentId: tournamentId as any, status: status as any });
            }}
            onSelectTournament={setSelectedTournamentId}
          />

          <TeamManagement
            teams={teamsForSelected ?? []}
            tournamentOptions={tournamentOptions}
            selectedTournamentId={selectedTournamentId}
            onSelectTournament={setSelectedTournamentId}
            onPaymentStatusUpdate={async (teamId, status) => {
              await updatePaymentStatus({ teamId: teamId as any, status: status as any });
            }}
          />

          <MessageManagement
            messages={allMessages ?? []}
            onMarkAsRead={async (messageId) => {
              await markMessageAsRead({ messageId: messageId as any });
            }}
            onRespond={async (messageId, response) => {
              await respondToMessage({ messageId: messageId as any, response });
            }}
          />
        </div>
      </section>
    </div>
  );
}