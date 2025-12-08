import { useState, useEffect, useRef } from "react";
import { Box, IconButton, Portal, Input, VStack, HStack, Text, Image } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { BsChatDots, BsX, BsSend } from "react-icons/bs";
import { keyframes } from "@emotion/react";
import rideyHappy from "../assets/ridey_happy.png";

interface FloatingChatWidgetProps {
  currentLanguage: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  html?: string;
}

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
`;

const TypingIndicator = () => (
  <HStack gap={1} p={2}>
    {[0, 1, 2].map((dot) => (
      <Box
        key={dot}
        w="6px"
        h="6px"
        bg="gray.500"
        borderRadius="full"
        animation={`${bounce} 1.4s infinite ease-in-out both`}
        style={{ animationDelay: `${dot * 0.16}s` }}
      />
    ))}
  </HStack>
);

const sanitizeHtml = (input: string) => {
  if (!input) return "";
  let s = input.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "");
  s = s.replace(/\son\w+\s*=\s*(["'`])[\s\S]*?\1/gi, "");
  return s;
};

export default function FloatingChatWidget({ currentLanguage }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const handleSend = async () => {
    if (message.trim()) {
      const currentMessage = message;
      
      const historyPayload = messages.map(
        (msg) => `${msg.sender}: ${msg.text}`
      );

      const userMessage: Message = {
        id: Date.now().toString(),
        text: currentMessage,
        sender: "user",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setMessage("");
      setIsLoading(true);

      try {
        const response = await fetch("https://midi11-chatwithridey.hf.space/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            message: currentMessage,
            history: historyPayload,
            language: currentLanguage
          }),
        });

        if (!response.ok) throw new Error("Server-Fehler");

        const data = await response.json();

        const rawHtml = data?.html ?? data?.html_output ?? "";

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: "bot",
          timestamp: new Date(),
          html: rawHtml ? sanitizeHtml(rawHtml) : undefined,
        };
        
        setMessages((prev) => [...prev, botMessage]);

      } catch (error) {
        console.error("Fehler:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Ridey ist gerade nicht erreichbar.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <IconButton
        aria-label="Open chat"
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex={9999}
        borderRadius="full"
        size="lg"
        colorScheme="blue"
        onClick={() => setIsOpen(!isOpen)}
        boxShadow="lg"
      >
        <Icon as={BsChatDots} boxSize={6} />
      </IconButton>

      {isOpen && (
        <Portal>
          <Box
            position="fixed"
            bottom="100px"
            right="20px"
            width="70vw"
            maxWidth="500px"
            height="70vh"
            maxHeight="600px"
            bg="white"
            borderRadius="lg"
            boxShadow="2xl"
            zIndex={9998}
            display="flex"
            flexDirection="column"
            border="1px solid"
            borderColor="gray.200"
          >
            <HStack p={4} borderBottom="1px solid" borderColor="gray.200" justify="space-between">
              <HStack gap={2}>
                <Image src={rideyHappy} alt="Ridey" boxSize="32px" borderRadius="full"/>
                <Box fontWeight="bold">Chat with Ridey</Box>
              </HStack>
              <IconButton aria-label="Close" size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
                <Icon as={BsX} boxSize={6} />
              </IconButton>
            </HStack>

            <Box flex="1" overflowY="auto" p={4}>
              <VStack gap={3} align="stretch">
                {messages.map((msg) => (
                  <Box key={msg.id} alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"} maxWidth="75%">
                    <Box
                      bg={msg.sender === "user" ? "gray.100" : "blue.500"}
                      color={msg.sender === "user" ? "gray.800" : "white"}
                      px={4} py={2} borderRadius="lg"
                      boxShadow={msg.sender === "bot" ? "md" : "sm"}
                    >
                      <Text fontSize="sm">{msg.text}</Text>
                      {/* Render optional sanitized HTML if provided by the agent */}
                      {msg.html && (
                        <Box mt={2} color={msg.sender === "bot" ? "white" : "black"}>
                          <div dangerouslySetInnerHTML={{ __html: msg.html }} />
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}

                {isLoading && (
                  <Box alignSelf="flex-start" maxWidth="75%">
                    <Box bg="gray.100" px={4} py={2} borderRadius="lg">
                      <TypingIndicator />
                    </Box>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </VStack>
            </Box>

            <HStack p={4} borderTop="1px solid" borderColor="gray.200" gap={2}>
              <Input
                placeholder={currentLanguage === "de" ? "Nachricht tippen..." : "Type a message..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                flex="1"
                disabled={isLoading}
              />
              <IconButton 
                aria-label="Send" 
                colorScheme="blue" 
                onClick={handleSend}
                loading={isLoading}
              >
                <Icon as={BsSend} />
              </IconButton>
            </HStack>
          </Box>
        </Portal>
      )}
    </>
  );
}
