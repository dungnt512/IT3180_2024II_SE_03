/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2023 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import React from "react";

// Chakra imports
import {
  Box,
  Button,
  Flex,
  Grid,
  Link,
  Text,
  useColorModeValue,
  SimpleGrid,
} from "@chakra-ui/react";

// Custom components
import Banner from "views/admin/marketplace/components/Banner";
import TableTopCreators from "views/admin/marketplace/components/TableTopCreators";
import HistoryItem from "views/admin/marketplace/components/HistoryItem";
import NFT from "components/card/NFT";
import Card from "components/card/Card.js";

// Assets
import Nft1 from "assets/img/nfts/user_background_new2.png";
import Nft2 from "assets/img/nfts/home_background.jpg";
import Nft3 from "assets/img/nfts/bill_background.jpg";
import Nft4 from "assets/img/nfts/Nft4.png";
import Nft5 from "assets/img/nfts/Nft5.png";
import Nft6 from "assets/img/nfts/Nft6.png";
import MiniCalendar from "components/calendar/MiniCalendar";
import Avatar1 from "assets/img/avatars/avatar1.jpg";
import Avatar2 from "assets/img/avatars/avatar2.jpg";
import Avatar3 from "assets/img/avatars/avatar3.jpg";
import Avatar4 from "assets/img/avatars/avatar4.jpg";
import tableDataTopCreators from "views/admin/marketplace/variables/tableDataTopCreators.json";
import { tableColumnsTopCreators } from "views/admin/marketplace/variables/tableColumnsTopCreators";

export default function Marketplace() {
  // Chakra Color Mode
  const [isUserOpen, setIsUserOpen] = React.useState(false)
  const [isApartmentOpen, setIsApartmentOpen] = React.useState(false)
  const [isBillOpen, setIsBillOpen] = React.useState(false)
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.500", "white");
  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
      {/* Main Fields */}
      <Grid
        mb='20px'
        gridTemplateColumns={{ xl: "repeat(3, 1fr)", "2xl": "1fr 0.46fr" }}
        gap={{ base: "20px", xl: "20px" }}
        display={{ base: "block", xl: "grid" }}>
        <Flex
          flexDirection='column'
          gridArea={{ xl: "1 / 1 / 2 / 3", "2xl": "1 / 1 / 2 / 2" }}>
          <Banner />
          <Flex direction='column'>
            <Flex
              mt='45px'
              mb='20px'
              justifyContent='space-between'
              direction={{ base: "column", md: "row" }}
              align={{ base: "start", md: "center" }}>
              <Text color={textColor} fontSize='2xl' ms='24px' fontWeight='700'>
              Administrative Control Panel
              </Text>
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap='20px'>
              <NFT
                name='User Data'
                author='By SE_03 Team'
                bidders={[
                  Avatar1,
                  Avatar2,
                  Avatar3,
                  Avatar4,
                ]}
                image={Nft1}
                currentbid='0.91 ETH'
                download='#'
                isOpen = {isUserOpen}
                setIsOpen = {setIsUserOpen}
                mode = 'user'
              />
              <NFT
                name='Apartment Data'
                author='By SE_03 Team'
                bidders={[
                  Avatar1,
                  Avatar2,
                  Avatar3,
                  Avatar4,
                ]}
                image={Nft2}
                currentbid='0.91 ETH'
                download='#'
                isOpen = {isApartmentOpen}
                setIsOpen = {setIsApartmentOpen}
                mode = 'apartment'
              />
              <NFT
                name='Bill Data '
                author='By SE_03 Team'
                bidders={[
                  Avatar1,
                  Avatar2,
                  Avatar3,
                  Avatar4,
                ]}
                image={Nft3}
                currentbid='0.91 ETH'
                download='#'
                isOpen = {isBillOpen}
                setIsOpen = {setIsBillOpen}
                mode = 'bill'
              />
            </SimpleGrid>
            
          </Flex>
        </Flex>
        <Flex
          flexDirection='column'
          gridArea={{ xl: "1 / 3 / 2 / 4", "2xl": "1 / 2 / 2 / 3" }}>
          <Card px='0px' mb='20px'>
          <MiniCalendar h='100%' minW='70%' selectRange={false} ml="auto" mr="45px" />
          </Card>
        </Flex>
      </Grid>
      {/* Delete Product */}
    </Box>
  );
}
