import apiClient from './auth.js';

export const registerDeviceApi = async (fcmToken, plataforma = 'web') => {
    try {
        //console.log('📱 Registrando dispositivo (FCM Token)...');
        const res = await apiClient.post('/dispositivos/crear', {
            fcm_token: fcmToken,
            plataforma: plataforma
        });

        const response = res.data;

        if (response.status === 'success' || response.id) {
            //console.log('✅ Dispositivo registrado exitosamente');
            return response;
        } else {
            console.warn('⚠️ Respuesta inesperada al registrar dispositivo:', response);
            return response;
        }
    } catch (error) {
        //console.error('❌ Error al registrar dispositivo:', error);
        return null;
    }
};
