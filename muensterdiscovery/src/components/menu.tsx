import { useNavigate } from "react-router-dom";
import {
    Menu,
    Button,
    Portal,
    Box,
    HStack,
    Text
} from "@chakra-ui/react";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { CiRoute } from "react-icons/ci";
import { MdOutlineLeaderboard } from "react-icons/md";
import { IoEarthOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { RiHome2Line } from "react-icons/ri";
import { useIntl } from "react-intl";

export default function MenuComponent() {
    const navigate = useNavigate();
    const intl = useIntl();

    const menuItems = [
        { value: "welcome", icon: RiHome2Line, path: "/" },
        { value: "profile", icon: CgProfile, path: "/profile" },
        { value: "open-world", icon: IoEarthOutline, path: "/openworld" },
        { value: "leaderboard", icon: MdOutlineLeaderboard, path: "/leaderboard" },
        { value: "routeselection", icon: CiRoute, path: "/routeselection" },
        { value: "help", icon: IoIosHelpCircleOutline, path: "/help" }
    ];

    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <Button
                    variant="ghost"
                    size="md"
                    _hover={{ bg: "orange.100" }}
                >
                    <RxHamburgerMenu size={24} />
                </Button>
            </Menu.Trigger>

            <Portal>
                <Menu.Positioner>
                    <Menu.Content
                        bg="white"
                        borderRadius="2xl"
                        boxShadow="xl"
                        border="1px solid"
                        borderColor="orange.200"
                        p={2}
                        minW="220px"
                    >
                        {menuItems.map(item => {
                            const Icon = item.icon;

                            return (
                                <Menu.Item
                                    key={item.value}
                                    value={item.value}
                                    onClick={() => navigate(item.path)}
                                    borderRadius="xl"
                                    px={3}
                                    py={2.5}
                                    _hover={{
                                        bg: "orange.50"
                                    }}
                                    _focus={{
                                        bg: "orange.100"
                                    }}
                                >
                                    <HStack gap={3}>
                                        <Box
                                            color="orange.500"
                                            display="flex"
                                            alignItems="center"
                                        >
                                            <Icon size={20} />
                                        </Box>

                                        <Text
                                            fontWeight="600"
                                            color="gray.700"
                                        >
                                            {intl.formatMessage({
                                                id: `menu.${item.value}`
                                            })}
                                        </Text>
                                    </HStack>
                                </Menu.Item>
                            );
                        })}
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    );
}
