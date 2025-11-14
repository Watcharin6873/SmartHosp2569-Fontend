import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Layout from '../layouts/Layout';
import Home from '../pages/Home';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import UserManual from '../pages/UserManual';
import ContactUs from '../pages/ContactUs';
import Survey from '../pages/Survey';
import Survey2 from '../pages/Survey2';
import ProtectRouteAdmin from './ProtectRouteAdmin';
import HomeAdmin from '../pages/admin/HomeAdmin';
import LayoutAdmin from '../layouts/LayoutAdmin';
import LayoutSurvey from '../layouts/LayoutSurvey';
import CreateTopic from '../pages/admin/CreateTopic';
import CreateQuestion from '../pages/admin/CreateQuestion';
import CreateCategory from '../pages/admin/CreateCategory';
import ChoiceSmartHosp from '../pages/admin/ChoiceSmartHosp';
import ScoreAfterService from '../pages/admin/ScoreAfterService';
import Thankyou from '../pages/Thankyou';
import Callback from '../pages/auth/Callback';

const router = createBrowserRouter([
  {
    path: '/smarthosp2569/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },
      { path:'callback', element: <Callback /> },
      { path: 'user-manual', element: <UserManual /> },
      { path: 'contact-us', element: <ContactUs /> },
      { path: 'survey', element: <Survey /> },
    ]
  },
  {
    path: '/smarthosp2569/survey2',
    element: <LayoutSurvey />,
    children: [
      { index: true, element: <Survey2 /> },
      {path: 'thankyou', element: <Thankyou />}
    ]
  },
  {
    path: '/smarthosp2569/admin',
    element: <ProtectRouteAdmin element={<LayoutAdmin />} />,
    children: [
      { index: true, element: <HomeAdmin /> },
      { path: 'create-topic', element: <CreateTopic /> },
      { path: 'create-question', element: <CreateQuestion /> },
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
