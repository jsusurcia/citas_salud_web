import { messaging } from '../firebase/config';
import { getToken, onMessage } from "firebase/messaging";
import { registerDeviceApi } from '../api/notifications';

export const requestPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            //console.log('Notification permission granted.');
            // Get the token
            const vapidKey = "BPM2di6S1mQGTeRDk3ZuStBiGKwC_ni_DHpfQcfB0TbmNEX3yHImsn5UvDszKktZGh76PL2eW-vB2J0oGcDVVG0";
            const currentToken = await getToken(messaging, {
                vapidKey: vapidKey
            });

            if (currentToken) {
                //console.log('FCM Token:', currentToken);
                // Send the token to your server and update the UI if necessary
                await registerDeviceApi(currentToken);
                return currentToken;
            } else {
                //console.log('No registration token available. Request permission to generate one.');
            }
        } else {
            //console.log('Unable to get permission to notify.');
        }
    } catch (error) {
        //console.log('An error occurred while retrieving token. ', error);
    }
    return null;
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            //console.log('Message received. ', payload);
            resolve(payload);
        });
    });
