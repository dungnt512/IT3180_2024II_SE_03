import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
} from 'react-icons/md';

// Admin Imports
import NFTMarketplace from 'views/admin/marketplace';
import Profile from 'views/admin/profile';
import UserProfile from 'views/user/profile';
import DataTables from 'views/admin/dataTables';
import RTL from 'views/admin/rtl';

// User Imports (nếu có khác biệt trong tương lai)
import UserDataTables from 'views/user/dataTables'; 
import UserNFTMarketplace from 'views/user/marketplace';
// Auth Imports
import SignInCentered from 'views/auth/signIn';
import SignUpCentered from 'views/auth/signUp';
import VerifySignUpCentered from 'views/auth/verify';
import ForgotSignUpCentered from 'views/auth/forgotPassword';
import VerifyForgotSignUpCentered from 'views/auth/verifyForgot';

// Admin routes
export const adminRoutes = [
  {
    name: 'Data Tables',
    layout: '/admin',
    path: '/data-tables',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: <DataTables />,
  },
  {
    name: 'Profile',
    layout: '/admin',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Profile />,
  },
];

// User routes
export const userRoutes = [
  {
    name: 'Profile',
    layout: '/user',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <UserProfile />,
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
