import { useState } from "react";
import { Box, VStack, HStack, Text, Image, Button, Grid, Badge } from "@chakra-ui/react";
import { useIntl } from 'react-intl';
import Header from "../components/Header";
import muensterdiscovery_logo from "../assets/logo.png";
import profile_image from "../assets/Fxrg3QHWAAcQ7pw.jpg";
import majo from "../assets/ww.jpeg";

// Typdefinition für User-Eintrag
type LeaderboardEntry = {
    rank: number;
    username: string;
    points: number;
    distanceKm: number;
    areasDiscovered: number;
    isCurrentUser?: boolean;
    isMajo?: boolean;
};

export default function Leaderboard() {
    const intl = useIntl();
    const [timeframe, setTimeframe] = useState<'month' | 'alltime'>('month');

    // Dieser Monat 
    const monthlyData: LeaderboardEntry[] = [
        { rank: 1, username: "LeezenRider", points: 450, distanceKm: 42.5, areasDiscovered: 12 },
        { rank: 2, username: "AaseeWalker", points: 380, distanceKm: 28.0, areasDiscovered: 9 },
        { rank: 3, username: "BavariaOne", points: 320, distanceKm: 21.5, areasDiscovered: 8, isCurrentUser: true }, 
        { rank: 4, username: "DomPlatzKing", points: 290, distanceKm: 15.0, areasDiscovered: 6 },
        { rank: 5, username: "MünsterMaus", points: 150, distanceKm: 10.2, areasDiscovered: 3},
    ];

    // All-time daten
    const allTimeData: LeaderboardEntry[] = [
        { rank: 1, username: "MünsterLegend", points: 15400, distanceKm: 1205.5, areasDiscovered: 150 },
        { rank: 2, username: "LeezenRider", points: 12300, distanceKm: 980.0, areasDiscovered: 120 },
        { rank: 3, username: "CityExplorer", points: 9800, distanceKm: 750.2, areasDiscovered: 95 },
        { rank: 4, username: "BavariaOne", points: 4500, distanceKm: 340.5, areasDiscovered: 45, isCurrentUser: true },
        { rank: 5, username: "WestfalenWanderer", points: 4100, distanceKm: 310.0, areasDiscovered: 40, isMajo: true },
    ];

    const currentData = timeframe === 'month' ? monthlyData : allTimeData;

    return (
        <Box bg="orange.50" minH="100vh" pb={8}>
            <Header />

            {/* Content Container */}
            <VStack gap={6} mt="80px" px={4}>
                
                {/* Überschrift */}
                <VStack>
                    <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                        {intl.formatMessage({ id: "leaderboard.title", defaultMessage: "Rangliste" })} 🏆
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                        {intl.formatMessage({ id: "leaderboard.subtitle", defaultMessage: "Wer hat Münster am besten erkundet?" })}
                    </Text>
                </VStack>

                {/* Globale Community Stats */}
                <Grid 
                    templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} 
                    gap={4} 
                    width="100%" 
                    maxW="600px"
                >
                    <StatCard 
                        label={intl.formatMessage({ id: "stats.total_km", defaultMessage: "Community km" })}
                        value="12.450 km"
                        icon="🚴"
                    />
                    <StatCard 
                        label={intl.formatMessage({ id: "stats.total_spots", defaultMessage: "Entdeckte Orte" })}
                        value="8.234"
                        icon="📍"
                    />
                    <StatCard 
                        label={intl.formatMessage({ id: "stats.active_users", defaultMessage: "Aktive Entdecker" })}
                        value="452"
                        icon="👥"
                    />
                </Grid>

                {/* Switcher: Monat vs All-Time */}
                <Box bg="white" p={1} borderRadius="full" boxShadow="sm" border="1px solid" borderColor="orange.200">
                    <HStack gap={0}>
                        <Button 
                            size="sm" 
                            borderRadius="full" 
                            colorPalette="orange"
                            variant={timeframe === 'month' ? 'solid' : 'ghost'}
                            onClick={() => setTimeframe('month')}
                            px={6}
                        >
                            {intl.formatMessage({ id: "leaderboard.month", defaultMessage: "Dieser Monat" })}
                        </Button>
                        <Button 
                            size="sm" 
                            borderRadius="full" 
                            colorPalette="orange"
                            variant={timeframe === 'alltime' ? 'solid' : 'ghost'}
                            onClick={() => setTimeframe('alltime')}
                            px={6}
                        >
                            {intl.formatMessage({ id: "leaderboard.alltime", defaultMessage: "Ewige Tabelle" })}
                        </Button>
                    </HStack>
                </Box>

                {/* Die Rangliste */}
                <VStack width="100%" maxW="600px" gap={3} align="stretch">
                    {/* Header Zeile der Tabelle */}
                    <HStack px={4} py={2} color="gray.500" fontSize="xs" fontWeight="bold">
                        <Text width="10%">#</Text>
                        <Text flex={1}>{intl.formatMessage({ id: "leaderboard.user", defaultMessage: "Nutzer" })}</Text>
                        <Text width="20%" textAlign="right">km</Text>
                        <Text width="20%" textAlign="right">{intl.formatMessage({ id: "leaderboard.points", defaultMessage: "Punkte" })}</Text>
                    </HStack>

                    {currentData.map((user) => (
                        <Box
                            key={user.rank}
                            bg={user.isCurrentUser ? "orange.100" : "white"}
                            p={3}
                            borderRadius="xl"
                            shadow="sm"
                            border="2px solid"
                            borderColor={user.isCurrentUser ? "orange.400" : "transparent"}
                            transition="all 0.2s"
                            _hover={{ transform: "scale(1.01)", shadow: "md" }}
                        >
                            <HStack gap={4}>
                                {/* Rang */}
                                <Box 
                                    width="30px" 
                                    textAlign="center" 
                                    fontWeight="bold" 
                                    fontSize="lg"
                                    color={user.rank <= 3 ? "orange.500" : "gray.600"}
                                >
                                    {getRankIcon(user.rank)}
                                </Box>

                                {/* Profilbild */}
                                <Image
                                    src={user.isMajo 
                                            ? majo
                                            : user.isCurrentUser 
                                                ? profile_image 
                                                : muensterdiscovery_logo
                                            }
                                    alt={user.username}
                                    boxSize="40px"
                                    borderRadius="full"
                                    border="2px solid"
                                    borderColor={user.rank === 1 ? "gold" : "gray.200"}
                                />

                                {/* Name & Details */}
                                <VStack align="start" gap={0} flex={1}>
                                    <HStack>
                                        <Text fontWeight="bold" color="gray.800">
                                            {user.username}
                                        </Text>
                                        {user.isCurrentUser && (
                                            <Badge colorPalette="orange" size="sm">{intl.formatMessage({ id: "leaderboard.you" })}</Badge>
                                        )}
                                    </HStack>
                                    <Text fontSize="xs" color="gray.500">
                                        {user.areasDiscovered} {intl.formatMessage({ id: "leaderboard.areas", defaultMessage: "Bereiche" })}
                                    </Text>
                                </VStack>

                                {/* Distanz */}
                                <Text fontWeight="medium" fontSize="sm" color="gray.600" width="20%" textAlign="right">
                                    {user.distanceKm}
                                </Text>

                                {/* Punkte (Hervorgehoben) */}
                                <Text fontWeight="bold" fontSize="lg" color="orange.600" width="20%" textAlign="right">
                                    {user.points}
                                </Text>
                            </HStack>
                        </Box>
                    ))}
                </VStack>

            </VStack>
        </Box>
    );
}

// Hilfskomponente für die Statistik-Karten oben
function StatCard({ label, value, icon }: { label: string, value: string, icon: string }) {
    return (
        <Box 
            bg="white" 
            p={4} 
            borderRadius="lg" 
            shadow="sm" 
            borderBottom="4px solid" 
            borderColor="orange.300"
            textAlign="center"
        >
            <Text fontSize="2xl" mb={1}>{icon}</Text>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
                {value}
            </Text>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                {label}
            </Text>
        </Box>
    );
}

// Hilfsfunktion für Rang-Icons (1-3 bekommen Medaillen)
function getRankIcon(rank: number) {
    switch(rank) {
        case 1: return "🥇";
        case 2: return "🥈";
        case 3: return "🥉";
        default: return rank + ".";
    }
}