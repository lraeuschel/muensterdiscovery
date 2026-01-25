import { useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Link,
} from "@chakra-ui/react";
import CompLangHeader from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";
import { useIntl } from "react-intl";
import wthrdLogo from "../assets/wthrdlogo.svg";
import { Image } from "@chakra-ui/react";



export default function Imprint() {
  const intl = useIntl();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setCurrentLang] = useState<LanguageType>(currentLanguage);

  useEffect(() => {
    const unsubscribe = onCurrentLanguageChange((lang) => {
      setCurrentLang(lang);
    });
    return unsubscribe;
  }, []);

  const cardStyle = {
    bg: { base: "white", _dark: "gray.800" },
    p: 6,
    borderRadius: "2xl",
    shadow: "lg",
    border: "1px solid",
    borderColor: { base: "gray.100", _dark: "gray.700" },
  } as const;

  return (
    <Box minH="100vh" bg={{ base: "gray.50", _dark: "gray.900" }} position="relative" pb={10}>
      {/* HEADER (wie Start.tsx) */}
      <Box pt={8} pb={2} px={4} position="relative">

        <Box position="absolute" top={8} right={4} zIndex={10}>
          <CompLangHeader />
        </Box>
      </Box>

      {/* CONTENT */}
      <Box px={{ base: 4, md: 8 }} mt={10} py={8} maxW="container.lg" mx="auto">
        <VStack gap={8} align="stretch">
          <Box {...cardStyle}>
            <Heading as="h1" size="lg" color={{ base: "gray.800", _dark: "white" }} mb={2}>
              {intl.formatMessage({ id: "imprint.title" })}
            </Heading>
            <Text  color={{ base: "gray.600", _dark: "gray.300" }}>
              {intl.formatMessage({ id: "imprint.legal_note" })}
            </Text>


            <VStack mt="10" align="start" gap={1} color={{ base: "gray.700", _dark: "gray.300" }}>
              <Text fontWeight="bold">Münster Discovery</Text>
              <Text>Institut für Geoinformatik (IfGi)</Text>
              <Text>Heisenbergstraße 2</Text>
              <Text>48149 Münster</Text>
              <Text>Deutschland</Text>
            </VStack>
          </Box>

          <Box  {...cardStyle}>
            <Heading as="h2" size="md" color={{ base: "gray.800", _dark: "white" }} mb={4}>
              {intl.formatMessage({ id: "imprint.contact_label" })}
            </Heading>

            <Text color={{ base: "gray.700", _dark: "gray.300" }}>
              E-Mail: (Customer Experience){" "}
              <Link href="mailto:mweicker@uni-muenster.de" color="orange.500">
                mweicker@uni-muenster.de
              </Link>
            </Text>

            <Heading as="h2" size="md" mt="10"color={{ base: "gray.800", _dark: "white" }} mb={4}>
            {intl.formatMessage({ id: "imprint.represented_by" })}
            </Heading>

            <Image
            src={wthrdLogo}
                alt={intl.formatMessage({ id: "imprint.wthrd_logo_alt" })}
                h="90px"
                maxW="390px"
                objectFit="fit"
                mt={1}
                mb={4}
            />
          </Box>

          <Box {...cardStyle}>
            <Heading
              as="h2"
              size="sm"
              textTransform="uppercase"
              color={{ base: "gray.500", _dark: "gray.400" }}
              mb={2}
            >
              {intl.formatMessage({ id: "imprint.disclaimer_title" })}
            </Heading>
            <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }} textAlign="justify">
              {intl.formatMessage({ id: "imprint.disclaimer_text" })}
            </Text>

            <Heading
              as="h2"
              mt = "10"
              size="sm"
              textTransform="uppercase"
              color={{ base: "gray.500", _dark: "gray.400" }}
              mb={2}
            >
              {intl.formatMessage({ id: "imprint.copyright_title" })}
            </Heading>
            <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }} textAlign="justify">
              {intl.formatMessage({ id: "imprint.copyright_text" })}
            </Text>
          </Box>
        </VStack>
      </Box>

{/* Footer */}
            <VStack gap={6} px={4} py={8} align="center" w="100%" bg="white" mt={8}>
                <VStack gap={4} align="center" maxW="1000px">
                    {/* Footer Links */}
                    <HStack gap={6} justify="center" wrap="wrap" fontSize="sm">
                        <Link
                            href="/muensterdiscovery/imprint"
                            color="orange.600"
                            fontWeight="500"
                            _hover={{ textDecoration: "underline" }}
                        >
                            {intl.formatMessage({ id: "welcome.imprint" })}
                        </Link>
                        <Text color="gray.400">•</Text>
                        <Link
                            href="/muensterdiscovery/help"
                            color="orange.600"
                            fontWeight="500"
                            _hover={{ textDecoration: "underline" }}
                        >
                            {intl.formatMessage({ id: "menu.help" })}
                        </Link>
                        <Text color="gray.400">•</Text>
                        <Link
                            href="https://github.com/lraeuschel/muensterdiscovery"
                            target="_blank"
                            color="orange.600"
                            fontWeight="500"
                            _hover={{ textDecoration: "underline" }}
                        >
                            GitHub
                        </Link>
                        <Text color="gray.400">•</Text>
                        <Link
                            href="https://huggingface.co/spaces/MIDI11/chatwithridey"
                            target="_blank"
                            color="orange.600"
                            fontWeight="500"
                            _hover={{ textDecoration: "underline" }}
                        >
                            HuggingFace (ChatWithRidey)
                        </Link>
                    </HStack>

                    {/* Copyright */}
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                        © 2026 MünsterDiscovery. {intl.formatMessage({ id: "footer.all_rights_reserved" })}
                    </Text>
                </VStack>
            </VStack>
    </Box>
  );
}
