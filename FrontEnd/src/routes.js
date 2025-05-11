import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
  MdFeedback,
} from 'react-icons/md';

// Admin Imports
import NFTMarketplace from 'views/admin/marketplace';
import Profile from 'views/admin/profile';
import Complaint from 'views/user/complaint';
import UserProfile from 'views/user/profile';
import DataTables from 'views/admin/dataTables';
import RTL from 'views/admin/rtl';

// User Imports (nếu có khác biệt trong tương lai)
import UserDataTables from 'views/user/dataTables'; 
import UserNFTMarketplace from 'views/user/marketplace';
import UserCar from 'views/user/car';
// Auth Imports
import SignInCentered from 'views/auth/signIn';
import SignUpCentered from 'views/auth/signUp';
import VerifySignUpCentered from 'views/auth/verify';
import ForgotSignUpCentered from 'views/auth/forgotPassword';
import VerifyForgotSignUpCentered from 'views/auth/verifyForgot';
import AdminComplaint from 'views/admin/complaint';
import { MdLocalParking } from "react-icons/md";

// Admin routes
export const adminRoutes = [
  {
    name: 'Admin Main Dashboard',
    layout: '/admin',
    path: '/data-tables',
    icon: (
      <Icon
        as={MdBarChart}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    component: <NFTMarketplace />,
    secondary: true,
  },
  {
    name: 'Profile',
    layout: '/admin',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Profile />,
  },
  {
    name: 'Resident Complaints',
    layout: '/admin',
    path: '/complaint',
    icon: <Icon as={MdFeedback} width="20px" height="20px" color="inherit" />,
    component: <AdminComplaint />,
  },
];

// User routes
export const userRoutes = [
  {
    name: 'User Main Dashboard',
    layout: '/user',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <UserProfile />,
  },
  {
    name: 'Resident Complaint Service',
    layout: '/user',
    path: '/complaint',
    icon: <Icon as={MdFeedback} width="20px" height="20px" color="inherit" />,
    component: <Complaint />,
  },
  {
    name: 'Parking Booking Service',
    layout: '/user',
    path: '/car',
    icon: <Icon as={MdLocalParking} width="20px" height="20px" color="inherit" />,
    component: <UserCar />,
  },
];

// Auth routes
export const authRoutes = [
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignInCentered />,
  },
  {
    layout: '/auth',
    path: '/sign-up',
    component: <SignUpCentered />,
  },
  {
    layout: '/auth',
    path: '/verify',
    component: <VerifySignUpCentered />,
  },
  {
    layout: '/auth',
    path: '/forgot-password',
    component: <ForgotSignUpCentered />,
  },
  {
    layout: '/auth',
    path: '/verify-forgot-password',
    component: <VerifyForgotSignUpCentered />,
  },
];

// Combine all routes
const routes = [...adminRoutes, ...userRoutes, ...authRoutes];

export default routes;
