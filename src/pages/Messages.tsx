
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  Phone, 
  Video, 
  MoreHorizontal, 
  X, 
  Smile, 
  Paperclip, 
  Mic, 
  Send,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { EmojiPicker } from "@/components/ui/emoji-picker";

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messageContent, setMessageContent] = useState("");
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = useState("Latest First");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSideProfile, setShowSideProfile] = useState(true);

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id);
      if (error) throw error;
      
      return data?.map(contact => ({
        ...contact,
        status: Math.random() > 0.5 ? 'Online' : 'Offline',
        last_seen: Math.random() > 0.5 ? 'Last seen 3 hours ago' : '',
        last_message: {
          content: [
            "Analysis of foreign experience, as it is commonly...",
            "It seems logical that the strategy of providing!",
            "I remember everything mate. See you later 🔥",
            "I will miss you too, my dear!",
            "Welcome to the community mate! 👍"
          ][Math.floor(Math.random() * 5)],
          time: `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'am' : 'pm'}`
        },
        unread: Math.floor(Math.random() * 3)
      }));
    },
  });

  const { data: messages } = useQuery({
    queryKey: ['messages', selectedContact?.id],
    queryFn: async () => {
      if (!selectedContact) return [];
      
      const query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name),
          receiver:profiles!messages_receiver_id_fkey(full_name)
        `)
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      
      if (!data.length) {
        return [
          {
            id: 'dummy-1',
            content: "Hi! What's Up?",
            sender_id: selectedContact.id,
            receiver_id: user?.id,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            sender: { full_name: selectedContact.full_name },
            time_display: 'Yesterday 14:26 PM'
          },
          {
            id: 'dummy-2',
            content: "Oh, hello! All perfectly. I work, study and know this wonderful world!",
            sender_id: user?.id,
            receiver_id: selectedContact.id,
            created_at: new Date(Date.now() - 82800000).toISOString(),
            sender: { full_name: user?.user_metadata?.full_name || "You" },
            time_display: 'Yesterday 14:38 PM'
          },
          {
            id: 'dummy-3',
            audio: true,
            duration: '01:24',
            sender_id: selectedContact.id,
            receiver_id: user?.id,
            created_at: new Date(Date.now() - 79200000).toISOString(),
            sender: { full_name: selectedContact.full_name },
            time_display: 'Yesterday 19:22 PM'
          },
          {
            id: 'dummy-4',
            content: "I remember everything mate. See you later 🔥",
            sender_id: user?.id,
            receiver_id: selectedContact.id,
            created_at: new Date().toISOString(),
            sender: { full_name: user?.user_metadata?.full_name || "You" },
            time_display: 'Today 06:18 AM'
          }
        ];
      }
      
      return data;
    },
  });

  const filteredContacts = contacts?.filter(contact => 
    contact.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortContacts = (contacts: any[]) => {
    if (!contacts) return [];
    
    return [...contacts].sort((a, b) => {
      if (sortBy === "Latest First") {
        return b.unread - a.unread || (a.status === "Online" ? -1 : 1);
      } else if (sortBy === "Oldest First") {
        return a.unread - b.unread || (a.status === "Online" ? -1 : 1);
      } else if (sortBy === "Name") {
        return a.full_name.localeCompare(b.full_name);
      } else if (sortBy === "Online") {
        return a.status === "Online" ? -1 : 1;
      }
      return 0;
    });
  };

  const sortedContacts = sortContacts(filteredContacts || []);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (contacts?.length && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [contacts, selectedContact]);

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedContact || !user?.id) return;
      
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', selectedContact.id)
        .eq('receiver_id', user.id)
        .is('read_at', null);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  // When a contact is selected, mark their messages as read
  useEffect(() => {
    if (selectedContact) {
      markAsReadMutation.mutate();
    }
  }, [selectedContact]);

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedContact || !messageContent.trim()) {
        throw new Error("Please select a contact and enter a message");
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          receiver_id: selectedContact.id,
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
  
  const handleAddEmoji = (emoji: string) => {
    setMessageContent(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };
  
  const handleStartRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Voice recording in progress...",
      });
      
      // In a real app, this would start actual recording
      // For now, we'll just toggle the state and show a toast
    } else {
      toast({
        title: "Recording not available",
        description: "Your browser doesn't support voice recording",
        variant: "destructive",
      });
    }
  };
  
  const handleStopRecording = () => {
    setIsRecording(false);
    toast({
      title: "Recording saved",
      description: "Your voice message is ready to send",
    });
    
    // In a real app, this would process and attach the recording
  };
  
  const handleFileAttachment = () => {
    // Create a file input and trigger it programmatically
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.pdf,.doc,.docx';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) {
        const file = target.files[0];
        toast({
          title: "File attached",
          description: `${file.name} is ready to send`,
        });
        
        // In a real app, this would process the file and prepare it for sending
      }
    };
    fileInput.click();
  };
  
  const handleVideoCall = () => {
    if (selectedContact) {
      toast({
        title: "Video call initiated",
        description: `Starting a video call with ${selectedContact.full_name}...`,
      });
      
      // In a real app, this would initiate a video call
    }
  };
  
  const handleVoiceCall = () => {
    if (selectedContact) {
      toast({
        title: "Voice call initiated",
        description: `Starting a voice call with ${selectedContact.full_name}...`,
      });
      
      // In a real app, this would initiate a voice call
    }
  };
  
  const toggleSortBy = () => {
    const options = ["Latest First", "Oldest First", "Name", "Online"];
    const currentIndex = options.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortBy(options[nextIndex]);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="w-[300px] border-r bg-white flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Enter for search..." 
              className="pl-10 bg-gray-100 border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="px-4 py-2 flex justify-between items-center border-b">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">Sort By:</p>
            <div 
              className="flex items-center gap-1 cursor-pointer" 
              onClick={toggleSortBy}
            >
              <span className="text-sm font-medium">{sortBy}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">{filteredContacts?.length || 0}</span>
            <div className="bg-gray-200 rounded-full p-1 h-6 w-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-3 border-b">
          <Button 
            variant="default" 
            size="sm" 
            className="rounded-full bg-red-500 hover:bg-red-600"
            onClick={() => {
              toast({
                title: "New conversation",
                description: "Create a new conversation feature coming soon",
              });
            }}
          >
            <span>Add New</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto">
          {sortedContacts?.map((contact) => (
            <div
              key={contact.id}
              className={`flex p-4 border-b cursor-pointer transition-colors ${
                selectedContact?.id === contact.id ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="relative mr-3">
                <Avatar className="h-12 w-12">
                  <img 
                    src={`https://images.unsplash.com/photo-${['1488590528505-98d2b5aba04b', '1518770660439-4636190af475', '1461749280684-dccba630e2f6', '1486312338219-ce68d2c6f44d'][Math.floor(Math.random() * 4)]}`} 
                    alt={contact.full_name} 
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {contact.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${contact.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 truncate">{contact.full_name}</h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{contact.last_message.time}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <p className="text-sm truncate">{contact.status}</p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-600 truncate">{contact.last_message.content}</p>
                  {contact.unread > 0 && (
                    <span className="flex-shrink-0 ml-2 bg-red-500 text-white rounded-full text-xs h-5 w-5 flex items-center justify-center">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedContact ? (
        <div className="flex-1 flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <img 
                  src={`https://images.unsplash.com/photo-1649972904349-6e44c42644a7`} 
                  alt={selectedContact.full_name} 
                  className="object-cover"
                />
                <AvatarFallback>
                  {selectedContact.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{selectedContact.full_name}</h3>
                <p className="text-xs text-gray-500">{selectedContact.status === 'Online' ? 'Online' : selectedContact.last_seen || 'Offline'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleVoiceCall}
              >
                <Phone className="h-5 w-5 text-gray-500" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleVideoCall}
              >
                <Video className="h-5 w-5 text-gray-500" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowSideProfile(!showSideProfile)}>
                    {showSideProfile ? "Hide" : "Show"} Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>Clear Chat</DropdownMenuItem>
                  <DropdownMenuItem>Block Contact</DropdownMenuItem>
                  <DropdownMenuItem>Report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSelectedContact(null)}
              >
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages?.map((message) => (
              <div 
                key={message.id} 
                className={`mb-4 ${message.sender_id === user?.id ? "flex justify-end" : "flex justify-start"}`}
              >
                {message.audio ? (
                  <div className="bg-white rounded-lg shadow p-3 max-w-xs md:max-w-md">
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" className="rounded-full bg-red-500 hover:bg-red-600 text-white h-8 w-8">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </Button>
                      <div className="mx-2 flex-1">
                        <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full w-3/4"></div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{message.duration}</span>
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-xs text-gray-500">{message.time_display || 'Today'}</span>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`rounded-lg shadow-sm p-3 max-w-xs md:max-w-md ${
                      message.sender_id === user?.id 
                        ? "bg-red-500 text-white" 
                        : "bg-white text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`text-right mt-1 ${message.sender_id === user?.id ? "text-red-200" : "text-gray-500"}`}>
                      <span className="text-xs">{message.time_display || format(new Date(message.created_at), "p")}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex items-center justify-center space-x-3 py-2 bg-white border-t">
            <span className="text-2xl cursor-pointer" onClick={() => handleAddEmoji("😊")}>😊</span>
            <span className="text-2xl cursor-pointer" onClick={() => handleAddEmoji("😃")}>😃</span>
            <span className="text-2xl cursor-pointer" onClick={() => handleAddEmoji("👍")}>👍</span>
            <span className="text-2xl cursor-pointer" onClick={() => handleAddEmoji("👆")}>👆</span>
            <span className="text-2xl cursor-pointer" onClick={() => handleAddEmoji("👋")}>👋</span>
            <span className="text-2xl cursor-pointer" onClick={() => handleAddEmoji("🙏")}>🙏</span>
            <span className="text-2xl cursor-pointer" onClick={() => handleAddEmoji("😎")}>😎</span>
            <span className="text-2xl cursor-pointer" onClick={() => handleAddEmoji("👏")}>👏</span>
            <span 
              className="text-2xl cursor-pointer"
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            >
              ...
            </span>
          </div>
          
          <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex items-center space-x-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="text-gray-500"
              onClick={handleFileAttachment}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="pr-10 border-gray-300"
              />
              <div 
                className="absolute right-2 top-2.5 text-red-500" 
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              >
                <Smile className="h-5 w-5 cursor-pointer" />
              </div>
              {isEmojiPickerOpen && (
                <div className="absolute bottom-full right-0 mb-2 z-10">
                  <Card className="p-2">
                    <div className="grid grid-cols-8 gap-1">
                      {["😊", "😃", "😂", "❤️", "👍", "🔥", "🎉", "✨", 
                        "🤔", "😍", "🙌", "👏", "🤝", "👋", "🙏", "💯",
                        "⭐", "💪", "🤞", "👌", "🎂", "🎁", "📷", "😎"].map(emoji => (
                        <div 
                          key={emoji} 
                          className="text-2xl cursor-pointer hover:bg-gray-100 p-1 rounded"
                          onClick={() => handleAddEmoji(emoji)}
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className={`text-gray-500 ${isRecording ? "text-red-500 animate-pulse" : ""}`}
              onClick={isRecording ? handleStopRecording : handleStartRecording}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button 
              type="submit" 
              size="icon"
              className="rounded-full bg-red-500 hover:bg-red-600 text-white"
              disabled={!selectedContact || !messageContent.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Select a contact to start messaging</p>
        </div>
      )}
      
      {selectedContact && showSideProfile && (
        <div className="w-[280px] border-l bg-white hidden lg:block">
          <div className="flex flex-col items-center p-6 border-b">
            <Button 
              variant="ghost" 
              size="icon" 
              className="self-end mb-2"
              onClick={() => setShowSideProfile(false)}
            >
              <X className="h-5 w-5 text-gray-500" />
            </Button>
            <div className="relative mb-4">
              <Avatar className="h-24 w-24">
                <img 
                  src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7" 
                  alt={selectedContact.full_name} 
                  className="object-cover"
                />
                <AvatarFallback>
                  {selectedContact.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
            <h2 className="text-xl font-bold">{selectedContact.full_name}</h2>
            <p className="text-gray-500 text-sm">Paris, France</p>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Help people to build websites and apps + grow awareness in social media 🚀
              </p>
            </div>
            
            <div className="flex space-x-3 mt-4">
              <Button variant="outline" size="icon" className="rounded-full bg-blue-100 border-none text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full bg-blue-100 border-none text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full bg-pink-100 border-none text-pink-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058 1.689.073 4.948.073 3.259 0 3.668-.014 4.948-.072 4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </Button>
            </div>
          </div>
          
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-500">Phone:</p>
              <p className="text-sm">+(33) 4 55 01 10</p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-500">E-mail:</p>
              <p className="text-sm">info@uxdesigner.im</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-500">DOB:</p>
              <p className="text-sm">14.05.1992</p>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-medium text-gray-500">Media (31)</p>
              <Button variant="link" size="sm" className="text-red-500 p-0">
                See all
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square rounded overflow-hidden">
                <img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" alt="Media" className="object-cover w-full h-full" />
              </div>
              <div className="aspect-square rounded overflow-hidden">
                <img src="https://images.unsplash.com/photo-1518770660439-4636190af475" alt="Media" className="object-cover w-full h-full" />
              </div>
              <div className="aspect-square rounded overflow-hidden">
                <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6" alt="Media" className="object-cover w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
