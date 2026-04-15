// Утилита для Push-уведомлений

// Запрос разрешения на уведомления
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Уведомления не поддерживаются');
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
}

// Отправить уведомление (через API)
export async function sendPushNotification(title, body, url = '/') {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/notifications/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, body, url })
    });
    return response.ok;
  } catch (error) {
    console.error('Ошибка отправки уведомления:', error);
    return false;
  }
}

// Локальное уведомление (для тестирования)
export function showLocalNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    });
  }
}

// Проверить статус разрешения
export function getNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}
