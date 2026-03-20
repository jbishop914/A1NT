// Invoice Email Template — Sent when invoice is created or as a reminder
import * as React from 'react';
import { Text, Link, Section, Row, Column, Button } from '@react-email/components';
import { BaseLayout } from './base-layout';

interface InvoiceEmailProps {
  companyName: string;
  companyLogo?: string;
  accentColor?: string;
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: Array<{ description: string; quantity: number; rate: number; amount: number }>;
  subtotal: string;
  tax?: string;
  total: string;
  paymentLink?: string;
  status?: 'new' | 'reminder' | 'overdue';
  notes?: string;
}

export function InvoiceEmail({
  companyName,
  companyLogo,
  accentColor = '#0a0a0a',
  customerName,
  invoiceNumber,
  invoiceDate,
  dueDate,
  lineItems,
  subtotal,
  tax,
  total,
  paymentLink,
  status = 'new',
  notes,
}: InvoiceEmailProps) {
  const statusMessages = {
    new: `Here's your invoice #${invoiceNumber}`,
    reminder: `Friendly reminder: Invoice #${invoiceNumber} is due soon`,
    overdue: `Invoice #${invoiceNumber} is past due`,
  };

  return (
    <BaseLayout
      preview={statusMessages[status]}
      companyName={companyName}
      companyLogo={companyLogo}
      accentColor={accentColor}
    >
      <Text style={headingStyle}>
        {status === 'overdue' ? '⚠ ' : ''}Invoice #{invoiceNumber}
      </Text>

      <Text style={greetingStyle}>Hi {customerName},</Text>

      <Text style={bodyTextStyle}>
        {status === 'new' && 'Please find your invoice details below.'}
        {status === 'reminder' && `This is a friendly reminder that your invoice is due on ${dueDate}.`}
        {status === 'overdue' && `Your invoice was due on ${dueDate}. Please arrange payment at your earliest convenience.`}
      </Text>

      {/* Invoice Meta */}
      <Section style={metaBoxStyle}>
        <Row>
          <Column style={{ width: '50%' }}>
            <Text style={metaLabelStyle}>Invoice Date</Text>
            <Text style={metaValueStyle}>{invoiceDate}</Text>
          </Column>
          <Column style={{ width: '50%' }}>
            <Text style={metaLabelStyle}>Due Date</Text>
            <Text style={{ ...metaValueStyle, color: status === 'overdue' ? '#dc2626' : '#0a0a0a' }}>
              {dueDate}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Line Items */}
      <Section style={{ marginTop: '24px' }}>
        {/* Header row */}
        <Row style={tableHeaderStyle}>
          <Column style={{ width: '50%' }}>
            <Text style={tableHeaderCellStyle}>Description</Text>
          </Column>
          <Column style={{ width: '15%', textAlign: 'center' }}>
            <Text style={tableHeaderCellStyle}>Qty</Text>
          </Column>
          <Column style={{ width: '15%', textAlign: 'right' }}>
            <Text style={tableHeaderCellStyle}>Rate</Text>
          </Column>
          <Column style={{ width: '20%', textAlign: 'right' }}>
            <Text style={tableHeaderCellStyle}>Amount</Text>
          </Column>
        </Row>

        {lineItems.map((item, i) => (
          <Row key={i} style={tableRowStyle}>
            <Column style={{ width: '50%' }}>
              <Text style={tableCellStyle}>{item.description}</Text>
            </Column>
            <Column style={{ width: '15%', textAlign: 'center' }}>
              <Text style={tableCellStyle}>{item.quantity}</Text>
            </Column>
            <Column style={{ width: '15%', textAlign: 'right' }}>
              <Text style={tableCellStyle}>${item.rate.toFixed(2)}</Text>
            </Column>
            <Column style={{ width: '20%', textAlign: 'right' }}>
              <Text style={tableCellStyle}>${item.amount.toFixed(2)}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* Totals */}
      <Section style={totalsBoxStyle}>
        <Row>
          <Column style={{ width: '60%' }} />
          <Column style={{ width: '40%' }}>
            <Row>
              <Column><Text style={totalLabelStyle}>Subtotal</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={totalValueStyle}>{subtotal}</Text></Column>
            </Row>
            {tax && (
              <Row>
                <Column><Text style={totalLabelStyle}>Tax</Text></Column>
                <Column style={{ textAlign: 'right' }}><Text style={totalValueStyle}>{tax}</Text></Column>
              </Row>
            )}
            <Row style={{ borderTop: '2px solid #0a0a0a', paddingTop: '8px', marginTop: '8px' }}>
              <Column><Text style={{ ...totalLabelStyle, fontWeight: 700, fontSize: '16px' }}>Total</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={{ ...totalValueStyle, fontWeight: 700, fontSize: '16px' }}>{total}</Text></Column>
            </Row>
          </Column>
        </Row>
      </Section>

      {/* Pay Now Button */}
      {paymentLink && (
        <Section style={{ textAlign: 'center', marginTop: '32px' }}>
          <Button
            href={paymentLink}
            style={{
              backgroundColor: accentColor,
              color: '#ffffff',
              padding: '14px 32px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Pay Now
          </Button>
        </Section>
      )}

      {notes && (
        <Section style={{ marginTop: '24px' }}>
          <Text style={{ ...bodyTextStyle, color: '#666', fontStyle: 'italic' }}>
            Note: {notes}
          </Text>
        </Section>
      )}

      <Text style={{ ...bodyTextStyle, marginTop: '24px' }}>
        Thank you for your business.
      </Text>
    </BaseLayout>
  );
}

// Styles
const headingStyle: React.CSSProperties = { fontSize: '22px', fontWeight: 700, color: '#0a0a0a', margin: '0 0 8px' };
const greetingStyle: React.CSSProperties = { fontSize: '15px', color: '#333', margin: '16px 0 4px' };
const bodyTextStyle: React.CSSProperties = { fontSize: '14px', color: '#555', lineHeight: '22px', margin: '4px 0' };
const metaBoxStyle: React.CSSProperties = { backgroundColor: '#f9f9fa', borderRadius: '6px', padding: '16px 20px', marginTop: '20px' };
const metaLabelStyle: React.CSSProperties = { fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' };
const metaValueStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 600, color: '#0a0a0a', margin: 0 };
const tableHeaderStyle: React.CSSProperties = { borderBottom: '1px solid #e5e5e5', paddingBottom: '8px' };
const tableHeaderCellStyle: React.CSSProperties = { fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 };
const tableRowStyle: React.CSSProperties = { borderBottom: '1px solid #f0f0f0' };
const tableCellStyle: React.CSSProperties = { fontSize: '13px', color: '#333', padding: '8px 0', margin: 0 };
const totalsBoxStyle: React.CSSProperties = { marginTop: '16px', paddingTop: '8px' };
const totalLabelStyle: React.CSSProperties = { fontSize: '13px', color: '#666', margin: '4px 0' };
const totalValueStyle: React.CSSProperties = { fontSize: '13px', color: '#333', margin: '4px 0' };

export default InvoiceEmail;
