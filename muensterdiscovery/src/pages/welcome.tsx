import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Button, VStack, HStack, Select, Text, Image } from "@chakra-ui/react";
import muensterdiscovery_logo from "../assets/muensterdiscovery_logo.jpg";

export default function Welcome() {
    const navigate = useNavigate();

    return (
        <Box bg="orange.50" minH="100vh">
            <VStack>
                    <Text
                        fontSize={{ base: "2xl", md: "4xl" }}
                        fontWeight="bold"
                        color="orange.500"
                        letterSpacing="wide"
                        textAlign="center"
                        textTransform="uppercase"
                        mb={4}
                        mt={8}
                        >
                        Welcome to
                    </Text>
                <Image src={muensterdiscovery_logo} alt="Muenster Discovery Logo" boxSize="400px" mt={3} />
                <Button
                    colorPalette={"orange"}
                    size="lg"
                    onClick={() => navigate("/login")}
                    width={"160px"}
                >
                    Login
                </Button>
                    <Text color="gray.500" fontWeight="semibold" fontSize="sm" whiteSpace="nowrap">
                        or
                    </Text>
                <Button
                    colorPalette={"orange"}
                    size="lg"
                    onClick={() => navigate("/registration")}
                    width={"160px"}
                >
                    Create an account
                </Button>
                <Button
                    colorPalette={"transparent"}
                    size="lg"
                    onClick={() => navigate("/help")}
                    width={"160px"}
                    mt={15}
                >
                    Need help?
                </Button>
                <VStack mt={15}>
                    <Text>
                        @2025 muensterdiscovery
                    </Text>
                    <Link to="/impressum">
                        Impressum
                    </Link>
                </VStack>
            </VStack>
        </Box>
    );
}
