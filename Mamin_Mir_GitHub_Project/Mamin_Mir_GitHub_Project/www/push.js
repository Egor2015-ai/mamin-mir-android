import { PushNotifications } from '@capacitor/push-notifications';

const MOTHER_UID = '9EgLpJD00WdrxoESnTvoN049U6I3';
let started = false;

async function startPushForMother(user) {
  if (started || !user || user.uid !== MOTHER_UID) return;
  started = true;

  try {
    await PushNotifications.addListener('registration', async (token) => {
      try {
        await window.mmDb.collection('deviceTokens').doc(MOTHER_UID).set({
          token: token.value,
          updatedAt: Date.now()
        }, { merge: true });
        console.log('Устройство мамы зарегистрировано для уведомлений.');
      } catch (error) {
        console.error('Не удалось сохранить токен уведомлений:', error);
        alert('Не удалось подключить уведомления. Проверь правила Firestore.');
      }
    });

    await PushNotifications.addListener('registrationError', (error) => {
      console.error('Ошибка регистрации push:', error);
      alert('Не удалось зарегистрировать уведомления. Проверь настройки телефона и Firebase.');
    });

    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Получено уведомление:', notification);
    });

    let permission = await PushNotifications.checkPermissions();
    if (permission.receive === 'prompt') {
      permission = await PushNotifications.requestPermissions();
    }
    if (permission.receive !== 'granted') {
      alert('Разреши приложению «Мамин мир» отправлять уведомления в настройках телефона.');
      return;
    }
    await PushNotifications.register();
  } catch (error) {
    console.error('Push setup error:', error);
    started = false;
  }
}

window.mmAuth?.onAuthStateChanged((user) => startPushForMother(user));
