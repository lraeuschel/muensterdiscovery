import { useState, useEffect, useRef } from "react";
import {Box, IconButton, Portal, Input, VStack, HStack, Text, Image, Icon,} from "@chakra-ui/react";
import { BsChatDots, BsX, BsSend } from "react-icons/bs";
import { keyframes } from "@emotion/react";
import { getCurrentUser } from "../services/DatabaseConnection";
import { useNavigate } from "react-router-dom";
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
  <HStack gap={1} align="center" justify="center" h="24px">
    {[0, 1, 2].map((dot) => (
      <Box
        key={dot}
        w="6px"
        h="6px"
        bg="gray.500"
        borderRadius="full"
        animation={`${bounce} 1.4s infinite ease-in-out both`}
        css={{ animationDelay: `${dot * 0.16}s` }}
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

const HtmlMessage = ({ htmlContent }: { htmlContent: string }) => {
  const navigate = useNavigate();

  const handleHtmlClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");

    if (anchor) {
      const href = anchor.getAttribute("href");
      if (href && href.startsWith("/muensterdiscovery")) {
        e.preventDefault();
        const internalPath = href.replace("/muensterdiscovery", "") || "/";
        navigate(internalPath);
      }
    }
  };

  return (
    <div
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      onClick={handleHtmlClick}
      style={{ width: "100%" }}
    />
  );
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
      const historyPayload = messages.map((msg) => `${msg.sender}: ${msg.text}`);

      const userMessage: Message = {
        id: Date.now().toString(),
        text: currentMessage,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessage("");
      setIsLoading(true);

      const user = await getCurrentUser();

      try {
        const payload: any = {
          message: currentMessage,
          history: historyPayload,
          language: currentLanguage,
        };

        if (user) {
          payload.usertoken = user.id;
        }

        const response = await fetch("https://midi11-chatwithridey.hf.space/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Server-Error");

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
          text: "To stay within the free tier of HuggingFace, Ridey is not always active and will go into sleep mode within a few days. If so, please wait a few minutes after your first message and try again. The service should awake itself - please contact us if the issue persists.",
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
      <Portal>
        <Box position="fixed" bottom="20px" right="20px" zIndex={9999}>
          {}
          <IconButton
            aria-label="Toggle Chat"
            rounded="full"
            size="lg"
            colorPalette="orange"
            onClick={() => setIsOpen(!isOpen)}
            boxShadow="lg"
          >
            <Icon as={isOpen ? BsX : BsChatDots} boxSize={6} />
          </IconButton>
        </Box>
      </Portal>

      {isOpen && (
        <Portal>
          <Box
            position="fixed"
            bottom="80px"
            right="20px"
            width={{ base: "300px", md: "350px" }}
            height="500px"
            bg="white"
            boxShadow="2xl"
            borderRadius="xl"
            zIndex={9999}
            display="flex"
            flexDirection="column"
            overflow="hidden"
            border="1px solid"
            borderColor="gray.200"
          >
            <Box bg="blue.500" p={4} display="flex" alignItems="center">
              <Image
                src={rideyHappy}
                boxSize="40px"
                borderRadius="full"
                bg="white"
                mr={3}
                p={1}
              />
              <Text color="white" fontWeight="bold" fontSize="lg">
                Chat with Ridey
              </Text>
              
              {}
              <IconButton
                aria-label="Close"
                size="sm"
                variant="ghost"
                color="white"
                ml="auto"
                _hover={{ bg: "blue.600" }}
                onClick={() => setIsOpen(false)}
              >
                <BsX />
              </IconButton>
            </Box>

            <Box flex="1" overflowY="auto" p={4} bg="gray.50">
              {}
              <VStack gap={4} align="stretch">
                {messages.map((msg) => (
                  <Box
                    key={msg.id}
                    alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"}
                    bg={msg.sender === "user" ? "blue.500" : "white"}
                    color={msg.sender === "user" ? "white" : "black"}
                    px={4}
                    py={3}
                    borderRadius="lg"
                    maxW="85%"
                    boxShadow="sm"
                    borderBottomRightRadius={msg.sender === "user" ? "none" : "lg"}
                    borderBottomLeftRadius={msg.sender === "bot" ? "none" : "lg"}
                  >
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      {msg.text}
                    </Text>

                    {msg.html && (
                      <Box
                        mt={3}
                        p={2}
                        bg="gray.50"
                        color="black"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.200"
                      >
                        <HtmlMessage htmlContent={msg.html} />
                      </Box>
                    )}
                  </Box>
                ))}

                {isLoading && (
                  <Box
                    alignSelf="flex-start"
                    bg="white"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    borderBottomLeftRadius="none"
                    boxShadow="sm"
                  >
                    <TypingIndicator />
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </VStack>
            </Box>

            <Box p={3} bg="white" borderTop="1px solid" borderColor="gray.200">
              <HStack>
                <Input
                  placeholder={
                    currentLanguage === "de"
                      ? "Schreibe eine Nachricht..."
                      : "Type a message..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  flex="1"
                  disabled={isLoading}
                  borderRadius="full"
                  bg="gray.50"
                  _focus={{ bg: "white", borderColor: "blue.500" }}
                />
                
                {}
                <IconButton
                  aria-label="Send"
                  colorPalette="blue"
                  borderRadius="full"
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  loading={isLoading}
                >
                  <BsSend />
                </IconButton>
              </HStack>
            </Box>
          </Box>
        </Portal>
      )}
    </>
  );
}
