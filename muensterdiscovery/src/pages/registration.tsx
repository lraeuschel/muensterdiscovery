import { useState } from "react";
import { supabase } from "../SupabaseClient";
import { Input, Button, Text, Flex, Box, Heading } from "@chakra-ui/react";
import {
  FormControl,
  FormLabel,
} from "@chakra-ui/form-control";


export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log(data);

    if (error) setMessage(error.message);
    else setMessage("Bestätigungs-E-Mail wurde gesendet!");
  }

  return (
    <Flex justify="center" align="center" minH="100vh" bg="gray.50">
      <Box
        bg="white"
        p={8}
        rounded="md"
        shadow="md"
        width="100%"
        maxW="400px"
      >
        <Heading mb={6} textAlign="center" size="lg">
          Registrieren
        </Heading>

        <form onSubmit={handleSignup}>
          <FormControl mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Email eingeben"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormControl>

          <FormControl mb={6}>
            <FormLabel>Passwort</FormLabel>
            <Input
              type="password"
              placeholder="Passwort eingeben"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormControl>

          <Button colorScheme="blue" width="100%" type="submit">
            Signup
          </Button>

          {message && (
            <Text mt={4} textAlign="center" color="blue.600">
              {message}
            </Text>
          )}
        </form>
      </Box>
    </Flex>
  );
}
