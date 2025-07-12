import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { useUserRole } from '../services/userService';
import { useAdminRole } from '../hooks/useAdminRole';

/**
 * Componente temporal para debuggear permisos de usuario
 */
const UserDebugInfo: React.FC = () => {
  const [user] = useAuthState(auth);
  const { userRole, loading: roleLoading } = useUserRole(user || null);
  const { isAdmin, loading: adminLoading } = useAdminRole();

  if (!user) {
    return (
      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-bold text-yellow-800 mb-2">🔍 Debug Info - No User</h3>
        <p className="text-yellow-700">No hay usuario autenticado</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-bold text-blue-800 mb-2">🔍 Debug Info - User Permissions</h3>
      <div className="space-y-2 text-sm">
        <p><strong>UID:</strong> {user.uid}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Is Admin (hook):</strong> {adminLoading ? 'Loading...' : isAdmin ? '✅ YES' : '❌ NO'}</p>
        <p><strong>Is Admin (userRole):</strong> {roleLoading ? 'Loading...' : userRole.isAdmin ? '✅ YES' : '❌ NO'}</p>
        <p><strong>Is Especialista:</strong> {roleLoading ? 'Loading...' : userRole.isEspecialista ? '✅ YES' : '❌ NO'}</p>
        <p><strong>Especialista Tipo:</strong> {userRole.especialistaTipo || 'N/A'}</p>
        <p><strong>Loading States:</strong> Role: {roleLoading ? '⏳' : '✅'}, Admin: {adminLoading ? '⏳' : '✅'}</p>
        
        <div className="mt-3 p-2 bg-blue-50 rounded">
          <p className="font-semibold">Can access specialist dashboards?</p>
          <ul className="list-disc list-inside text-xs">
            <li>Nutrición: {(isAdmin || userRole.especialistaTipo === 'nutricionista') ? '✅' : '❌'}</li>
            <li>Psicología: {(isAdmin || userRole.especialistaTipo === 'psicologo') ? '✅' : '❌'}</li>
            <li>Coach: {(isAdmin || userRole.especialistaTipo === 'coach') ? '✅' : '❌'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserDebugInfo;
