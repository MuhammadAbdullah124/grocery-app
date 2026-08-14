export interface LegalContent {
  title: string;
  body: string[];
}

export const LEGAL_CONTENT: Record<string, LegalContent> = {
  help: {
    title: 'Help & Support',
    body: [
      'Need a hand? Here are a few quick answers:',
      'Scan Product — tap the green scan button on any screen to open the camera and scan a barcode.',
      'Cart not updating — pull down on the Home screen to refresh product data.',
      'Exit verification — show the QR code on your receipt to store staff. It updates automatically once verified.',
      'For anything else, please contact your store staff directly.',
    ],
  },
  terms: {
    title: 'Terms of Service',
    body: [
      'By using FreshCart self-checkout, you agree to scan every item you intend to purchase before leaving the store.',
      'Prices and discounts shown in the app are recalculated and confirmed at checkout. The store reserves the right to verify purchases before exit.',
      'Misuse of the self-checkout system may result in restricted access to this service.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'FreshCart stores your account details, cart, and order history to provide the self-checkout experience.',
      'Your digital receipts contain only an order identifier — no payment or personal details are embedded in QR codes.',
      'We do not sell your personal information to third parties.',
    ],
  },
};
