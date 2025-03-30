import { Box, Grid } from "@chakra-ui/react";
import Banner from "views/admin/profile/components/Banner";
import General from "views/user/profile/components/General";
import ApartmentList from "./components/ApartmentList";
import banner from "assets/img/auth/banner.png";
import avatar from "assets/img/avatars/avatarSimmmple.png";
import React from "react";

export default function Overview() {
  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        templateRows={{ base: "repeat(2, auto)", lg: "1fr" }}
        gap={{ base: "20px", xl: "20px" }}
      >
        <Banner
          gridArea="1 / 1 / 2 / 2"
          banner={banner}
          avatar={avatar}
          name="Resident of BlueMoon Apartment"
          job="You are admin"
          posts="17"
          followers="9.7k"
          following="274"
        />
        <General
          gridArea={{ base: "2 / 1 / 3 / 2", lg: "1 / 2 / 2 / 3" }}
          minH="365px"
          pe="20px"
        />
        <ApartmentList 
  gridArea={{ base: "3 / 1 / 4 / 2", lg: "1 / 2 / 2 / 3" }} 
  maxW="300px"
/>

      </Grid>
    </Box>
  );
}
