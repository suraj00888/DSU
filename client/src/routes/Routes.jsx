import { createBrowserRouter } from 'react-router-dom';
import Signup from '../pages/Signup.jsx';
import Login from '../pages/Login.jsx';
import Home from '../pages/Home.jsx';
import { AuthLayout } from '../components/index.jsx';
import EventsPage from '../pages/EventsPage';
import EventDetails from '../pages/EventDetails';
import CreateEvent from '../pages/CreateEvent';
import EditEvent from '../pages/EditEvent';
import MyEvents from '../pages/MyEvents';
import ResourcesPage from '../pages/ResourcesPage';
import DiscussionForumPage from '../pages/DiscussionForumPage';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';

// Define routes using createBrowserRouter
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthLayout authentication={true}>
        <Home />
      </AuthLayout>
    ),
  },
  {
    path: "/signup",
    element: (
      <AuthLayout authentication={false}>
        <Signup />
      </AuthLayout>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthLayout authentication={false}>
        <Login />
      </AuthLayout>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <AuthLayout authentication={false}>
        <ForgotPassword />
      </AuthLayout>
    ),
  },
  {
    path: "/reset-password/:token",
    element: (
      <AuthLayout authentication={false}>
        <ResetPassword />
      </AuthLayout>
    ),
  },
  {
    path: "/profile",
    element: (
      <AuthLayout authentication={true}>
        <ProfilePage />
      </AuthLayout>
    ),
  },
  {
    path: "/events",
    element: (
      <AuthLayout authentication={true}>
        <EventsPage />
      </AuthLayout>
    ),
  },
  {
    path: "/events/create",
    element: (
      <AuthLayout authentication={true}>
        <CreateEvent />
      </AuthLayout>
    ),
  },
  {
    path: "/events/edit/:id",
    element: (
      <AuthLayout authentication={true}>
        <EditEvent />
      </AuthLayout>
    ),
  },
  {
    path: "/events/:id",
    element: (
      <AuthLayout authentication={true}>
        <EventDetails />
      </AuthLayout>
    ),
  },
  {
    path: "/my-events",
    element: (
      <AuthLayout authentication={true}>
        <MyEvents />
      </AuthLayout>
    ),
  },
  {
    path: "/resources",
    element: (
      <AuthLayout authentication={true}>
        <ResourcesPage />
      </AuthLayout>
    ),
  },
  {
    path: "/forum",
    element: (
      <AuthLayout authentication={true}>
        <DiscussionForumPage />
      </AuthLayout>
    ),
  },
  {
    // Add a catch-all route that redirects to login for any unmatched routes
    path: "*",
    element: <Login />
  }
]);

export default router; 