import { useState } from "react";
import { Box, IconButton, Portal, Input, VStack, HStack, Text, Image } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { BsChatDots, BsX, BsSend } from "react-icons/bs";
import rideyHappy from "../assets/ridey_happy.png";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = () => {
    if (message.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: "user",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setMessage("");
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
      {/* Floating Chat Button */}
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

      {/* Chat Window */}
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
                        {/* Header with Close Button */}
            <HStack
              p={4}
              borderBottom="1px solid"
              borderColor="gray.200"
              justify="space-between"
            >
              <HStack gap={2}>
                <Image 
                  src={rideyHappy} 
                  alt="Ridey" 
                  boxSize="32px"
                  borderRadius="full"
                />
                <Box fontWeight="bold">Chat with Ridey</Box>
              </HStack>
              <IconButton
                aria-label="Close chat"
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                <Icon as={BsX} boxSize={6} />
              </IconButton>
            </HStack>

            {/* Chat Content Area */}
            <Box flex="1" overflowY="auto" p={4}>
              <VStack gap={3} align="stretch">
                {messages.map((msg) => (
                  <Box
                    key={msg.id}
                    alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"}
                    maxWidth="75%"
                  >
                    <Box
                      bg={msg.sender === "user" ? "gray.100" : "blue.500"}
                      color={msg.sender === "user" ? "gray.800" : "white"}
                      px={4}
                      py={2}
                      borderRadius="lg"
                      boxShadow={msg.sender === "bot" ? "md" : "sm"}
                    >
                      <Text fontSize="sm">{msg.text}</Text>
                    </Box>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Input Area */}
            <HStack p={4} borderTop="1px solid" borderColor="gray.200" gap={2}>
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                flex="1"
              />
              <IconButton
                aria-label="Send message"
                colorScheme="blue"
                onClick={handleSend}
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
