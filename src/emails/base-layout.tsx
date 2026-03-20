// Shared email layout — Clean, professional A1NT-branded wrapper
// Used by all email templates for consistent branding
import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Img,
  Font,
  Preview,
} from '@react-email/components';

interface BaseLayoutProps {
  preview: string;
  companyName?: string;
  companyLogo?: string;
  accentColor?: string;
  children: React.ReactNode;
  footerText?: string;
  unsubscribeUrl?: string;
}

export function BaseLayout({
  preview,
  companyName = 'A1 Integrations',
  companyLogo,
  accentColor = '#0a0a0a',
  children,
  footerText,
  unsubscribeUrl,
}: BaseLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            {companyLogo ? (
              <Img src={companyLogo} alt={companyName} width={140} height={40} />
            ) : (
              <Text style={{ ...companyNameStyle, color: accentColor }}>{companyName}</Text>
            )}
          </Section>

          {/* Content */}
          <Section style={contentStyle}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hrStyle} />
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              {footerText || `Sent by ${companyName} via A1 Integrations`}
            </Text>
            {unsubscribeUrl && (
              <Text style={footerTextStyle}>
                <Link href={unsubscribeUrl} style={unsubLinkStyle}>
                  Unsubscribe
                </Link>
                {' from these emails'}
              </Text>
            )}
            <Text style={{ ...footerTextStyle, color: '#b0b0b0', fontSize: '11px' }}>
              Powered by{' '}
              <Link href="https://a1integrations.com" style={{ color: '#b0b0b0' }}>
                A1 Integrations
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const bodyStyle: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  fontFamily: "'Inter', Arial, sans-serif",
  margin: 0,
  padding: 0,
};

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
  marginTop: '32px',
  marginBottom: '32px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
};

const headerStyle: React.CSSProperties = {
  padding: '32px 40px 24px',
  borderBottom: '1px solid #e5e5e5',
};

const companyNameStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  margin: 0,
  letterSpacing: '-0.02em',
};

const contentStyle: React.CSSProperties = {
  padding: '32px 40px',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#e5e5e5',
  margin: 0,
};

const footerStyle: React.CSSProperties = {
  padding: '24px 40px',
};

const footerTextStyle: React.CSSProperties = {
  color: '#888',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '4px 0',
};

const unsubLinkStyle: React.CSSProperties = {
  color: '#888',
  textDecoration: 'underline',
};
