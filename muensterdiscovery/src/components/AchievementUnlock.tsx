import {
  Dialog, // WICHTIG: Das ist der neue Import in v3
  VStack,
  Text,
  Button,
  Image,
  Box,
  Heading,
} from '@chakra-ui/react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useIntl } from "react-intl";

// Falls du kein Platzhalterbild hast, nimm einen leeren String oder importiere es
// import achievement_placeholder from '../assets/achievement_trophy.png';
const achievement_placeholder = "https://cdn-icons-png.flaticon.com/512/5987/5987424.png"; // Beispielbild

interface AchievementUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    achievement: string;
    description: string;
    image_url?: string;
  } | null;
}

export default function AchievementUnlockModal({ isOpen, onClose, achievement }: AchievementUnlockModalProps) {
  const { width, height } = useWindowSize();
  const intl = useIntl();

  if (!achievement) return null;

  return (
    // "open" statt "isOpen" und "onOpenChange" statt "onClose"
    <Dialog.Root 
        open={isOpen} 
        onOpenChange={(e) => !e.open && onClose()} 
        size="lg"
        motionPreset="scale" // Sorgt für den "Plopp"-Effekt
    >
      {/* Der abgedunkelte Hintergrund */}
      <Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(5px)" />

      {/* Konfetti separat rendern (nur wenn offen) */}
      {isOpen && (
        <Box position="fixed" top={0} left={0} zIndex={1500} pointerEvents="none">
             <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
        </Box>
      )}

      {/* Der Positioner zentriert das Modal in v3 */}
      <Dialog.Positioner>
        <Dialog.Content 
            bg="transparent" 
            boxShadow="none" 
            p={0}
        >
          <Dialog.Body p={0}>
                <VStack 
                    bg="white" 
                    p={8} 
                    borderRadius="3xl" 
                    boxShadow="2xl" 
                    border="4px solid" 
                    borderColor="orange.400"
                    gap={6} // "gap" statt "spacing" ist in v3 Standard
                    position="relative"
                    overflow="hidden"
                >
                    {/* Leuchtender Hintergrund-Effekt */}
                    <Box 
                        position="absolute" 
                        top="-50%" 
                        left="-50%" 
                        w="200%" 
                        h="200%" 
                        bgGradient="radial(orange.200, transparent)" 
                        opacity={0.5} 
                        zIndex={0}
                    />

                    {/* Icon / Bild */}
                    <Box zIndex={1} animation="float 3s ease-in-out infinite">
                        <Image 
                            src={achievement.image_url || achievement_placeholder} 
                            boxSize="120px" 
                            objectFit="contain"
                            filter="drop-shadow(0px 10px 10px rgba(0,0,0,0.2))"
                        />
                    </Box>

                    <VStack zIndex={1} gap={2}>
                        <Text 
                            color="orange.500" 
                            fontWeight="bold" 
                            textTransform="uppercase" 
                            letterSpacing="wider"
                            fontSize="sm"
                        >
                            {intl.formatMessage({ id: "achievement.unlocked" })}
                        </Text>
                        
                        <Heading size="lg" color="gray.800">
                            {achievement.achievement}
                        </Heading>
                        
                        <Text color="gray.600" fontSize="lg" maxW="300px">
                            {achievement.description}
                        </Text>
                    </VStack>

                    <Button 
                        colorScheme="orange" // Falls v3 meckert: colorPalette="orange"
                        size="lg" 
                        w="full" 
                        borderRadius="xl" 
                        onClick={onClose}
                        zIndex={1}
                        boxShadow="lg"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                    >
                        {intl.formatMessage({ id: "achievement.button" })} 
                    </Button>
                </VStack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};