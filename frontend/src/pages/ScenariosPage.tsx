import { Navigate, useSearchParams } from 'react-router-dom';
export const ScenariosPage = () => {
  const [params] = useSearchParams();
  const query = new URLSearchParams({ tab: 'twin' });
  if (params.get('project_id')) query.set('project_id', params.get('project_id')!);
  return <Navigate to={'/intelligence?' + query.toString()} replace />;
};
