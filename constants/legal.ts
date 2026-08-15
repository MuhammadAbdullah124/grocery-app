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
      'Receipts — every completed sale generates a digital receipt that you can print as an invoice for the customer.',
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
      'FreshCart stores your staff account details (name, email or phone, and role) and sales history to provide the point-of-sale experience.',
      "Camera access is used only to scan product barcodes and QR codes at checkout and when adding inventory — FreshCart does not store or transmit camera images.",
      'Receipts can be printed as an invoice; no data is embedded in a scannable code on the receipt.',
      'We do not sell your personal information to third parties.',
    ],
  },
};
