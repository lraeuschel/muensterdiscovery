import { useNavigate } from "react-router-dom";
import { Box, HStack, Image } from "@chakra-ui/react";
import MenuComponent from "./menu";
import muensterdiscovery_logo from "../assets/logo.png";

export default function Header() {
    const navigate = useNavigate();

    return (
        <Box 
            position="fixed" 
            top="10px" 
            left="10px" 
            zIndex={1000}
        >
            <HStack gap={3}>
                <MenuComponent />
                <Image
                    src={muensterdiscovery_logo}
                    alt="Münster Discovery Logo"
                    height="40px"
                    onClick={() => navigate("/")}
                    cursor="pointer"
                    _hover={{ opacity: 0.8 }}
                    transition="opacity 0.2s"
                />
            </HStack>
        </Box>
    );
}
