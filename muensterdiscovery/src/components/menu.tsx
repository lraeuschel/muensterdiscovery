    import { useNavigate } from "react-router-dom";
    import { Menu, Button, Portal, Box } from "@chakra-ui/react";
    import { RxHamburgerMenu } from "react-icons/rx";
    import { IoIosHelpCircleOutline } from "react-icons/io";
    import { CiRoute } from "react-icons/ci";
    import { MdOutlineLeaderboard } from "react-icons/md";
    import { IoEarthOutline } from "react-icons/io5";
    import { CgProfile } from "react-icons/cg";

    export default function MenuComponent() {
        const navigate = useNavigate();

        const menuItems = [
            { value: "profile", icon: <CgProfile size={20} />, path: "/profile" },
            { value: "open-world", icon: <IoEarthOutline size={20} />, path: "/openworld" },
            { value: "leaderboard", icon: <MdOutlineLeaderboard size={20} />, path: "/leaderboard" },
            { value: "routes", icon: <CiRoute size={20} />, path: "/routeselection" },
            { value: "help", icon: <IoIosHelpCircleOutline size={20} />, path: "/help" },
        ];

        return (
            <Box position="fixed" top="10px" left="10px">
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
                                        value={item.value}
                                        onClick={() => navigate(item.path)} // <-- Hier wird navigiert
                                        width={"fit-content"}
                                    >
                                        {item.icon}
                                    </Menu.Item>
                                ))}
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                </Menu.Root>
            </Box>
        );
    }
