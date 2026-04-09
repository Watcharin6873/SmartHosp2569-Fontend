import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Layout from '../layouts/Layout';
import Home from '../pages/Home';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import UserManual from '../pages/UserManual';
import ContactUs from '../pages/ContactUs'; 
import ProtectRouteAdmin from './ProtectRouteAdmin';
import ProtectRouteUser from './ProtectRouteUser';
import HomeAdmin from '../pages/admin/HomeAdmin';
import LayoutAdmin from '../layouts/LayoutAdmin';
import LayoutSurvey from '../layouts/LayoutSurvey';
import LayoutResponder from '../layouts/LayoutResponder';
import CreateTopic from '../pages/admin/CreateTopic';
import CreateQuestion from '../pages/admin/CreateQuestion';
import CreateCategory from '../pages/admin/CreateCategory';
import ChoiceSmartHosp from '../pages/admin/ChoiceSmartHosp';
import ScoreAfterService from '../pages/admin/ScoreAfterService'; 
import Callback from '../pages/auth/Callback';
import PageAuth from '../pages/auth/PageAuth';
import CreateSubQuestion from '../pages/admin/CreateSubQuestion';
import UsersManagement from '../pages/admin/UsersManagement';
import HomeResponder from '../pages/user/responder/HomeResponder';
import EvaluateInfrastructure from '../pages/user/responder/EvaluateInfrastructure';
import EvaluateManament from '../pages/user/responder/EvaluateManament';
import EvaluateOfficers from '../pages/user/responder/EvaluateOfficers';    
import EvaluateService from '../pages/user/responder/EvaluateService';
import DetailEvaluation from '../pages/user/responder/DetailEvaluation';
import HomeProvince from '../pages/user/province/HomeProvince';
import LayoutProvince from '../layouts/LayoutProvince';
import UsersProvManageMent from '../pages/user/province/UsersManagement';
import ProvApproveInfra from '../pages/user/province/ApproveInfraStructure';
import ProvApproveManage from '../pages/user/province/ApproveManagement';
import ProvApproveService from '../pages/user/province/ApproveService';
import ProvApprovePeople from '../pages/user/province/ApprovePeople';
import ReportProvince from '../pages/user/province/ReportProvince';
import LayoutZone from '../layouts/LayoutZone';
import HomeZone from '../pages/user/zone/HomeZone';
import ZoneUserManagement from '../pages/user/zone/ZoneUserManagement';
import ZoneInfraStructure from '../pages/user/zone/ZoneInfraStructure';
import ZoneManagement from '../pages/user/zone/ZoneManagement';
import ZoneService from '../pages/user/zone/ZoneService';
import ZonePeople from '../pages/user/zone/ZonePeople';
import ZoneApproved from '../pages/user/zone/ZoneApproved';
import ZoneReport from '../pages/user/zone/ZoneReport';
import AdminInfra from '../pages/admin/AdminInfra';
import AdminManagement from '../pages/admin/AdminManagement';
import AdminService from '../pages/admin/AdminService';
import AdminOfficer from '../pages/admin/AdminOfficer';
import DashboardAllEvaluate from '../pages/user/DashboardAllEvaluate';

const router = createBrowserRouter([
  {
    path: '/smarthosp2569/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'dashboard-all-evaluate', element: <DashboardAllEvaluate /> },
      { path: 'page-auth', element: <PageAuth />},
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },
      { path: 'callback', element: <Callback /> },
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
      { path: 'create-score-survey', element: <ScoreAfterService /> },
      { path: 'users-management', element: <UsersManagement /> },
      { path: 'admin-infra', element: <AdminInfra /> },
      { path: 'admin-management', element: <AdminManagement /> },
      { path: 'admin-service', element: <AdminService /> },
      { path: 'admin-people', element: <AdminOfficer /> }
    ]
  },
  {
    path: '/smarthosp2569/user/responder',
    element: <ProtectRouteUser element={<LayoutResponder />} />,
    children: [
      { index: true, element: <HomeResponder /> },
      { path: 'infrastructure', element: <EvaluateInfrastructure /> },
      { path: 'management', element: <EvaluateManament /> },
      { path: 'service', element: <EvaluateService /> },
      { path: 'officers', element: <EvaluateOfficers /> },
      { path: 'detail-evaluation', element: <DetailEvaluation />}
    ]
  },
  {
    path: '/smarthosp2569/user/prov-approve',
    element: <ProtectRouteUser element={<LayoutProvince />} />,
    children: [
      { index: true, element: <HomeProvince /> },
      { path: 'user-management', element: <UsersProvManageMent /> },
      { path: 'approve-infra', element: <ProvApproveInfra /> },
      { path: 'approve-management', element: <ProvApproveManage /> },
      { path: 'approve-service', element: <ProvApproveService /> },
      { path: 'approve-people', element: <ProvApprovePeople /> },
      { path: 'report-prov', element: <ReportProvince /> }
    ]
  },
  {
    path: '/smarthosp2569/user/zone-approve',
    element: <ProtectRouteUser element={<LayoutZone />} />,
    children: [
      {index: true, element: <HomeZone />},
      { path: 'zone-user-management', element: <ZoneUserManagement />},
      { path: 'zone-infra', element: <ZoneInfraStructure /> },
      { path: 'zone-management', element: <ZoneManagement /> },
      { path: 'zone-service', element: <ZoneService /> },
      { path: 'zone-people', element: <ZonePeople /> },
      { path: 'zone-approved', element: <ZoneApproved />},
      { path: 'report-zone', element: <ZoneReport /> }
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
