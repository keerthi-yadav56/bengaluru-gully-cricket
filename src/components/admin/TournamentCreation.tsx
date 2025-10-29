import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

interface TournamentCreationProps {
  onCreateTournament: (tournamentData: any) => Promise<void>;
}

export function TournamentCreation({ onCreateTournament }: TournamentCreationProps) {
  const [saving, setSaving] = useState(false);
  const [tForm, setTForm] = useState({
    name: "",
    description: "",
    maxTeams: "",
    entryFeePerPerson: "",
    rewards: "",
    groundPhotos: "",
    trophyPhotos: "",
    date: "",
    location: "",
    mapLink: "",
    oversPerMatch: "",
    upiId: "",
    registrationDeadline: "",
  });

  const handleCreateTournament = async () => {
    try {
      setSaving(true);
      await onCreateTournament({
        name: tForm.name,
        description: tForm.description || undefined,
        maxTeams: Number(tForm.maxTeams || 0),
        entryFeePerPerson: Number(tForm.entryFeePerPerson || 0),
        rewards: tForm.rewards,
        groundPhotos: tForm.groundPhotos
          ? tForm.groundPhotos.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        trophyPhotos: tForm.trophyPhotos
          ? tForm.trophyPhotos.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        date: tForm.date,
        location: tForm.location,
        mapLink: tForm.mapLink || undefined,
        oversPerMatch: Number(tForm.oversPerMatch || 0),
        upiId: tForm.upiId,
        registrationDeadline: tForm.registrationDeadline,
      });
      toast("Tournament created successfully");
      setTForm({
        name: "",
        description: "",
        maxTeams: "",
        entryFeePerPerson: "",
        rewards: "",
        groundPhotos: "",
        trophyPhotos: "",
        date: "",
        location: "",
        mapLink: "",
        oversPerMatch: "",
        upiId: "",
        registrationDeadline: "",
      });
    } catch (e: any) {
      toast(e?.message ?? "Failed to create tournament");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="card-modern">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Create New Tournament
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tournament Name *</Label>
            <Input 
              value={tForm.name} 
              onChange={(e) => setTForm({ ...tForm, name: e.target.value })} 
              placeholder="e.g., BGC Summer Cup"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={tForm.description} 
              onChange={(e) => setTForm({ ...tForm, description: e.target.value })} 
              placeholder="Brief description of the tournament"
            />
          </div>
          <div className="space-y-2">
            <Label>Max Teams *</Label>
            <Input 
              type="number" 
              value={tForm.maxTeams} 
              onChange={(e) => setTForm({ ...tForm, maxTeams: e.target.value })} 
              placeholder="e.g., 16"
            />
          </div>
          <div className="space-y-2">
            <Label>Entry Fee Per Person (₹) *</Label>
            <Input 
              type="number" 
              value={tForm.entryFeePerPerson} 
              onChange={(e) => setTForm({ ...tForm, entryFeePerPerson: e.target.value })} 
              placeholder="e.g., 200"
            />
          </div>
          <div className="space-y-2">
            <Label>Rewards *</Label>
            <Input 
              value={tForm.rewards} 
              onChange={(e) => setTForm({ ...tForm, rewards: e.target.value })} 
              placeholder="e.g., Trophies + Medals + Cash Prize"
            />
          </div>
          <div className="space-y-2">
            <Label>Ground Photos (comma-separated URLs)</Label>
            <Input 
              value={tForm.groundPhotos} 
              onChange={(e) => setTForm({ ...tForm, groundPhotos: e.target.value })} 
              placeholder="https://example.com/photo1.jpg, https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Trophy Photos (comma-separated URLs)</Label>
            <Input 
              value={tForm.trophyPhotos} 
              onChange={(e) => setTForm({ ...tForm, trophyPhotos: e.target.value })} 
              placeholder="https://example.com/trophy.jpg, https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Date *</Label>
            <Input 
              type="date"
              value={tForm.date} 
              onChange={(e) => setTForm({ ...tForm, date: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Location *</Label>
            <Input 
              value={tForm.location} 
              onChange={(e) => setTForm({ ...tForm, location: e.target.value })} 
              placeholder="e.g., Indiranagar, Bengaluru"
            />
          </div>
          <div className="space-y-2">
            <Label>Map Link (optional)</Label>
            <Input 
              value={tForm.mapLink} 
              onChange={(e) => setTForm({ ...tForm, mapLink: e.target.value })} 
              placeholder="https://maps.google.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label>Overs Per Match *</Label>
            <Input 
              type="number" 
              value={tForm.oversPerMatch} 
              onChange={(e) => setTForm({ ...tForm, oversPerMatch: e.target.value })} 
              placeholder="e.g., 8"
            />
          </div>
          <div className="space-y-2">
            <Label>UPI ID *</Label>
            <Input 
              value={tForm.upiId} 
              onChange={(e) => setTForm({ ...tForm, upiId: e.target.value })} 
              placeholder="example@upi"
            />
          </div>
          <div className="space-y-2">
            <Label>Registration Deadline *</Label>
            <Input 
              type="date"
              value={tForm.registrationDeadline} 
              onChange={(e) => setTForm({ ...tForm, registrationDeadline: e.target.value })} 
            />
          </div>
          <div className="md:col-span-2 pt-2">
            <Button 
              onClick={handleCreateTournament} 
              disabled={saving}
              className="w-full md:w-auto"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              {saving ? "Creating..." : "Create Tournament"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
