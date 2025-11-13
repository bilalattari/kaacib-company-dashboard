import { useSelector } from 'react-redux';
import { selectUser } from '@/redux/slices/authSlice';
import { GitFork, Mail, Phone, User2 } from 'lucide-react';

const Profile = () => {
  const user = useSelector(selectUser);

  console.log('User Profile:', user);

  const infoItems = [
    { label: 'Email', icon: <Mail />, value: user?.email },
    { label: 'Phone', icon: <Phone />, value: '+' + user?.phone },
    { label: 'Branch', icon: <GitFork />, value: user?.branch?.name || 'N/A' },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-1/3 px-9 py-12 rounded-lg border-2 theme-border shadow-md">
        <div className="flex flex-col items-center justify-between gap-3 mb-6">
          <User2 size={40} />
          <p className="text-lg">{user?.first_name + ' ' + user?.last_name}</p>
        </div>
        <div className="mb-6">
          {infoItems.map((item) => (
            <div className="w-full flex items-center mb-3" key={item.label}>
              {item.icon}
              <div className="ml-3">
                <p className="font-semibold text-md">{item.label}</p>
                <p className="text-sm">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div>
          <p className="font-semibold text-xl text-center mb-6">
            What you can do
          </p>

          <ul className="list-disc list-inside">
            {user?.permissions?.can_book_services && <li>Create tickets</li>}
            {user?.permissions?.can_complete_bookings && (
              <li>Approve quotations</li>
            )}
            {user?.permissions?.can_manage_assets && <li>Manage assets</li>}
            {user?.permissions?.can_manage_branches && <li>Manage branches</li>}
            {user?.permissions?.can_manage_users && <li>Manage users</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;
