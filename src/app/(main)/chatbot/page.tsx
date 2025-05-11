"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Loader2, CornerDownLeft, Mic, MicOff, AlertTriangle } from "lucide-react";
import { getChatbotResponse, type ChatbotResponseInput, type ChatbotResponseOutput } from "@/ai/flows/chatbot-response-flow";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface Message {
  id: string;
  text: string; 
  sender: "user" | "bot";
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);


  // Unified function to handle submitting a user message and getting a bot response
  const handleUserSubmit = async (textInput: string) => {
    const messageText = textInput.trim();
    if (!messageText) {
      // If called from voice with no actual speech, ensure loading state is false
      if (isListening) setIsLoading(false);
      return;
    }

    const userMessageId = Date.now().toString();
    
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: userMessageId, text: messageText, sender: "user" },
    ]);
    setInput(""); 
    setIsLoading(true);

    const chatHistoryForFlow = messages 
      .filter(msg => msg.id !== "initial-bot") 
      .map(msg => ({ sender: msg.sender, text: msg.text }));

    try {
      const chatbotInput: ChatbotResponseInput = {
        englishQuery: messageText, 
        originalQuery: messageText, 
        isTranslated: false,
        chatHistory: chatHistoryForFlow.slice(-10), 
      };
      const chatbotOutput: ChatbotResponseOutput = await getChatbotResponse(chatbotInput);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: chatbotOutput.botResponse,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      const errorMessageText = "Sorry, I encountered an error processing your request. Please try again.";
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessageText,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setSpeechRecognitionSupported(true);
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false; 
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = navigator.language || 'en-US';

      recognitionInstance.onresult = async (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        const finalTranscript = transcript.trim();
        // No need to check finalTranscript here, handleUserSubmit will do it
        // This ensures isLoading is handled correctly if no speech detected
        await handleUserSubmit(finalTranscript);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        let errorMessage = "An unknown error occurred during speech recognition.";
        if (event.error === 'no-speech') {
            errorMessage = "No speech was detected. Please try again.";
        } else if (event.error === 'audio-capture') {
            errorMessage = "Microphone problem. Please ensure it's working.";
        } else if (event.error === 'not-allowed') {
            errorMessage = "Permission to use microphone was denied. Please enable it in your browser settings.";
        } else if (event.error === 'network') {
            errorMessage = "Network error during speech recognition. Please check your connection.";
        }
        toast({
          title: "Voice Input Error",
          description: errorMessage,
          variant: "destructive",
        });
        // Ensure loading is false if an error occurs during listening phase.
        // onend will also set isListening to false.
        if(isListening) setIsLoading(false); 
      };

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setIsLoading(true); // Show "Listening..." indicator
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        // setIsLoading(false) will be handled by handleUserSubmit's finally block
        // or by onerror if it occurs. If onresult is empty, handleUserSubmit clears loading.
      };
      
      recognitionRef.current = recognitionInstance;
    } else {
      setSpeechRecognitionSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [toast]); // Removed isListening, messages from deps. handleUserSubmit handles state via closure.


  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    setMessages([
      { id: "initial-bot", text: "Hey there! I'm SmartCycle Bot, your friendly guide to all things recycling and SmartCycle. Feel free to ask me anything! Saya faham Bahasa Malaysia, 您好, வணக்கம், dan dialek tempatan juga!", sender: "bot" }
    ]);
  }, []);

  const handleFormSubmitEvent = async (e: FormEvent) => {
    e.preventDefault();
    await handleUserSubmit(input); 
  };

  const toggleListening = () => {
    if (!speechRecognitionSupported) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser does not support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop(); 
      } else {
        try {
          setInput(""); 
          recognitionRef.current.start();
        } catch (error) {
            console.error("Error starting recognition:", error);
             toast({
                title: "Voice Input Error",
                description: "Could not start voice recording. Please try again or check microphone permissions.",
                variant: "destructive",
            });
            setIsListening(false); 
            setIsLoading(false); // Reset loading if start fails
        }
      }
    }
  };


  return (
    <div className="container mx-auto py-8 px-4 flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Chatbot Assistant</h1>
        <p className="text-muted-foreground">Your friendly recycling companion. Ask me anything! Supports English, Malay, Chinese, Tamil & local dialects.</p>
      </div>
      {!speechRecognitionSupported && (
        <Alert variant="default" className="mb-4 bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300">
          <AlertTriangle className="h-5 w-5 !text-yellow-600 dark:!text-yellow-400" />
          <AlertTitle>Voice Input Not Available</AlertTitle>
          <AlertDescription>
            Your browser does not support the Web Speech API, so voice input is disabled. You can still type your messages.
          </AlertDescription>
        </Alert>
      )}

      <Card className="flex-grow flex flex-col shadow-lg">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <Bot className="mr-2 h-6 w-6 text-primary" />
                SmartCycle Bot
              </CardTitle>
              <CardDescription>Here to help with your recycling questions and SmartCycle info.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-end space-x-2",
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.sender === "bot" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg px-4 py-2.5 shadow", 
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  {msg.sender === "user" && (
                     <Avatar className="h-8 w-8">
                      <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && ( 
                <div className="flex items-end space-x-2 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-3 shadow flex items-center">
                    {isListening ? <Mic className="h-4 w-4 text-accent animate-pulse mr-2" /> : <Loader2 className="h-4 w-4 animate-spin mr-2" /> }
                    <span className="text-sm">
                      {isListening ? "Listening..." : "Thinking..."}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <form onSubmit={handleFormSubmitEvent} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder={isListening ? "Speak now..." : "Ask me anything about recycling..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              disabled={isLoading || isListening} // Disable input field if loading or listening
            />
             <Button 
                type="button" 
                variant="outline"
                size="icon"
                onClick={toggleListening} 
                disabled={!speechRecognitionSupported || (isLoading && !isListening) } // Allow stopping if listening, even if loading previous
                aria-label={isListening ? "Stop listening" : "Start voice input"}
                className={cn(isListening && "ring-2 ring-accent text-accent border-accent")}
             >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button type="submit" disabled={isLoading || !input.trim() || isListening} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading && !isListening ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
        <div className="p-2 text-center text-xs text-muted-foreground">
            Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <CornerDownLeft className="h-3 w-3"/>Enter
            </kbd> to send
        </div>
      </Card>
    </div>
  );
}
