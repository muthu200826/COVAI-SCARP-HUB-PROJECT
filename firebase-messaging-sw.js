/* =====================================================
   COVAI SCRAP HUB
   Firebase Cloud Messaging Service Worker
===================================================== */

importScripts(
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js"
);


/* =====================================================
   FIREBASE CONFIG
===================================================== */

firebase.initializeApp({

    apiKey:
        "AIzaSyCAVdbE2YfcRUEizM9qhp3HMAdY2fEDUsc",

    authDomain:
        "covaiscrap.firebaseapp.com",

    databaseURL:
        "https://covaiscrap-default-rtdb.firebaseio.com",

    projectId:
        "covaiscrap",

    storageBucket:
        "covaiscrap.firebasestorage.app",

    messagingSenderId:
        "1093933670685",

    appId:
        "1:1093933670685:web:e305d3ed1e4f62e269c1f4",

    measurementId:
        "G-MCXYBSB57M"

});


/* =====================================================
   FIREBASE MESSAGING
===================================================== */

const messaging =
    firebase.messaging();


/* =====================================================
   BACKGROUND NOTIFICATIONS
===================================================== */

messaging.onBackgroundMessage(
    function(payload){

        console.log(
            "[firebase-messaging-sw.js] Background message:",
            payload
        );


        const notification =
            payload.notification || {};


        const title =
            notification.title ||
            "COVAI SCRAP HUB";


        const options = {

            body:
                notification.body ||
                "You have a new update.",

            icon:
                "/logo.jpeg",

            badge:
                "/logo.jpeg",

            data:
                payload.data || {},

            tag:
                "covai-scrap-hub-notification",

            requireInteraction:
                false

        };


        return self.registration.showNotification(
            title,
            options
        );

    }
);


/* =====================================================
   NOTIFICATION CLICK
===================================================== */

self.addEventListener(
    "notificationclick",
    function(event){

        event.notification.close();


        const target =
            event.notification?.data?.url ||
            "/customer.html";


        event.waitUntil(

            clients.matchAll({
                type: "window",
                includeUncontrolled: true
            }).then(
                function(clientList){

                    for(
                        const client
                        of clientList
                    ){

                        if(
                            "focus" in client
                        ){

                            client.navigate(
                                target
                            );

                            return client.focus();

                        }

                    }


                    if(
                        clients.openWindow
                    ){

                        return clients.openWindow(
                            target
                        );

                    }

                }
            )

        );

    }
);