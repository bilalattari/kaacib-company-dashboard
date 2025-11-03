import { Outlet } from 'react-router-dom';
import ThemedSidebar from '../components/ThemedSidebar';

const AppLayout = () => {
  return (
    <div className="flex w-screen h-screen">
      <div className="max-w-[10%]">
        <ThemedSidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
