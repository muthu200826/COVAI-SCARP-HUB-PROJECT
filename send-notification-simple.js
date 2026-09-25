/* =====================================================
   SEND PUSH NOTIFICATION TO ALL CUSTOMERS

   SETUP:
   1. npm install node-fetch
   2. Get Firebase Server Key from Console
   3. Update SERVER_KEY below
   4. Run: node send-notification-simple.js
===================================================== */

// CONFIGURATION
const SERVER_KEY = 'YOUR_FIREBASE_SERVER_KEY_HERE'; // Get from Firebase Console
const DATABASE_URL = 'https://covaiscrap-default-rtdb.firebaseio.com/notificationTokens.json';

/* =====================================================
   SEND NOTIFICATION
===================================================== */

async function sendNotificationToAll(title, message) {

    console.log('📱 Fetching customer tokens...');

    // Get all tokens from Firebase Realtime Database
    const response = await fetch(DATABASE_URL);
    const tokens = await response.json();

    if (!tokens) {
        console.log('❌ No tokens found in database');
        return;
    }

    // Extract token strings
    const tokenList = Object.values(tokens)
        .filter(t => t.token && t.enabled)
        .map(t => t.token);

    console.log(`✓ Found ${tokenList.length} registered customers`);

    if (tokenList.length === 0) {
        console.log('❌ No active tokens to send to');
        return;
    }

    // Send to each customer
    console.log('📤 Sending notifications...');

    let successCount = 0;
    let failCount = 0;

    for (const token of tokenList) {

        const payload = {
            to: token,
            notification: {
                title: title,
                body: message,
                icon: '/logo.jpeg',
                badge: '/logo.jpeg',
                click_action: 'https://yoursite.com/customer.html'
            }
        };

        try {
            const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                headers: {
                    'Authorization': `key=${SERVER_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await fcmResponse.json();

            if (result.success === 1) {
                successCount++;
            } else {
                failCount++;
                console.log('  ⚠ Failed for token:', token.substring(0, 20) + '...');
            }

        } catch (error) {
            failCount++;
            console.log('  ❌ Error:', error.message);
        }
    }

    console.log('\n=== RESULTS ===');
    console.log(`✓ Success: ${successCount}`);
    console.log(`✗ Failed: ${failCount}`);
    console.log(`📊 Total: ${tokenList.length}`);
}

/* =====================================================
   MAIN
===================================================== */

// Check if SERVER_KEY is set
if (SERVER_KEY === 'YOUR_FIREBASE_SERVER_KEY_HERE') {
    console.log('❌ ERROR: Please set your Firebase Server Key!');
    console.log('\nSteps:');
    console.log('1. Go to: https://console.firebase.google.com/');
    console.log('2. Select your project');
    console.log('3. Settings → Project Settings → Cloud Messaging');
    console.log('4. Copy "Server key"');
    console.log('5. Update SERVER_KEY in this file');
    process.exit(1);
}

// Get title and message from command line or use defaults
const title = process.argv[2] || 'COVAI SCRAP HUB';
const message = process.argv[3] || 'New scrap rates updated! Check the app now.';

console.log('\n🔔 COVAI SCRAP HUB - Push Notification Sender\n');
console.log(`Title: ${title}`);
console.log(`Message: ${message}\n`);

// Send notification
sendNotificationToAll(title, message)
    .then(() => {
        console.log('\n✓ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });

/* =====================================================
   USAGE EXAMPLES

   1. Send default notification:
      node send-notification-simple.js

   2. Send custom notification:
      node send-notification-simple.js "Rate Update" "Iron price increased to ₹45/kg"

   3. Send pickup reminder:
      node send-notification-simple.js "Pickup Reminder" "Your pickup is scheduled for tomorrow"
===================================================== */
