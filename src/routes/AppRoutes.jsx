import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Layout from '../layouts/Layout';
import Home from '../pages/Home';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import UserManual from '../pages/UserManual';
import ContactUs from '../pages/ContactUs'; 
import ProtectRouteAdmin from './ProtectRouteAdmin';
import HomeAdmin from '../pages/admin/HomeAdmin';
import LayoutAdmin from '../layouts/LayoutAdmin';
import LayoutSurvey from '../layouts/LayoutSurvey';
import CreateTopic from '../pages/admin/CreateTopic';
import CreateQuestion from '../pages/admin/CreateQuestion';
import CreateCategory from '../pages/admin/CreateCategory';
import ChoiceSmartHosp from '../pages/admin/ChoiceSmartHosp';
import ScoreAfterService from '../pages/admin/ScoreAfterService'; 
import Callback from '../pages/auth/Callback';
import PageAuth from '../pages/auth/PageAuth';
import CreateSubQuestion from '../pages/admin/CreateSubQuestion';

const router = createBrowserRouter([
  {
    path: '/smarthosp2569/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path:'page-auth', element: <PageAuth />},
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },
      { path:'callback', element: <Callback /> },
      { path: 'user-manual', element: <UserManual /> },
      { path: 'contact-us', element: <ContactUs /> }
    ]
  },
  {
    path: '/smarthosp2569/admin',
    element: <ProtectRouteAdmin element={<LayoutAdmin />} />,
    children: [
      { index: true, element: <HomeAdmin /> },
      { path: 'create-topic', element: <CreateTopic /> },
      { path: 'create-question', element: <CreateQuestion /> },
      { path: 'create-subquestion', element: <CreateSubQuestion />},
      { path: 'create-category', element: <CreateCategory /> },
      { path: 'create-choice', element: <ChoiceSmartHosp /> },
      { path: 'create-score-survey', element: <ScoreAfterService /> }
    ]
  }
]);

const AppRoutes = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default AppRoutes
