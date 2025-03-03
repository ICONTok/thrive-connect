
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messageContent, setMessageContent] = useState("");
  const [selectedReceiverId, setSelectedReceiverId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Query to get all available contacts (profiles)
  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id);
      if (error) throw error;
      return data;
    },
  });

  // Query to get messages
  const { data: messages } = useQuery({
    queryKey: ['messages', selectedReceiverId],
    queryFn: async () => {
      const query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name),
          receiver:profiles!messages_receiver_id_fkey(full_name)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: true });

      if (selectedReceiverId) {
        query.or(`and(sender_id.eq.${user?.id},receiver_id.eq.${selectedReceiverId}),and(sender_id.eq.${selectedReceiverId},receiver_id.eq.${user?.id})`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedReceiverId || !messageContent.trim()) {
        throw new Error("Please select a contact and enter a message");
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          receiver_id: selectedReceiverId,
          content: messageContent.trim(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessageContent("");
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageMutation.mutate();
  };

  return (
    <MainLayout>
      <div className="w-full max-w-full px-0">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Contacts List */}
          <Card className="p-4 lg:col-span-1 w-full">
            <h2 className="font-semibold mb-4">Contacts</h2>
            <div className="space-y-2">
              {contacts?.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedReceiverId === contact.id
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedReceiverId(contact.id)}
                >
                  <p className="font-medium">{contact.full_name}</p>
                  <p className="text-sm text-gray-500">{contact.user_type}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Messages */}
          <Card className="lg:col-span-3 p-4 flex flex-col w-full">
            <ScrollArea className="flex-1 h-[600px] pr-4">
              <div className="space-y-4">
                {messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg p-3 max-w-[80%] ${
                        message.sender_id === user?.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <p className="text-sm font-semibold mb-1">
                        {message.sender_id === user?.id ? "You" : message.sender?.full_name}
                      </p>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <Input
                placeholder={selectedReceiverId ? "Type a message..." : "Select a contact to start messaging"}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                disabled={!selectedReceiverId}
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!selectedReceiverId || !messageContent.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
