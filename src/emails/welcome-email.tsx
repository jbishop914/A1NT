// Welcome Email — Sent to new clients when added to CRM
import * as React from 'react';
import { Text, Section, Button } from '@react-email/components';
import { BaseLayout } from './base-layout';

interface WelcomeEmailProps {
  companyName: string;
  companyLogo?: string;
  accentColor?: string;
  customerName: string;
  companyPhone?: string;
  companyEmail?: string;
  portalLink?: string;
  bookingLink?: string;
  customMessage?: string;
}

export function WelcomeEmail({
  companyName,
  companyLogo,
  accentColor = '#0a0a0a',
  customerName,
  companyPhone,
  companyEmail,
  portalLink,
  bookingLink,
  customMessage,
}: WelcomeEmailProps) {
  return (
    <BaseLayout
      preview={`Welcome to ${companyName} — we're glad to have you`}
      companyName={companyName}
      companyLogo={companyLogo}
      accentColor={accentColor}
    >
      <Text style={headingStyle}>Welcome to {companyName}</Text>

      <Text style={greetingStyle}>Hi {customerName},</Text>

      <Text style={bodyTextStyle}>
        {customMessage ||
          `Thank you for choosing ${companyName}. We're committed to providing you with exceptional service and look forward to working with you.`}
      </Text>

      <Section style={detailsBoxStyle}>
        <Text style={sectionTitleStyle}>How to reach us</Text>
        {companyPhone && (
          <Text style={contactLineStyle}>📞 {companyPhone}</Text>
        )}
        {companyEmail && (
          <Text style={contactLineStyle}>✉ {companyEmail}</Text>
        )}
      </Section>

      <Section style={{ marginTop: '28px', textAlign: 'center' }}>
        {bookingLink && (
          <Button
            href={bookingLink}
            style={{
              backgroundColor: accentColor,
              color: '#ffffff',
              padding: '14px 32px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              marginRight: '12px',
            }}
          >
            Book a Service
          </Button>
        )}
        {portalLink && (
          <Button
            href={portalLink}
            style={{
              backgroundColor: '#ffffff',
              color: '#333',
              padding: '14px 32px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
              border: '1px solid #d4d4d4',
            }}
          >
            Customer Portal
          </Button>
        )}
      </Section>

      <Text style={{ ...bodyTextStyle, marginTop: '24px' }}>
        If you ever need anything, we're just a call or click away.
      </Text>
    </BaseLayout>
  );
}

const headingStyle: React.CSSProperties = { fontSize: '22px', fontWeight: 700, color: '#0a0a0a', margin: '0 0 8px' };
const greetingStyle: React.CSSProperties = { fontSize: '15px', color: '#333', margin: '16px 0 4px' };
const bodyTextStyle: React.CSSProperties = { fontSize: '14px', color: '#555', lineHeight: '22px', margin: '4px 0' };
const detailsBoxStyle: React.CSSProperties = { backgroundColor: '#f9f9fa', borderRadius: '6px', padding: '20px 24px', marginTop: '20px' };
const sectionTitleStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#333', margin: '0 0 12px' };
const contactLineStyle: React.CSSProperties = { fontSize: '14px', color: '#555', margin: '6px 0' };

export default WelcomeEmail;
