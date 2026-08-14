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
      'Current sale not updating — pull down on the Home screen to refresh product data.',
      'Receipts — every completed sale generates a digital receipt with a QR code you can show or send to the customer.',
      'For anything else, please contact FreshCart support.',
    ],
  },
  terms: {
    title: 'Terms of Service',
    body: [
      'By using FreshCart, store staff agree to accurately scan and charge for every item sold.',
      'Prices and discounts shown in the app are recalculated and confirmed at checkout to ensure accurate sale totals.',
      'Misuse of the point-of-sale system may result in restricted access to this service.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'FreshCart stores your staff account details and sales history to provide the point-of-sale experience.',
      'Digital receipts contain only an order identifier — no payment or personal details are embedded in QR codes.',
      'We do not sell your personal information to third parties.',
    ],
  },
};
