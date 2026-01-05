    import { useNavigate } from "react-router-dom";
    import { Menu, Button, Portal, Box, HStack } from "@chakra-ui/react";
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
            { value: "welcome", icon: <RiHome2Line size={20} />, path: "/" },
            { value: "profile", icon: <CgProfile size={20} />, path: "/profile" },
            { value: "open-world", icon: <IoEarthOutline size={20} />, path: "/openworld" },
            { value: "leaderboard", icon: <MdOutlineLeaderboard size={20} />, path: "/leaderboard" },
            { value: "routeselection", icon: <CiRoute size={20} />, path: "/routeselection" },
            { value: "help", icon: <IoIosHelpCircleOutline size={20} />, path: "/help" },
        ];

        return (
            <Menu.Root>
                <Menu.Trigger asChild>
                    <Button variant="subtle" size="md">
                        <RxHamburgerMenu size={24} />
                    </Button>
                </Menu.Trigger>

                <Portal>
                    <Menu.Positioner>
                        <Menu.Content>
                            {menuItems.map((item) => (
                                <Menu.Item
                                    key={item.value}
                                    value={item.value}
                                    onClick={() => navigate(item.path)}
                                    width={"full"}
                                >
                                    <Box >
                                        <HStack>
                                            {intl.formatMessage({ id: `menu.${item.value}` })}
                                            {item.icon}
                                        </HStack>
                                    </Box>
                                </Menu.Item>
                            ))}
                        </Menu.Content>
                    </Menu.Positioner>
                </Portal>
            </Menu.Root>
        );
    }
