import type { Order } from '@/types';
import { APP_NAME } from '@/constants/config';
import { formatDateTime, formatPrice } from '@/utils/format';

const paymentLabels: Record<Order['paymentMethod'], string> = {
  cash: 'Cash',
  card: 'Card',
  credit: 'Credit (Khata)',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Renders a printable invoice for a completed sale. Passed straight to expo-print's printAsync. */
export function buildInvoiceHtml(order: Order): string {
  const storeName = escapeHtml(order.storeName || APP_NAME);

  const rows = order.items
    .map((item) => {
      const unitPrice = item.discountPrice ?? item.price;
      return `
        <tr>
          <td class="item-name">${escapeHtml(item.name)}</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatPrice(unitPrice)}</td>
          <td class="num">${formatPrice(item.subtotal)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(order.orderNumber)}</title>
        <style>
          @page { margin: 32px; }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, Helvetica, Arial, sans-serif;
            color: #111827;
            margin: 0;
            padding: 24px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #111827;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .store-name { font-size: 22px; font-weight: 700; margin: 0; }
          .invoice-label {
            font-size: 14px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #6b7280;
            margin: 4px 0 0;
          }
          .meta { text-align: right; font-size: 12px; color: #4b5563; }
          .meta div { margin-bottom: 2px; }
          .meta .invoice-number { font-weight: 700; color: #111827; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          thead th {
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            border-bottom: 1px solid #d1d5db;
            padding: 8px 4px;
          }
          thead th.num, td.num { text-align: right; }
          tbody td { padding: 10px 4px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
          td.item-name { font-weight: 500; }
          .totals { margin-top: 16px; width: 100%; }
          .totals-row {
            display: flex;
            justify-content: flex-end;
            gap: 24px;
            padding: 4px 0;
            font-size: 13px;
            color: #4b5563;
          }
          .totals-row .label { min-width: 100px; text-align: right; }
          .totals-row .value { min-width: 100px; text-align: right; }
          .totals-row.total {
            border-top: 2px solid #111827;
            margin-top: 6px;
            padding-top: 10px;
            font-size: 16px;
            font-weight: 700;
            color: #111827;
          }
          .discount .value { color: #129253; }
          .footer {
            margin-top: 36px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <p class="store-name">${storeName}</p>
            <p class="invoice-label">Invoice</p>
          </div>
          <div class="meta">
            <div class="invoice-number">${escapeHtml(order.orderNumber)}</div>
            <div>${formatDateTime(order.createdAt)}</div>
            <div>Payment: ${paymentLabels[order.paymentMethod]}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="num">Qty</th>
              <th class="num">Unit Price</th>
              <th class="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <div class="label">Subtotal</div>
            <div class="value">${formatPrice(order.subtotal)}</div>
          </div>
          ${
            order.discount > 0
              ? `<div class="totals-row discount">
                  <div class="label">Discount</div>
                  <div class="value">-${formatPrice(order.discount)}</div>
                </div>`
              : ''
          }
          <div class="totals-row total">
            <div class="label">Total</div>
            <div class="value">${formatPrice(order.total)}</div>
          </div>
          ${
            order.paymentMethod === 'cash' && order.cashReceived !== null
              ? `<div class="totals-row">
                  <div class="label">Cash Received</div>
                  <div class="value">${formatPrice(order.cashReceived)}</div>
                </div>
                <div class="totals-row">
                  <div class="label">Change Given</div>
                  <div class="value">${formatPrice(order.changeDue ?? 0)}</div>
                </div>`
              : ''
          }
        </div>

        <div class="footer">Thank you for shopping with ${storeName}.</div>
      </body>
    </html>
  `;
}
