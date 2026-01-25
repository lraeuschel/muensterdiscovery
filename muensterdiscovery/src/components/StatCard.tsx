import React from 'react';
import { HStack, Flex, Box, VStack, Text } from "@chakra-ui/react"; 

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    suffix?: string;
}

export const StatCard = ({ icon, label, value, suffix }: StatCardProps) => {
    return (
        <HStack
            bg="white"
            p={5}
            borderRadius="2xl"
            boxShadow="md"
            border="1px solid"
            borderColor="orange.200"
            align="center"
            gap={4}
            transition="all 0.2s"
            _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
                borderColor: "orange.300"
            }}
        >
            <Flex
                align="center"
                justify="center"
                boxSize="12"
                bg="orange.100"
                color="orange.600"
                borderRadius="full"
                flexShrink={0}
            >
                <Box as={icon} boxSize="24px" />
            </Flex>
            <VStack align="flex-start" gap={0}>
                <Text fontSize="2xl" fontWeight="800" color="gray.700" lineHeight="1">
                    {value}
                    {suffix && (
                        <Text as="span" fontSize="lg" color="gray.500" fontWeight="600" ml={1}>
                            {suffix}
                        </Text>
                    )}
                </Text>
                <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    {label}
                </Text>
            </VStack>
        </HStack>
    );
};