import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { logout, checkSessionExpiry } from "../features/auth/authSlice";
import api from "../api/index.js";
import AppLayout from "../components/AppLayout";
import Header from "../components/Header";
import { Newspaper, Calendar, BookOpen, AlertCircle, CheckCircle } from "lucide-react";

const HomePage = () => {
  const [sessionExpired, setSessionExpired] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  // Check for success message in location state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Clear the state after reading it to prevent showing the message after page refresh
      window.history.replaceState({}, document.title);
      
      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Check token validity
  useEffect(() => {
    const checkToken = async () => {
      const result = await dispatch(checkSessionExpiry());
      if (result.payload && !result.payload.valid) {
        setSessionExpired(true);
      }
    };
    checkToken();
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      // Use axios instead of fetch
      await api.post("/api/auth/logout");
      
      // Whether the server logout was successful or not, we still logout locally
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if an error occurs
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <AppLayout>
      <Header title="Home" />
      
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {successMessage && (
          <div className="mb-6 bg-gradient-to-r from-green-500/20 to-green-500/5 backdrop-blur-sm rounded-lg shadow-sm p-4 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {sessionExpired && (
          <div className="mb-6 bg-gradient-to-r from-destructive/20 to-destructive/5 backdrop-blur-sm rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-destructive">
                  Your session has expired. Please{" "}
                  <button
                    onClick={handleLogout}
                    className="font-medium underline text-destructive hover:text-destructive/80 transition-colors"
                  >
                    log in
                  </button>{" "}
                  again.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">Welcome, {user?.name || "User"}!</h2>
          <p className="text-muted-foreground">
            This is your DSU Connect dashboard. Stay updated with campus events, resources, and connect with your peers through the discussion forum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Access Card */}
          <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-5 bg-gradient-to-r from-primary/10 to-transparent">
              <h3 className="font-semibold text-card-foreground">Quick Access</h3>
            </div>
            <div className="p-5 space-y-4">
              <Link to="/resources" className="flex items-center text-primary hover:text-primary/80 transition-colors group">
                <span className="mr-3 bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span>Course Materials</span>
              </Link>
              <Link to="/events" className="flex items-center text-primary hover:text-primary/80 transition-colors group">
                <span className="mr-3 bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Calendar className="h-5 w-5" />
                </span>
                <span>Upcoming Events</span>
              </Link>
              <Link to="/forum" className="flex items-center text-primary hover:text-primary/80 transition-colors group">
                <span className="mr-3 bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Newspaper className="h-5 w-5" />
                </span>
                <span>Campus News</span>
              </Link>
            </div>
          </div>

          {/* Announcements Card */}
          <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-5 bg-gradient-to-r from-primary/10 to-transparent">
              <h3 className="font-semibold text-card-foreground">Announcements</h3>
            </div>
            <div className="p-5">
              <div className="space-y-5">
                <div className="p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                  <h4 className="font-medium text-card-foreground">Course Registration</h4>
                  <p className="text-sm text-muted-foreground mt-1">Spring 2024 course registration opens next week. Make sure to check your eligibility and clear any holds.</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                  <h4 className="font-medium text-card-foreground">Campus Maintenance</h4>
                  <p className="text-sm text-muted-foreground mt-1">The west parking lot will be closed for maintenance from November 10-14.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Activity Card */}
          <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-5 bg-gradient-to-r from-primary/10 to-transparent">
              <h3 className="font-semibold text-card-foreground">Your Activity</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                  <div className="text-2xl font-bold text-primary">3</div>
                  <div className="text-xs text-muted-foreground">Events Joined</div>
                </div>
                <div className="text-center p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                  <div className="text-2xl font-bold text-primary">5</div>
                  <div className="text-xs text-muted-foreground">Forum Posts</div>
                </div>
                <div className="text-center p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-xs text-muted-foreground">Resources Accessed</div>
                </div>
                <div className="text-center p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                  <div className="text-2xl font-bold text-primary">2</div>
                  <div className="text-xs text-muted-foreground">Days Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default HomePage; 