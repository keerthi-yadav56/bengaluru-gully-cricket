import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Badge, Users } from "lucide-react";
import { useMemo, useState } from "react";

export default function Players() {
  const players = useQuery(api.players.getAllPlayers);

  // filters
  const [area, setArea] = useState("");
  const [bat, setBat] = useState<string>("any"); // non-empty values required by shadcn Select.Item
  const [bowl, setBowl] = useState<string>("any");

  const filtered = useMemo(() => {
    const a = (area || "").trim().toLowerCase();
    return (players ?? []).filter((p: any) => {
      const areaOk = a ? String(p.area || "").toLowerCase().includes(a) : true;
      const batOk = bat === "any" ? true : String(p.battingHand) === bat;
      const bowlOk = bowl === "any" ? true : String(p.bowlingHand) === bowl;
      return areaOk && batOk && bowlOk;
    });
  }, [players, area, bat, bowl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-modern">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg grid place-items-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">Players</span>
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
            className="space-y-4"
          >
            <Card className="card-modern">
              <CardHeader className="pb-4">
                <CardTitle className="tracking-tight">Explore Players</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Area</Label>
                  <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Search area (e.g., Indiranagar)" />
                </div>
                <div className="space-y-2">
                  <Label>Batting hand</Label>
                  <Select value={bat} onValueChange={setBat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Batting</SelectLabel>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bowling hand</Label>
                  <Select value={bowl} onValueChange={setBowl}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Bowling</SelectLabel>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="card-modern">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="tracking-tight">Active Players</CardTitle>
                  <div className="text-sm text-muted-foreground">{filtered.length} result(s)</div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[65vh]">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
                    {(filtered ?? []).map((p: any, idx: number) => (
                      <motion.div
                        key={p._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: idx * 0.03 }}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{p.user?.name ?? "Unknown"}</div>
                          <Badge className="text-xs">{p.user?.uniqueId ?? ""}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{p.area}</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Age: {p.age} • Bat: {p.battingHand} • Bowl: {p.bowlingHand}
                        </div>
                        {p.additionalInfo && (
                          <div className="text-sm mt-2 line-clamp-2">{p.additionalInfo}</div>
                        )}
                      </motion.div>
                    ))}
                    {filtered.length === 0 && (
                      <div className="text-sm text-muted-foreground">No players found with current filters.</div>
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
