import React from 'react';
import { CommunityPage as CommunityPageComponent } from '../components/community/CommunityPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const CommunityPage: React.FC = () => {
  return <CommunityPageComponent />;
};

export default (props: any) => (
  <ProtectedRoute customMessage="You need an account to access the Community page." showRedirectButtons>
    <CommunityPage {...props} />
  </ProtectedRoute>
);