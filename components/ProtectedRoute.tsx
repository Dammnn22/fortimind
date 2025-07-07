
import React, { ReactNode } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../firebase"; // Ensure this path is correct
import LoadingSpinner from "./LoadingSpinner";
import { useLocalization } from "../hooks/useLocalization";

type Props = {
  children: ReactNode;
  isGuest?: boolean; // Add isGuest prop
};

const ProtectedRoute: React.FC<Props> = ({ children, isGuest }) => {
  const [user, loading, error] = useAuthState(auth);
  const location = useLocation();
  const { t } = useLocalization();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-light dark:bg-neutral-dark">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-neutral-dark dark:text-neutral-light">{t('loading')}...</p>
      </div>
    );
  }

  if (error) {
    // Handle error state, perhaps redirect to an error page or show a message
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-light dark:bg-neutral-dark">
        <p className="text-danger dark:text-danger-light">{t('error')}: {error.message}</p>
        <p className="mt-2 text-neutral-dark dark:text-neutral-light">
          {t('loginErrorInvalidCredentials')} {/* Or a more generic error message */}
        </p>
      </div>
    );
  }

  // If user is not logged in AND not a guest, redirect to login page
  if (!user && !isGuest) {
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is logged in OR is a guest, render the children components
  return <>{children}</>;
};

export default ProtectedRoute;
