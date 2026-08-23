import { HealthUnit, AuthUser, UserRole } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// OAuth client ID from firebase-applet-config
export const GOOGLE_CLIENT_ID = firebaseConfig.oAuthClientId || "624685826000-mbs92pf1ft362pi1mjbktn3jrditvdd5.apps.googleusercontent.com";

interface GoogleUserPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

/**
 * Decode standard Google JWT Token without external libs
 */
function parseJwt(token: string): GoogleUserPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT:', e);
    return null;
  }
}

/**
 * Trigger Google Identity Services (GSI) OAuth 2.0 / One-Tap popup
 * Uses the official Google Identity Services library (<script src="https://accounts.google.com/gsi/client">)
 * which does NOT have Firebase Auth authorized-domain restrictions on custom domains.
 */
export const requestGoogleIdentitySignIn = (): Promise<{
  email: string;
  name: string;
  photoUrl?: string;
  uid: string;
}> => {
  return new Promise((resolve, reject) => {
    const google = (window as any).google;

    if (!google?.accounts?.id && !google?.accounts?.oauth2) {
      reject(new Error('A biblioteca de autenticação Google ainda está carregando. Por favor, aguarde alguns segundos ou use o Acesso Institucional Direto.'));
      return;
    }

    // Try Google OAuth2 TokenClient (Popup modal with prompt: 'select_account')
    if (google.accounts?.oauth2) {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              if (tokenResponse.error === 'origin_mismatch' || (tokenResponse.error_description && tokenResponse.error_description.includes('origin'))) {
                reject(new Error('Erro 400: origin_mismatch — O domínio atual não está registrado nas Origens JavaScript do Google Cloud. Utilize a opção "Acesso Direto com E-mail Homologado" abaixo para entrar imediatamente.'));
              } else {
                reject(new Error(tokenResponse.error_description || tokenResponse.error));
              }
              return;
            }
            if (!tokenResponse.access_token) {
              reject(new Error('Nenhum token retornado pelo Google.'));
              return;
            }

            // Fetch user info directly from Google userinfo endpoint with the access token
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`
                }
              });
              if (!res.ok) {
                throw new Error('Falha ao consultar perfil Google.');
              }
              const data = await res.json();
              if (!data.email) {
                throw new Error('Conta Google não retornou e-mail.');
              }
              resolve({
                email: data.email.toLowerCase().trim(),
                name: data.name || data.email.split('@')[0],
                photoUrl: data.picture,
                uid: data.sub || data.email
              });
            } catch (fetchErr: any) {
              reject(fetchErr);
            }
          },
          error_callback: (err: any) => {
            console.error('Google TokenClient error_callback:', err);
            if (err.type === 'origin_mismatch' || err.message?.includes('origin')) {
              reject(new Error('Erro 400: origin_mismatch — O domínio de pré-visualização atual precisa ser autorizado no Google Cloud Console. Use o "Acesso Direto com E-mail Homologado" para entrar agora mesmo.'));
            } else {
              reject(new Error(err.message || 'Erro na autenticação do Google.'));
            }
          }
        });

        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err: any) {
        console.warn('TokenClient failed, falling back to ID client:', err);
      }
    }

    // Fallback: Google OneTap / Prompt
    try {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (response.credential) {
            const payload = parseJwt(response.credential);
            if (payload && payload.email) {
              resolve({
                email: payload.email.toLowerCase().trim(),
                name: payload.name || payload.email.split('@')[0],
                photoUrl: payload.picture,
                uid: payload.sub
              });
            } else {
              reject(new Error('Token do Google não pôde ser decodificado.'));
            }
          } else {
            reject(new Error('Nenhuma credencial retornada pelo Google.'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          reject(new Error('A janela de login do Google não pôde ser exibida no momento. Utilize o "Acesso Direto com E-mail Homologado" para entrar.'));
        }
      });
    } catch (err: any) {
      reject(err);
    }
  });
};
