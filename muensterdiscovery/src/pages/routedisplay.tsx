import MenuComponent from "../components/menu";
import {Box, HStack, VStack } from "@chakra-ui/react";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
import MapView from "@arcgis/core/views/MapView";
import type { LanguageType } from "../components/languageSelector";
import LanguageSelector from "../components/languageSelector";

interface ArcgisMapElement extends HTMLElement {
    // Use the instance type of the MapView constructor so TS treats this as an instance type
    // instead of attempting to use a potential namespace named `MapView` as a type.
    view: InstanceType<typeof MapView> | undefined;
}

import { ArcgisMap } from "@arcgis/map-components-react";




export default function RouteDisplay({ setLanguage }: { setLanguage: (lang: LanguageType) => void }) {
    const handleViewReady = (event: CustomEvent) => {
        const mapElement = event.target as ArcgisMapElement;
        const view = mapElement.view;
        if (view) {
            view.center = [7.625, 51.960];
            view.zoom = 14;
        }
    };


    return (
        <Box minH="100vh">
            <HStack
                position="fixed"
                top="10px"
                right="10px"
                zIndex={10}
                width="100%"
                bg="whiteAlpha.900"
                >
                <MenuComponent />
                <LanguageSelector setLanguage={setLanguage} />
            </HStack>

            <VStack>
                    <ArcgisMap
                        itemId="1f619312739c450fae0d1749a3805ba2"
                        style={{ height: "100vh", width: "100%", zIndex: 2 }}
                        onArcgisViewReadyChange={handleViewReady}
                        >
                    </ArcgisMap>
            </VStack>
        </Box>
    )
}