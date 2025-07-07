import { getMessaging, getToken, onMessage, Unsubscribe } from 'firebase/messaging';
import { app } from '../firebase'; // Import existing app
import { saveFcmToken, removeFcmToken } from './userMemoryService'; // Import save/remove functions
import * as fbAuth from 'firebase/auth';

// This VAPID key is a public key used by push services to identify the application server.
const VAPID_KEY = "BJsWEIr5TiR9ihjTM8hViwxFa0UneIDlI9pZGnLS6xhLw4vcmUDrqM_DkeZsYSOSoDmzGR13X3rPc6g3-9w27s4";

let messagingInstance: any = null;
try {
    messagingInstance = getMessaging(app);
} catch (e) {
    console.error("Could not initialize Firebase Messaging", e);
}

/**
 * Requests notification permission from the user, retrieves the FCM token, and saves it.
 * @param user The authenticated Firebase user.
 * @returns The FCM token if permission is granted, otherwise null.
 */
export const requestNotificationPermissionAndSaveToken = async (user: fbAuth.User): Promise<string | null> => {
    if (!messagingInstance || !user) {
        console.warn("Messaging not initialized or no user logged in.");
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            const currentToken = await getToken(messagingInstance, { 
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js')
            });
            if (currentToken) {
                await saveFcmToken(user.uid, currentToken);
                console.log('FCM Token retrieved and saved:', currentToken);
                localStorage.setItem('fcm_token', currentToken); // Save locally for potential removal
                return currentToken;
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        } else {
            console.log('Unable to get permission to notify.');
        }
    } catch (err) {
        console.error('An error occurred while retrieving token or registering service worker. ', err);
    }
    return null;
};

/**
 * Disables notifications by deleting the stored FCM token from Firestore.
 * @param user The authenticated Firebase user.
 */
export const disableNotificationsAndDeleteToken = async (user: fbAuth.User): Promise<void> => {
    const storedToken = localStorage.getItem('fcm_token');
    if (storedToken && user) {
        await removeFcmToken(user.uid, storedToken);
        localStorage.removeItem('fcm_token');
        console.log("FCM token removed from Firestore and local storage.");
    }
};


/**
 * Sets up a listener for incoming messages when the app is in the foreground.
 * @param callback The function to execute when a message is received.
 * @returns An unsubscribe function to clean up the listener.
 */
export const listenForForegroundMessages = (callback: (payload: any) => void): Unsubscribe => {
    if (!messagingInstance) {
        return () => {}; // Return an empty unsubscribe function if messaging is not available
    }
    return onMessage(messagingInstance, (payload) => {
        console.log('Foreground message received in service. ', payload);
        callback(payload);
    });
};
