// Payment Receipt Email — Sent when payment is received
import * as React from 'react';
import { Text, Section, Row, Column } from '@react-email/components';
import { BaseLayout } from './base-layout';

interface PaymentReceiptProps {
  companyName: string;
  companyLogo?: string;
  accentColor?: string;
  customerName: string;
  paymentAmount: string;
  paymentDate: string;
  paymentMethod?: string;
  invoiceNumber?: string;
  bookingNumber?: string;
  description: string;
  transactionId: string;
}

export function PaymentReceipt({
  companyName,
  companyLogo,
  accentColor = '#0a0a0a',
  customerName,
  paymentAmount,
  paymentDate,
  paymentMethod,
  invoiceNumber,
  bookingNumber,
  description,
  transactionId,
}: PaymentReceiptProps) {
  return (
    <BaseLayout
      preview={`Payment of ${paymentAmount} received — Thank you`}
      companyName={companyName}
      companyLogo={companyLogo}
      accentColor={accentColor}
    >
      <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Text style={{ fontSize: '40px', margin: '0 0 8px' }}>✓</Text>
        <Text style={headingStyle}>Payment Received</Text>
        <Text style={{ fontSize: '28px', fontWeight: 700, color: '#16a34a', margin: '8px 0' }}>
          {paymentAmount}
        </Text>
      </Section>

      <Text style={greetingStyle}>Hi {customerName},</Text>
      <Text style={bodyTextStyle}>
        We've received your payment. Here's your receipt for your records.
      </Text>

      <Section style={detailsBoxStyle}>
        <Row style={detailRowStyle}>
          <Column style={{ width: '140px' }}><Text style={labelStyle}>Amount</Text></Column>
          <Column><Text style={valueStyle}>{paymentAmount}</Text></Column>
        </Row>
        <Row style={detailRowStyle}>
          <Column style={{ width: '140px' }}><Text style={labelStyle}>Date</Text></Column>
          <Column><Text style={valueStyle}>{paymentDate}</Text></Column>
        </Row>
        {paymentMethod && (
          <Row style={detailRowStyle}>
            <Column style={{ width: '140px' }}><Text style={labelStyle}>Payment Method</Text></Column>
            <Column><Text style={valueStyle}>{paymentMethod}</Text></Column>
          </Row>
        )}
        <Row style={detailRowStyle}>
          <Column style={{ width: '140px' }}><Text style={labelStyle}>Description</Text></Column>
          <Column><Text style={valueStyle}>{description}</Text></Column>
        </Row>
        {invoiceNumber && (
          <Row style={detailRowStyle}>
            <Column style={{ width: '140px' }}><Text style={labelStyle}>Invoice #</Text></Column>
            <Column><Text style={{ ...valueStyle, fontFamily: 'monospace' }}>{invoiceNumber}</Text></Column>
          </Row>
        )}
        {bookingNumber && (
          <Row style={detailRowStyle}>
            <Column style={{ width: '140px' }}><Text style={labelStyle}>Booking #</Text></Column>
            <Column><Text style={{ ...valueStyle, fontFamily: 'monospace' }}>{bookingNumber}</Text></Column>
          </Row>
        )}
        <Row style={{ ...detailRowStyle, borderTop: '1px solid #e5e5e5', paddingTop: '12px', marginTop: '4px' }}>
          <Column style={{ width: '140px' }}><Text style={labelStyle}>Transaction ID</Text></Column>
          <Column><Text style={{ ...valueStyle, fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{transactionId}</Text></Column>
        </Row>
      </Section>

      <Text style={{ ...bodyTextStyle, marginTop: '24px' }}>
        Thank you for your payment. If you have any questions about this transaction, please don't hesitate to contact us.
      </Text>
    </BaseLayout>
  );
}

const headingStyle: React.CSSProperties = { fontSize: '22px', fontWeight: 700, color: '#0a0a0a', margin: 0 };
const greetingStyle: React.CSSProperties = { fontSize: '15px', color: '#333', margin: '16px 0 4px' };
const bodyTextStyle: React.CSSProperties = { fontSize: '14px', color: '#555', lineHeight: '22px', margin: '4px 0' };
const detailsBoxStyle: React.CSSProperties = { backgroundColor: '#f9f9fa', borderRadius: '6px', padding: '20px 24px', marginTop: '20px' };
const detailRowStyle: React.CSSProperties = { padding: '6px 0' };
const labelStyle: React.CSSProperties = { fontSize: '12px', color: '#888', margin: 0 };
const valueStyle: React.CSSProperties = { fontSize: '14px', color: '#0a0a0a', fontWeight: 500, margin: 0 };

export default PaymentReceipt;
