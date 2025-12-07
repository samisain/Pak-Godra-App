
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendSystemNotification = (title: string, body?: string) => {
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: body,
        icon: 'https://fonts.gstatic.com/s/i/materialicons/notifications_active/v15/24px.svg', // Placeholder icon
      });
    } catch (e) {
      console.error("Notification failed", e);
    }
  }
};
