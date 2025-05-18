import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdLock,
  MdOutlineShoppingCart,
  MdFeedback,
  MdHome,
  MdPayment,
  MdLocalParking,
  MdAttachMoney,
  MdReceiptLong,
  MdWaterDrop,
  MdElectricalServices,
  MdLibraryBooks,
  MdSell,
  MdPeople,
  MdNotifications,
  MdExplore,
} from 'react-icons/md';

// Admin Imports
import NFTMarketplace from 'views/admin/marketplace';
import Profile from 'views/admin/profile';
import Complaint from 'views/user/complaint';
import UserProfile from 'views/user/profile';
import Contributions from 'views/admin/contributions';
import UserContribution from 'views/user/contribution';
import InvoicesAdmin from "views/admin/invoices";
import UserInvoice from "views/user/invoice";
import FeeUnitList from "views/admin/feeUnit/FeeUnitList";
import FeeUnitForm from "views/admin/feeUnit/FeeUnitForm";
// import BatchBillCreation from "views/admin/utilities/BatchBillCreation";
import UtilityBillsCreation from "views/admin/utilities/UtilityBillsCreation";
import Notif from "views/admin/notif";
import Bill from "views/admin/bill";
import AdminCar from "views/admin/parking";

// User Imports (if there are differences in the future)
import UserCar from 'views/user/car';
import UserPay from 'views/user/payment';
// Auth Imports
import SignInCentered from 'views/auth/signIn';
import SignUpCentered from 'views/auth/signUp';
import VerifySignUpCentered from 'views/auth/verify';
import ForgotSignUpCentered from 'views/auth/forgotPassword';
import VerifyForgotSignUpCentered from 'views/auth/verifyForgot';
import AdminComplaint from 'views/admin/complaint';
import AdminApartment from 'views/admin/apartment';
import UserTable from 'views/admin/user';
import HomePage from 'views/user/homepage';

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
  {
    name: 'Apartment Management',
    layout: '/admin',
    path: '/apartment',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <AdminApartment />,
  },
  {
    name: 'Resident Management',
    layout: '/admin',
    path: '/resident',
    icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
    component: <UserTable />,
  },
  {
    name: 'Bill Management',
    layout: '/admin',
    path: '/bill',
    icon: <Icon as={MdReceiptLong} width="20px" height="20px" color="inherit" />,
    component: <Bill />,
  },
  {
    name: 'Contributions Management',
    layout: '/admin',
    path: '/contributions',
    icon: <Icon as={MdAttachMoney} width="20px" height="20px" color="inherit" />,
    component: <Contributions />,
  },
  {
    name: 'Invoice Management',
    layout: '/admin',
    path: '/invoices',
    icon: <Icon as={MdLibraryBooks} width="20px" height="20px" color="inherit" />,
    component: <InvoicesAdmin />,
  },
  {
    name: 'Fee Unit Management',
    layout: '/admin',
    path: '/fee-units',
    icon: <Icon as={MdSell} width="20px" height="20px" color="inherit" />,
    component: <FeeUnitForm />,
  },
  // {
  //   name: 'Batch Utility Bills',
  //   layout: '/admin',
  //   path: '/batch-bills',
  //   icon: <Icon as={MdWaterDrop} width="20px" height="20px" color="inherit" />,
  //   component: <BatchBillCreation />,
  // },
  {
    name: 'Utility Bills Creation',
    layout: '/admin',
    path: '/utility-bills',
    icon: <Icon as={MdElectricalServices} width="20px" height="20px" color="inherit" />,
    component: <UtilityBillsCreation />,
  },
  {
    name: 'Notification Service',
    layout: '/admin',
    path: '/notifications',
    icon: <Icon as={MdNotifications} width="20px" height="20px" color="inherit" />,
    component: <Notif />,
  },
  {
    name: 'Parking Booking Service',
    layout: '/admin',
    path: '/car',
    icon: <Icon as={MdLocalParking} width="20px" height="20px" color="inherit" />,
    component: <AdminCar />,
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
  {
    name: 'Bill Payment Service',
    layout: '/user',
    path: '/payment',
    icon: <Icon as={MdPayment} width="20px" height="20px" color="inherit" />,
    component: <UserPay />,
  },
  {
    name: 'Contribution Service',
    layout: '/user',
    path: '/contribution',
    icon: <Icon as={MdAttachMoney} width="20px" height="20px" color="inherit" />,
    component: <UserContribution />,
  },
  {
    name: 'Invoices',
    layout: '/user',
    path: '/invoice',
    icon: <Icon as={MdReceiptLong} width="20px" height="20px" color="inherit" />,
    component: <UserInvoice />,
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
