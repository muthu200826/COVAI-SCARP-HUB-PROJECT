// Firebase Cloud Messaging - Real Push Notifications
// Include this script in customer pages to enable notifications

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

const firebaseConfig = {
    apiKey: "AIzaSyCAVdbE2YfcRUEizM9qhp3HMAdY2fEDUsc",
    authDomain: "covaiscrap.firebaseapp.com",
    projectId: "covaiscrap",
    storageBucket: "covaiscrap.firebasestorage.app",
    messagingSenderId: "1093933670685",
    appId: "1:1093933670685:web:e2ddfc1749c38db269c1f4",
    measurementId: "G-Y7SLXH4HJ6"
};

const app = initializeApp(firebaseConfig, 'fcm-app');
const db = getFirestore(app);
const messaging = getMessaging(app);

// Request notification permission and get FCM token
export async function initFCM() {
    try {
        // Register service worker
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered:', registration);
        }

        // Request permission
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('Notification permission granted');

            // Get FCM token
            const token = await getToken(messaging, {
                vapidKey: 'BDovvV7FxFORILMs2f0T7E2XJYi-qAxsXJaQ1YCUiulYUK1esQ24BTdTk_WVrV-8e0p-pl3LtHm3ERwJ5SYKHSQ'
            });

            if (token) {
                console.log('FCM Token:', token);
                await saveFCMToken(token);
                return token;
            } else {
                console.log('No FCM token available');
            }
        } else {
            console.log('Notification permission denied');
        }
    } catch (error) {
        console.error('FCM initialization error:', error);
    }
}

// Save FCM token to Firestore
async function saveFCMToken(token) {
    try {
        // Check if token already exists
        const tokensRef = collection(db, 'fcmTokens');
        const q = query(tokensRef, where('token', '==', token));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            // Save new token
            await addDoc(tokensRef, {
                token: token,
                createdAt: serverTimestamp(),
                userId: localStorage.getItem('userId') || 'anonymous',
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform
                }
            });
            console.log('FCM token saved to Firestore');
        } else {
            console.log('FCM token already exists');
        }
    } catch (error) {
        console.error('Error saving FCM token:', error);
    }
}

// Handle foreground messages
onMessage(messaging, (payload) => {
    console.log('Foreground Message:', payload);

    const { title, body, icon } = payload.notification;

    // Show browser notification
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: icon || '/logo.jpeg',
            badge: '/logo.jpeg',
            vibrate: [200, 100, 200],
            tag: 'covai-notification'
        });
    }

    // You can also update UI here
    showInAppNotification(title, body);
});

// Show in-app notification banner
function showInAppNotification(title, body) {
    // Create notification banner
    const banner = document.createElement('div');
    banner.className = 'fcm-notification-banner';
    banner.innerHTML = `
        <div class="fcm-notif-content">
            <div class="fcm-notif-icon">🔔</div>
            <div class="fcm-notif-text">
                <strong>${title}</strong>
                <p>${body}</p>
            </div>
            <button class="fcm-notif-close" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;

    // Add styles if not already added
    if (!document.getElementById('fcm-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'fcm-notification-styles';
        styles.textContent = `
            .fcm-notification-banner {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                background: #1a1f2e;
                border: 1px solid #34d399;
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 10px 30px rgba(0,0,0,.5);
                animation: slideIn 0.3s ease;
            }
            .fcm-notif-content {
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }
            .fcm-notif-icon {
                font-size: 24px;
                flex-shrink: 0;
            }
            .fcm-notif-text strong {
                display: block;
                color: #e0e6ed;
                font-size: 14px;
                margin-bottom: 4px;
            }
            .fcm-notif-text p {
                color: #9ca3af;
                font-size: 12px;
                margin: 0;
            }
            .fcm-notif-close {
                background: none;
                border: none;
                color: #9ca3af;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                flex-shrink: 0;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @media(max-width: 768px) {
                .fcm-notification-banner {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(banner);

    // Auto remove after 5 seconds
    setTimeout(() => {
        banner.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => banner.remove(), 300);
    }, 5000);
}

// Initialize FCM on page load
window.addEventListener('DOMContentLoaded', () => {
    // Request permission after 3 seconds (better UX)
    setTimeout(() => {
        if (Notification.permission === 'default') {
            initFCM();
        }
    }, 3000);
});

// Export for manual initialization
window.initFCM = initFCM;
