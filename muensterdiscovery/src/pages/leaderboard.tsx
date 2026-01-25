import { useState, useEffect } from "react";
import { Box, VStack, HStack, Text, Image, Button, Grid, Badge } from "@chakra-ui/react";
import { useIntl } from 'react-intl';
import CompLangHeader from "../components/CompLangHeader";
import { currentLanguage, onCurrentLanguageChange } from "../components/languageSelector";
import type { LanguageType } from "../components/languageSelector";
import { getAllDiscoveredPOIs, getNumberOfUser, getWalkedKilometers, getCurrentUser, getLeaderboard } from "../services/DatabaseConnection";
import type { LeaderboardEntry } from "../types";
import default_profile_image from "../assets/Fxrg3QHWAAcQ7pw.jpg";

export default function Leaderboard() {
    const intl = useIntl();
    const [timeframe, setTimeframe] = useState<'month' | 'alltime'>('month');
    const [currentLang, setCurrentLang] = useState<LanguageType>(currentLanguage);
    const [numberOfUsers, setNumberOfUsers] = useState<number>(0);
    const [totalDiscoveredPOIs, setTotalDiscoveredPOIs] = useState<number>(0);
    const [totalWalkedKm, setTotalWalkedKm] = useState<number>(0);
    const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [alltimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                
                // Statistiken laden
                const [userCount, poisCount, kmData, currentUser] = await Promise.all([
                    getNumberOfUser(),
                    getAllDiscoveredPOIs(),
                    getWalkedKilometers(),
                    getCurrentUser()
                ]);

                setNumberOfUsers(userCount);
                setTotalDiscoveredPOIs(poisCount);
                
                const totalKm = kmData.reduce((sum, row) => {
                    return sum + (row.routes?.[0]?.distance || 0);
                }, 0);
                setTotalWalkedKm(totalKm);
                
                // Leaderboards laden
                const [monthly, allTime] = await Promise.all([
                    getLeaderboard('month', currentUser?.id),
                    getLeaderboard('alltime', currentUser?.id)
                ]);

                setMonthlyLeaderboard(monthly);
                setAllTimeLeaderboard(allTime);

            } catch (error) {
                console.error("Error loading leaderboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    <Box data-lang={currentLang}></Box>

    useEffect(() => {
        const unsubscribe = onCurrentLanguageChange((lang) => {
            setCurrentLang(lang);
        });
        return unsubscribe;
    }, []);

    const currentData = timeframe === 'month' ? monthlyLeaderboard : alltimeLeaderboard;
    const top5 = currentData.slice(0, 5);
    const currentUserEntry = currentData.find(entry => entry.isCurrentUser);

    // zeige user separat an, wenn er nicht in top 5 ist
    const showUserSeparately = currentUserEntry && currentUserEntry.rank > 5;

    return (
    <Box bg="orange.50" minH="100vh" pb={8}>
        <CompLangHeader />

        <VStack gap={6} mt="80px" px={4}>
            
            <VStack>
                <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                    {intl.formatMessage({ id: "leaderboard.title", defaultMessage: "Rangliste" })}
                </Text>
                <Text fontSize="sm" color="gray.600">
                    {intl.formatMessage({ id: "leaderboard.subtitle", defaultMessage: "Wer hat Münster am besten erkundet?" })}
                </Text>
            </VStack>

            <Grid 
                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} 
                gap={4} 
                width="100%" 
                maxW="600px"
            >
                <StatCard 
                    label={intl.formatMessage({ id: "stats.total_km", defaultMessage: "Community km" })}
                    value={isLoading ? "…" : String((totalWalkedKm / 1000).toFixed(1))}
                    icon="🚴"
                />
                <StatCard 
                    label={intl.formatMessage({ id: "stats.total_spots", defaultMessage: "Entdeckte Orte" })}
                    value={isLoading ? "…" : String(totalDiscoveredPOIs)}
                    icon="📍"
                />
                <StatCard 
                    label={intl.formatMessage({ id: "stats.active_users", defaultMessage: "Aktive Entdecker" })}
                    value={isLoading ? "…" : String(numberOfUsers)}
                    icon="👥"
                />
            </Grid>

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

            {/* Rangliste Container */}
            <VStack width="100%" maxW="600px" gap={3} align="stretch">
                
                {/* Header Zeile */}
                <HStack px={4} py={2} color="gray.500" fontSize="xs" fontWeight="bold">
                    <Text width="10%"></Text>
                    <Text flex={1}>{intl.formatMessage({ id: "leaderboard.user", defaultMessage: "Nutzer" })}</Text>
                    <Text width="20%" textAlign="right">{intl.formatMessage({ id: "leaderboard.km", defaultMessage: "Routing km" })}</Text>
                    <Text width="20%" textAlign="right">{intl.formatMessage({ id: "leaderboard.points", defaultMessage: "Punkte" })}</Text>
                </HStack>

                {isLoading ? (
                    <Text textAlign="center" color="gray.500" py={8}>
                        {intl.formatMessage({ id: "leaderboard.loading", defaultMessage: "Lade Daten" })}
                    </Text>
                ) : currentData.length === 0 ? (
                    <Text textAlign="center" color="gray.500" py={8}>
                        {intl.formatMessage({ id: "leaderboard.no_data", defaultMessage: "Noch keine Daten verfügbar" })}
                    </Text>
                ) : (
                    <>
                        {/* 1. Die Top 5 rendern */}
                        {top5.map((entry, index) => (
                            <LeaderboardRow key={`${entry.username}-${index}`} entry={entry} />
                        ))}

                        {/* 2. Trennzeichen anzeigen, falls User schlechter als Platz 5 */}
                        {showUserSeparately && currentUserEntry.rank > 5 && (
                            <Box py={2} textAlign="center">
                                <Text fontSize="2xl" color="gray.400" lineHeight={0.5} fontWeight="bold">
                                    ...
                                </Text>
                            </Box>
                        )}

                        {/* 3. Den User rendern, falls er nicht oben dabei war */}
                        {showUserSeparately && currentUserEntry.rank > 5 && (
                            <LeaderboardRow key={`${currentUserEntry.username}-current`} entry={currentUserEntry} />
                        )}
                    </>
                )}
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


// Hilfskomponente für eine Zeile in der Rangliste
const LeaderboardRow = ({ entry }: { entry: LeaderboardEntry }) => {

    const intl = useIntl(); 
    return (
        <Box
            bg={entry.isCurrentUser ? "orange.100" : "white"}
            p={3}
            borderRadius="xl"
            shadow="sm"
            border="2px solid"
            borderColor={entry.isCurrentUser ? "orange.400" : "transparent"}
            transition="all 0.2s"
            _hover={{ transform: "scale(1.01)", shadow: "md" }}
        >
            <HStack gap={4}>
                <Box
                    width="30px"
                    textAlign="center"
                    fontWeight="bold"
                    fontSize="lg"
                    color={entry.rank <= 3 ? "orange.500" : "gray.600"}
                >
                    {getRankIcon(entry.rank)}
                </Box>

                <Image
                    src={entry.profileImageUrl}
                    alt={entry.username}
                    boxSize="40px"
                    borderRadius="full"
                    border="2px solid"
                    borderColor={entry.rank === 1 ? "gold" : "gray.200"}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = default_profile_image; }}
                />

                <VStack align="start" gap={0} flex={1}>
                    <HStack>
                        <Text fontWeight="bold" color="gray.800">
                            {entry.username}
                        </Text>
                        {entry.isCurrentUser && (
                            <Badge colorPalette="orange" size="sm">
                                {intl.formatMessage({ id: "leaderboard.you", defaultMessage: "Du" })}
                            </Badge>
                        )}
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                        {entry.areasDiscovered} {intl.formatMessage({ id: entry.areasDiscovered === 1 ? "leaderboard.areas_one" : "leaderboard.areas", defaultMessage: entry.areasDiscovered === 1 ? "Bereich" : "Bereiche" })}
                    </Text>
                </VStack>

                <Text fontWeight="medium" fontSize="sm" color="gray.600" width="20%" textAlign="right">
                    {entry.distanceKm.toFixed(1)}
                </Text>

                <Text fontWeight="bold" fontSize="lg" color="orange.600" width="20%" textAlign="right">
                    {entry.points}
                </Text>
            </HStack>
        </Box>
    );
};