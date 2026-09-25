/* =========================================================
   REAL-TIME TRACKING UPDATE SCRIPT
   Add this script to track.html for real-time tracking
========================================================= */

// Import Firebase modules (already imported in track.html)
// import { getDatabase, ref, onValue } from "firebase/database";

/* =========================================================
   TRACKING STAGES CONFIGURATION
========================================================= */

const trackingStages = [
    {
        id: 'pending',
        icon: '📝',
        label: 'Order Pending',
        desc: 'Order received, awaiting confirmation'
    },
    {
        id: 'confirmed',
        icon: '✅',
        label: 'Order Confirmed',
        desc: 'Order confirmed, preparing for pickup'
    },
    {
        id: 'on_the_way',
        icon: '🚛',
        label: 'On The Way',
        desc: 'Partner is heading to your location'
    },
    {
        id: 'picked_up',
        icon: '📦',
        label: 'Picked Up',
        desc: 'Scrap collected successfully'
    },
    {
        id: 'completed',
        icon: '🎉',
        label: 'Completed',
        desc: 'Order completed'
    }
];

/* =========================================================
   BUILD REALTIME TIMELINE
========================================================= */

function buildRealtimeTimeline(pickup){

    if(!pickup) return;

    // Get current tracking data
    const trackingStatus = pickup.trackingStatus || 'pending';
    const tracking = pickup.tracking || {};

    // Find current stage index
    const currentStageIndex = trackingStages.findIndex(s => s.id === trackingStatus);

    // Build timeline HTML
    const html = trackingStages.map((stage, index) => {
        const stageData = tracking[stage.id] || {};
        const isCompleted = stageData.completed || false;
        const isCurrent = index === currentStageIndex;
        const isActive = index <= currentStageIndex;
        const completedTime = stageData.time;

        let itemClasses = ['timeline-item'];
        if(isActive) itemClasses.push('active');
        if(isCurrent) itemClasses.push('current');
        if(isCompleted) itemClasses.push('completed');

        return `
            <div class="${itemClasses.join(' ')}" data-stage="${stage.id}">
                <div class="timeline-marker">
                    <div class="timeline-dot ${isCompleted ? 'completed-dot' : ''}">
                        ${isActive ? stage.icon : ''}
                    </div>
                    ${index < trackingStages.length - 1 ? '<div class="timeline-line"></div>' : ''}
                </div>

                <div class="timeline-content">
                    <div class="timeline-text">
                        ${stage.icon} ${stage.label}
                    </div>
                    <div class="timeline-desc">
                        ${stage.desc}
                    </div>
                    <div class="timeline-time">
                        ${completedTime ? formatTime(completedTime) : 'Waiting'}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Update both desktop and mobile containers
    const desktopContainer = document.getElementById('timelineContainer');
    if(desktopContainer){
        desktopContainer.innerHTML = html;

        // Trigger animation for current stage
        setTimeout(() => {
            const currentItem = desktopContainer.querySelector('.timeline-item.current');
            if(currentItem){
                currentItem.classList.add('animate-in');
            }
        }, 100);
    }

    const mobileContainer = document.getElementById('mobileTimelineContainer');
    if(mobileContainer){
        mobileContainer.innerHTML = html;
    }

    // Show completion animation if completed
    if(trackingStatus === 'completed'){
        // Save completion status to localStorage
        const orderId = pickup.id || 'current_order';
        saveCompletionToLocalStorage(orderId, pickup);
        showCompletionAnimation();
    }
}

/* =========================================================
   LOCALSTORAGE PERSISTENCE
========================================================= */

function saveCompletionToLocalStorage(orderId, orderData){
    try {
        const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '{}');

        completedOrders[orderId] = {
            completedAt: Date.now(),
            customerName: orderData.name || orderData.customerName || 'Customer',
            totalAmount: orderData.totalAmount || 0,
            trackingStatus: 'completed',
            allStagesCompleted: true,
            tracking: orderData.tracking || {}
        };

        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
        console.log('✓ Order completion saved to localStorage:', orderId);
    } catch(error) {
        console.error('Failed to save completion to localStorage:', error);
    }
}

function checkCompletionInLocalStorage(orderId){
    try {
        const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '{}');
        return completedOrders[orderId] || null;
    } catch(error) {
        console.error('Failed to check localStorage:', error);
        return null;
    }
}

function isOrderCompleted(orderId){
    const completed = checkCompletionInLocalStorage(orderId);
    return completed !== null;
}


/* =========================================================
   COMPLETION ANIMATION
========================================================= */

function showCompletionAnimation(){
    // Create completion overlay
    const overlay = document.createElement('div');
    overlay.className = 'completion-overlay';
    overlay.innerHTML = `
        <div class="completion-content">
            <div class="completion-icon">🎉</div>
            <div class="completion-title">Order Completed!</div>
            <div class="completion-message">Thank you for using Covai Scrap Hub</div>
            <div class="completion-status">Processing completion...</div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Add styles if not already added
    if(!document.getElementById('completion-styles')){
        const style = document.createElement('style');
        style.id = 'completion-styles';
        style.textContent = `
            .completion-overlay{
                position:fixed;
                top:0;
                left:0;
                right:0;
                bottom:0;
                background:rgba(0,168,107,0.95);
                z-index:9999;
                display:flex;
                align-items:center;
                justify-content:center;
                animation:fadeIn 0.5s;
            }

            .completion-content{
                text-align:center;
                color:#fff;
                animation:bounceIn 0.8s;
            }

            .completion-icon{
                font-size:120px;
                margin-bottom:20px;
                animation:rotate 1s;
            }

            .completion-title{
                font-size:36px;
                font-weight:700;
                margin-bottom:10px;
            }

            .completion-message{
                font-size:18px;
                opacity:0.9;
            }

            .completion-status{
                margin-top:20px;
                font-size:14px;
                color:#d1fae5;
                transition:all 0.3s ease;
            }

            @keyframes fadeIn{
                from{opacity:0;}
                to{opacity:1;}
            }

            @keyframes bounceIn{
                0%{transform:scale(0);opacity:0;}
                50%{transform:scale(1.1);}
                100%{transform:scale(1);opacity:1;}
            }

            @keyframes rotate{
                0%{transform:rotate(0deg);}
                100%{transform:rotate(360deg);}
            }

            .timeline-item.animate-in{
                animation:slideIn 0.5s;
            }

            @keyframes slideIn{
                from{
                    transform:translateX(-20px);
                    opacity:0;
                }
                to{
                    transform:translateX(0);
                    opacity:1;
                }
            }

            .timeline-dot.completed-dot{
                animation:checkmark 0.5s;
            }

            @keyframes checkmark{
                0%{transform:scale(0);}
                50%{transform:scale(1.2);}
                100%{transform:scale(1);}
            }
        `;
        document.head.appendChild(style);
    }

    // Update status message
    setTimeout(() => {
        const statusElement = overlay.querySelector('.completion-status');
        if(statusElement){
            statusElement.textContent = '✓ Completion saved!';
            statusElement.style.color = '#fff';
            statusElement.style.fontWeight = 'bold';
        }
    }, 1000);

    // Remove overlay after 3 seconds
    setTimeout(() => {
        overlay.style.animation = 'fadeIn 0.5s reverse';
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 500);
    }, 3000);
}

/* =========================================================
   LISTEN TO REALTIME UPDATES
========================================================= */

function listenToRealtimeUpdates(pickupId){
    // Get db from window scope
    const database = window.db || db;

    if(!database || !pickupId){
        console.error('Database or pickupId not available', {database, pickupId});
        return;
    }

    console.log('Setting up real-time listener for pickup:', pickupId);

    const pickupRef = ref(database, `pickupRequests/${pickupId}`);

    onValue(pickupRef, (snapshot) => {
        if(!snapshot.exists()){
            console.log('Pickup does not exist in database');
            return;
        }

        const pickup = snapshot.val();
        console.log('Pickup data updated:', pickup);

        // Update timeline with new data
        buildRealtimeTimeline(pickup);

        // Update status badge
        updateStatusBadge(pickup.trackingStatus || 'pending');
    });
}

/* =========================================================
   UPDATE STATUS BADGE
========================================================= */

function updateStatusBadge(status){
    const badge = document.querySelector('.status-badge');
    if(!badge) return;

    const statusMap = {
        'pending': { text: 'Pending', color: '#fb923c' },
        'confirmed': { text: 'Confirmed', color: '#60a5fa' },
        'on_the_way': { text: 'On The Way', color: '#a78bfa' },
        'picked_up': { text: 'Picked Up', color: '#34d399' },
        'completed': { text: 'Completed', color: '#10b981' }
    };

    const statusInfo = statusMap[status] || statusMap['pending'];

    badge.textContent = statusInfo.text;
    badge.style.background = `${statusInfo.color}22`;
    badge.style.color = statusInfo.color;
    badge.style.animation = 'pulse 0.5s';
}

/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(timestamp){
    if(!timestamp) return 'Waiting';

    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/* =========================================================
   EXPORT FOR USE IN track.html
========================================================= */

// Make functions available globally
window.buildRealtimeTimeline = buildRealtimeTimeline;
window.listenToRealtimeUpdates = listenToRealtimeUpdates;
window.showCompletionAnimation = showCompletionAnimation;

console.log('✓ Realtime tracking script loaded');
