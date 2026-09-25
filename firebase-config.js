import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyCAVdbE2YfcRUEizM9qhp3HMAdY2fEDUsc",
  authDomain: "covaiscrap.firebaseapp.com",
  projectId: "covaiscrap",
  storageBucket: "covaiscrap.firebasestorage.app",
  messagingSenderId: "1093933670685",
  appId: "1:1093933670685:web:8eaee09d1380066669c1f4",
  measurementId: "G-2KRSZPXXVK"
};

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

async function initNotifications() {
  try {

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: "BDovvV7FxFORILMs2f0T7E2XJYi-qAxsXJaQ1YCUiulYUK1esQ24BTdTk_WVrV-8e0p-pl3LtHm3ERwJ5SYKHSQ"
    });

    console.log("FCM TOKEN:");
    console.log(token);

    localStorage.setItem("fcmToken", token);

  } catch (error) {
    console.error(error);
  }
}

onMessage(messaging, (payload) => {

  console.log("Message received:", payload);

  if (payload.notification) {
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: "/logo.jpeg"
    });
  }

});

initNotifications();