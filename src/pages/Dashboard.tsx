import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Mail, Shield, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Queries
  const myPlayer = useQuery(api.players.getMyPlayer);
  const myTeams = useQuery(api.teams.getMyTeams);
  // Only run when user is admin by passing undefined to skip the query
  const allMessages = useQuery(api.messages.getAllMessages, user?.role === "admin" ? {} : undefined);

  // Mutations
  const completeProfile = useMutation(api.authHelpers.completeUserProfile);
  const verifyPhone = useMutation(api.authHelpers.verifyPhone);
  const createPlayer = useMutation(api.players.createPlayer);
  const updatePlayer = useMutation(api.players.updatePlayer);
  const sendMessage = useMutation(api.messages.sendMessage);
  const createTournament = useMutation(api.tournaments.createTournament);
  const markMessageAsRead = useMutation(api.messages.markMessageAsRead);
  const respondToMessage = useMutation(api.messages.respondToMessage);

  const needsProfile = useMemo(() => {
    if (!user) return false;
    return !user.fullName || !user.phoneNumber || !user.uniqueId || !user.isPhoneVerified;
  }, [user]);

  // Profile completion state
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [profileStep, setProfileStep] = useState<"info" | "verify">("info");
  const [saving, setSaving] = useState(false);

  const handleCompleteProfile = async () => {
    if (!fullName.trim() || !phoneNumber.trim()) {
      toast("Please enter full name and phone number");
      return;
    }
    try {
      setSaving(true);
      await completeProfile({ fullName: fullName.trim(), phoneNumber: phoneNumber.trim() });
      toast("Profile saved. Verify your phone number.");
      setProfileStep("verify");
    } catch (e: any) {
      toast(e?.message ?? "Failed to complete profile");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (phoneOtp.length !== 6) {
      toast("Enter 6-digit OTP");
      return;
    }
    try {
      setSaving(true);
      await verifyPhone({ phoneNumber: phoneNumber.trim() || user?.phoneNumber || "", otp: phoneOtp });
      toast("Phone verified");
      setProfileStep("info");
      setPhoneOtp("");
    } catch (e: any) {
      toast(e?.message ?? "Failed to verify phone");
    } finally {
      setSaving(false);
    }
  };

  // Player profile state
  const [age, setAge] = useState<number>(myPlayer?.age ?? 18);
  const [area, setArea] = useState<string>(myPlayer?.area ?? "");
  const [battingHand, setBattingHand] = useState<"right" | "left">((myPlayer?.battingHand as any) ?? "right");
  const [bowlingHand, setBowlingHand] = useState<"right" | "left">((myPlayer?.bowlingHand as any) ?? "right");
  const [additionalInfo, setAdditionalInfo] = useState<string>(myPlayer?.additionalInfo ?? "");

  useEffect(() => {
    if (myPlayer) {
      setAge(myPlayer.age ?? 18);
      setArea(myPlayer.area ?? "");
      setBattingHand((myPlayer.battingHand as any) ?? "right");
      setBowlingHand((myPlayer.bowlingHand as any) ?? "right");
      setAdditionalInfo(myPlayer.additionalInfo ?? "");
    }
  }, [myPlayer]);

  const handleSavePlayer = async () => {
    try {
      setSaving(true);
      if (myPlayer?._id) {
        await updatePlayer({
          playerId: myPlayer._id,
          age,
          area,
          battingHand,
          bowlingHand,
          additionalInfo: additionalInfo || undefined,
        });
        toast("Player profile updated");
      } else {
        await createPlayer({
          age,
          area,
          battingHand,
          bowlingHand,
          additionalInfo: additionalInfo || undefined,
        });
        toast("Player profile created");
      }
    } catch (e: any) {
      toast(e?.message ?? "Failed to save player profile");
    } finally {
      setSaving(false);
    }
  };

  // Message state
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const handleSendMessage = async () => {
    if (!subject.trim() || !content.trim()) {
      toast("Please add subject and message");
      return;
    }
    try {
      await sendMessage({ subject: subject.trim(), content: content.trim() });
      toast("Message sent");
      setSubject("");
      setContent("");
    } catch (e: any) {
      toast(e?.message ?? "Failed to send message");
    }
  };

  // Admin create tournament
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
      await createTournament({
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
      } as any);
      toast("Tournament created");
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-modern">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg grid place-items-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {user?.uniqueId ? `ID: ${user.uniqueId}` : "Complete your profile"}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Sign out and navigate to auth
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
          {needsProfile && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle>Complete your profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileStep === "info" ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full name</Label>
                          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone number</Label>
                          <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+91 XXXXX XXXXX" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCompleteProfile} disabled={saving}>
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                          Save & Continue
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Enter OTP (6 digits)</Label>
                        <Input
                          maxLength={6}
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="123456"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleVerifyPhone} disabled={saving || phoneOtp.length !== 6}>
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                          Verify Phone
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>Your Player Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value || 0))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Area (Bengaluru)</Label>
                    <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Indiranagar" />
                  </div>
                  <div className="space-y-2">
                    <Label>Additional info</Label>
                    <Textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} placeholder="Role, strengths, schedule..." />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Batting hand</Label>
                    <RadioGroup value={battingHand} onValueChange={(v) => setBattingHand(v as any)} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id="bat-right" value="right" />
                        <Label htmlFor="bat-right">Right</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id="bat-left" value="left" />
                        <Label htmlFor="bat-left">Left</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Bowling hand</Label>
                    <RadioGroup value={bowlingHand} onValueChange={(v) => setBowlingHand(v as any)} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id="bowl-right" value="right" />
                        <Label htmlFor="bowl-right">Right</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id="bowl-left" value="left" />
                        <Label htmlFor="bowl-left">Left</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSavePlayer} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
                    {myPlayer ? "Update Profile" : "Create Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>My Teams</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(myTeams ?? []).map((team: any) => (
                  <div key={team._id} className="border rounded-lg p-4">
                    <div className="font-medium">{team.name}</div>
                    <div className="text-sm text-muted-foreground">{team.tournament?.name ?? "Tournament"}</div>
                    <div className="text-sm">Status: {team.paymentStatus}</div>
                    <div className="text-xs text-muted-foreground">Registered: {new Date(team.registrationDate).toLocaleString()}</div>
                  </div>
                ))}
                {myTeams?.length === 0 && <div className="text-sm text-muted-foreground">No teams yet.</div>}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>Contact Admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your message..." />
                </div>
                <Button onClick={handleSendMessage}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {user?.role === "admin" && (
            <>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle>Admin • Create Tournament</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={tForm.name} onChange={(e) => setTForm({ ...tForm, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input value={tForm.description} onChange={(e) => setTForm({ ...tForm, description: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Teams</Label>
                      <Input type="number" value={tForm.maxTeams} onChange={(e) => setTForm({ ...tForm, maxTeams: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Entry Fee Per Person (₹)</Label>
                      <Input type="number" value={tForm.entryFeePerPerson} onChange={(e) => setTForm({ ...tForm, entryFeePerPerson: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Rewards</Label>
                      <Input value={tForm.rewards} onChange={(e) => setTForm({ ...tForm, rewards: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ground Photos (comma-separated URLs)</Label>
                      <Input value={tForm.groundPhotos} onChange={(e) => setTForm({ ...tForm, groundPhotos: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Trophy Photos (comma-separated URLs)</Label>
                      <Input value={tForm.trophyPhotos} onChange={(e) => setTForm({ ...tForm, trophyPhotos: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input value={tForm.date} onChange={(e) => setTForm({ ...tForm, date: e.target.value })} placeholder="YYYY-MM-DD" />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input value={tForm.location} onChange={(e) => setTForm({ ...tForm, location: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Map Link (optional)</Label>
                      <Input value={tForm.mapLink} onChange={(e) => setTForm({ ...tForm, mapLink: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Overs Per Match</Label>
                      <Input type="number" value={tForm.oversPerMatch} onChange={(e) => setTForm({ ...tForm, oversPerMatch: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>UPI ID</Label>
                      <Input value={tForm.upiId} onChange={(e) => setTForm({ ...tForm, upiId: e.target.value })} placeholder="example@upi" />
                    </div>
                    <div className="space-y-2">
                      <Label>Registration Deadline</Label>
                      <Input value={tForm.registrationDeadline} onChange={(e) => setTForm({ ...tForm, registrationDeadline: e.target.value })} placeholder="YYYY-MM-DD" />
                    </div>
                    <div className="md:col-span-2">
                      <Button onClick={handleCreateTournament} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                        Create
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle>Admin • Messages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                              onClick={() => markMessageAsRead({ messageId: m._id })}
                            >
                              Mark as Read
                            </Button>
                          )}
                          <AdminRespond
                            onRespond={async (response) => {
                              await respondToMessage({ messageId: m._id, response });
                              toast("Responded");
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {allMessages?.length === 0 && (
                      <div className="text-sm text-muted-foreground">No messages.</div>
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

function AdminRespond({ onRespond }: { onRespond: (resp: string) => Promise<void> }) {
  const [resp, setResp] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <Input value={resp} onChange={(e) => setResp(e.target.value)} placeholder="Write a response..." />
      <Button
        onClick={async () => {
          if (!resp.trim()) return;
          setSaving(true);
          try {
            await onRespond(resp.trim());
            setResp("");
          } finally {
            setSaving(false);
          }
        }}
        disabled={saving}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
      </Button>
    </div>
  );
}