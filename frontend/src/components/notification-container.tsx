'use client';

import { NotificationToast, ToastNotification } from './notification-toast';

interface NotificationContainerProps {
  notifications: ToastNotification[];
  onRemove: (id: string) => void;
}

export function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] space-y-3 max-w-sm w-full pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={onRemove}
          />
        ))}
      </div>
    </div>
  );
}