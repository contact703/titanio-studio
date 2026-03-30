import { Linking } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://www.gospia.app';

export interface PixPaymentResponse {
  status: string;
  payment_id: string;
  qr_code: string;
  qr_code_base64: string;
}

export interface StripePaymentResponse {
  url: string;
}

/**
 * Inicia checkout via Stripe (Cartão de Crédito)
 * Redireciona para página de pagamento do Stripe
 */
export async function startStripeCheckout(userId: string, email: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/payment/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        planId: 'monthly',
      }),
    });

    const data: StripePaymentResponse = await response.json();

    if (data.url) {
      const canOpen = await Linking.canOpenURL(data.url);
      if (canOpen) {
        await Linking.openURL(data.url);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return false;
  }
}

/**
 * Gera código PIX para pagamento via Mercado Pago
 * Retorna QR code e código copia-cola
 */
export async function generatePixPayment(
  userId: string,
  email: string,
  amount: number = 19.90
): Promise<PixPaymentResponse | null> {
  try {
    const response = await fetch(`${API_URL}/api/payment/pix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        amount,
        description: 'Assinatura Gospia Pro (Mensal)',
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar PIX');
    }

    const data: PixPaymentResponse = await response.json();
    return data;
  } catch (error) {
    console.error('PIX payment error:', error);
    return null;
  }
}

/**
 * Abre URL de pagamento externo
 */
export async function openPaymentUrl(url: string): Promise<boolean> {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error opening URL:', error);
    return false;
  }
}
