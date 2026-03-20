// Estimate/Quote Email — Sent when an estimate is created for a customer
import * as React from 'react';
import { Text, Section, Row, Column, Button } from '@react-email/components';
import { BaseLayout } from './base-layout';

interface EstimateEmailProps {
  companyName: string;
  companyLogo?: string;
  accentColor?: string;
  customerName: string;
  estimateNumber: string;
  estimateDate: string;
  expiresDate?: string;
  lineItems: Array<{ description: string; amount: number }>;
  total: string;
  notes?: string;
  approveLink?: string;
}

export function EstimateEmail({
  companyName,
  companyLogo,
  accentColor = '#0a0a0a',
  customerName,
  estimateNumber,
  estimateDate,
  expiresDate,
  lineItems,
  total,
  notes,
  approveLink,
}: EstimateEmailProps) {
  return (
    <BaseLayout
      preview={`Estimate #${estimateNumber} from ${companyName} — ${total}`}
      companyName={companyName}
      companyLogo={companyLogo}
      accentColor={accentColor}
    >
      <Text style={headingStyle}>Estimate #{estimateNumber}</Text>

      <Text style={greetingStyle}>Hi {customerName},</Text>
      <Text style={bodyTextStyle}>
        Here's the estimate you requested. Please review the details below.
      </Text>

      <Section style={metaBoxStyle}>
        <Row>
          <Column style={{ width: '50%' }}>
            <Text style={metaLabelStyle}>Date</Text>
            <Text style={metaValueStyle}>{estimateDate}</Text>
          </Column>
          {expiresDate && (
            <Column style={{ width: '50%' }}>
              <Text style={metaLabelStyle}>Valid Until</Text>
              <Text style={metaValueStyle}>{expiresDate}</Text>
            </Column>
          )}
        </Row>
      </Section>

      <Section style={{ marginTop: '24px' }}>
        {lineItems.map((item, i) => (
          <Row key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Column style={{ width: '70%' }}>
              <Text style={{ fontSize: '14px', color: '#333', margin: 0 }}>{item.description}</Text>
            </Column>
            <Column style={{ width: '30%', textAlign: 'right' }}>
              <Text style={{ fontSize: '14px', color: '#333', fontWeight: 500, margin: 0 }}>
                ${item.amount.toFixed(2)}
              </Text>
            </Column>
          </Row>
        ))}

        <Row style={{ paddingTop: '16px', borderTop: '2px solid #0a0a0a', marginTop: '8px' }}>
          <Column style={{ width: '70%' }}>
            <Text style={{ fontSize: '16px', fontWeight: 700, color: '#0a0a0a', margin: 0 }}>Total</Text>
          </Column>
          <Column style={{ width: '30%', textAlign: 'right' }}>
            <Text style={{ fontSize: '16px', fontWeight: 700, color: '#0a0a0a', margin: 0 }}>{total}</Text>
          </Column>
        </Row>
      </Section>

      {notes && (
        <Text style={{ ...bodyTextStyle, marginTop: '16px', color: '#666', fontStyle: 'italic' }}>
          Note: {notes}
        </Text>
      )}

      {approveLink && (
        <Section style={{ marginTop: '32px', textAlign: 'center' }}>
          <Button
            href={approveLink}
            style={{
              backgroundColor: '#16a34a',
              color: '#ffffff',
              padding: '14px 32px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Approve Estimate
          </Button>
        </Section>
      )}

      <Text style={{ ...bodyTextStyle, marginTop: '24px' }}>
        If you have any questions about this estimate, please don't hesitate to reach out. We're happy to discuss the details.
      </Text>
    </BaseLayout>
  );
}

const headingStyle: React.CSSProperties = { fontSize: '22px', fontWeight: 700, color: '#0a0a0a', margin: '0 0 8px' };
const greetingStyle: React.CSSProperties = { fontSize: '15px', color: '#333', margin: '16px 0 4px' };
const bodyTextStyle: React.CSSProperties = { fontSize: '14px', color: '#555', lineHeight: '22px', margin: '4px 0' };
const metaBoxStyle: React.CSSProperties = { backgroundColor: '#f9f9fa', borderRadius: '6px', padding: '16px 20px', marginTop: '20px' };
const metaLabelStyle: React.CSSProperties = { fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' };
const metaValueStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 600, color: '#0a0a0a', margin: 0 };

export default EstimateEmail;
