#!/usr/bin/env node

/* =====================================================
   COVAI SCRAP HUB - SEND PUSH NOTIFICATIONS

   Quick command-line tool to send notifications
===================================================== */

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function main() {
    console.log('\n🔔 COVAI SCRAP HUB - Push Notification Sender\n');
    console.log('═'.repeat(60) + '\n');

    // Get server key
    const serverKey = await question('📝 Firebase Server Key: ');

    if (!serverKey || serverKey.length < 10) {
        console.log('\n❌ Invalid server key\n');
        console.log('Get it from:');
        console.log('https://console.firebase.google.com/');
        console.log('→ Project Settings → Cloud Messaging → Server key\n');
        rl.close();
        return;
    }

    // Get notification details
    const title = await question('\n📌 Notification Title: ') || 'COVAI SCRAP HUB';
    const message = await question('💬 Notification Message: ') || 'New update available!';

    console.log('\n' + '═'.repeat(60));
    console.log('\n📱 Fetching customer tokens...\n');

    try {
        // Fetch tokens
        const DB_URL = 'https://covaiscrap-default-rtdb.firebaseio.com/notificationTokens.json';
        const response = await fetch(DB_URL);
        const tokens = await response.json();

        if (!tokens) {
            console.log('❌ No tokens found in database');
            console.log('\nCustomers need to enable notifications first:');
            console.log('→ Open customer.html');
            console.log('→ Click "Enable Notifications"\n');
            rl.close();
            return;
        }

        const tokenList = Object.values(tokens)
            .filter(t => t.token && t.enabled)
            .map(t => t.token);

        console.log(`✓ Found ${tokenList.length} registered customers\n`);

        if (tokenList.length === 0) {
            console.log('❌ No active tokens\n');
            rl.close();
            return;
        }

        // Confirm send
        const confirm = await question(`\n📤 Send to ${tokenList.length} customers? (y/n): `);

        if (confirm.toLowerCase() !== 'y') {
            console.log('\n❌ Cancelled\n');
            rl.close();
            return;
        }

        console.log('\n⏳ Sending notifications...\n');

        // Send notifications
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < tokenList.length; i++) {
            const token = tokenList[i];

            const payload = {
                to: token,
                notification: {
                    title: title,
                    body: message,
                    icon: '/logo.jpeg',
                    badge: '/logo.jpeg'
                }
            };

            try {
                const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `key=${serverKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await fcmResponse.json();

                if (result.success === 1) {
                    successCount++;
                    process.stdout.write(`\r✓ Sent: ${i + 1}/${tokenList.length}`);
                } else {
                    failCount++;
                    console.log(`\n  ⚠ Failed for customer ${i + 1}`);
                }

            } catch (error) {
                failCount++;
                console.log(`\n  ❌ Error for customer ${i + 1}: ${error.message}`);
            }
        }

        console.log('\n\n' + '═'.repeat(60));
        console.log('\n📊 RESULTS:\n');
        console.log(`✓ Success: ${successCount}`);
        console.log(`✗ Failed: ${failCount}`);
        console.log(`📈 Total: ${tokenList.length}`);
        console.log('\n✓ Done!\n');

    } catch (error) {
        console.log(`\n❌ Error: ${error.message}\n`);

        if (error.message.includes('fetch')) {
            console.log('Run: npm install node-fetch\n');
        }
    }

    rl.close();
}

main();
