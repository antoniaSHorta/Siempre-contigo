import React, { useEffect } from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useIonRouter } from '@ionic/react';
import { IonSpinner } from '@ionic/react';

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  adminOnly = false,
  ...rest
}) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useIonRouter();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login', 'root', 'replace');
    } else if(isAuthenticated && adminOnly && !isAdmin){
      router.push('/app/home', 'root', 'replace');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <IonSpinner name="crescent" />;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          null
        )
      }
    />
  );
};

export default ProtectedRoute; 