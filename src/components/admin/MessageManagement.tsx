import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

interface Message {
  _id: string;
  subject: string;
  content: string;
  isRead: boolean;
  fromUserName: string;
  fromUserUniqueId: string;
  adminResponse?: string;
}

interface MessageManagementProps {
  messages: Message[];
  onMarkAsRead: (messageId: string) => Promise<void>;
  onRespond: (messageId: string, response: string) => Promise<void>;
}

export function MessageManagement({ messages, onMarkAsRead, onRespond }: MessageManagementProps) {
  const [responding, setResponding] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<string>("");

  return (
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
              {messages.map((m) => (
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
                            await onMarkAsRead(m._id);
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
                            await onRespond(m._id, responseText.trim());
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
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground">No messages.</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
