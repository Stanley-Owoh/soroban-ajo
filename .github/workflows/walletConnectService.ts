import * as Linking from 'expo-linking';

/**
 * Service for managing mobile wallet connections via deep linking.
 */

const AJO_SCHEME = 'ajo://auth';

export interface WalletConnectionResult {
    publicKey: string;
    network: string;
    signature?: string;
}

/**
 * Opens the LOBSTR mobile app for authentication.
 */
export async function connectLobstrMobile(): Promise<void> {
    const callback = encodeURIComponent(AJO_SCHEME);
    const url = `lobstr://auth?callback=${callback}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
        await Linking.openURL(url);
    } else {
        // Fallback to App Store/Play Store if LOBSTR is not installed
        await Linking.openURL('https://lobstr.co/download');
    }
}

/**
 * Parses the deep link URL returned by the wallet.
 */
export function parseWalletCallback(url: string): WalletConnectionResult | null {
    const parsed = Linking.parse(url);

    if (parsed.path === 'auth' && parsed.queryParams) {
        const { publicKey, network, signature } = parsed.queryParams;

        if (typeof publicKey === 'string' && typeof network === 'string') {
            return {
                publicKey,
                network,
                signature: typeof signature === 'string' ? signature : undefined,
            };
        }
    }

    return null;
}