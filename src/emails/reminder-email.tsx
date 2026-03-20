// Service Reminder Email — Annual maintenance reminders, follow-ups
import * as React from 'react';
import { Text, Section, Button } from '@react-email/components';
import { BaseLayout } from './base-layout';

interface ReminderEmailProps {
  companyName: string;
  companyLogo?: string;
  accentColor?: string;
  customerName: string;
  reminderType: 'annual_service' | 'follow_up' | 'appointment_reminder';
  serviceType?: string;
  lastServiceDate?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  bookingLink?: string;
  customMessage?: string;
}

export function ReminderEmail({
  companyName,
  companyLogo,
  accentColor = '#0a0a0a',
  customerName,
  reminderType,
  serviceType,
  lastServiceDate,
  appointmentDate,
  appointmentTime,
  bookingLink,
  customMessage,
}: ReminderEmailProps) {
  const titles: Record<string, string> = {
    annual_service: 'Time for Your Annual Service',
    follow_up: 'How Did We Do?',
    appointment_reminder: 'Appointment Reminder',
  };

  const previews: Record<string, string> = {
    annual_service: `It's time for your annual ${serviceType || 'maintenance'} service`,
    follow_up: 'We hope everything went well with your recent service',
    appointment_reminder: `Reminder: Your appointment is ${appointmentDate ? `on ${appointmentDate}` : 'coming up'}`,
  };

  return (
    <BaseLayout
      preview={previews[reminderType]}
      companyName={companyName}
      companyLogo={companyLogo}
      accentColor={accentColor}
      unsubscribeUrl={`${process.env.NEXT_PUBLIC_APP_URL || ''}/unsubscribe`}
    >
      <Text style={headingStyle}>{titles[reminderType]}</Text>

      <Text style={greetingStyle}>Hi {customerName},</Text>

      {reminderType === 'annual_service' && (
        <>
          <Text style={bodyTextStyle}>
            {customMessage ||
              `It's been about a year since your last ${serviceType || 'maintenance'} service${lastServiceDate ? ` on ${lastServiceDate}` : ''}. Regular maintenance helps prevent costly repairs and keeps everything running smoothly.`}
          </Text>
          <Text style={bodyTextStyle}>
            We recommend scheduling your annual service soon to stay on track.
          </Text>
        </>
      )}

      {reminderType === 'follow_up' && (
        <>
          <Text style={bodyTextStyle}>
            {customMessage ||
              `We recently completed a ${serviceType || 'service call'} for you${lastServiceDate ? ` on ${lastServiceDate}` : ''}. We hope everything met your expectations.`}
          </Text>
          <Text style={bodyTextStyle}>
            Your feedback helps us improve. If you experienced any issues or have questions, please don't hesitate to reach out.
          </Text>
        </>
      )}

      {reminderType === 'appointment_reminder' && (
        <>
          <Text style={bodyTextStyle}>
            {customMessage || 'This is a friendly reminder about your upcoming appointment:'}
          </Text>
          {appointmentDate && (
            <Section style={detailsBoxStyle}>
              <Text style={{ fontSize: '16px', fontWeight: 600, color: '#0a0a0a', margin: '0 0 4px', textAlign: 'center' }}>
                {appointmentDate}
              </Text>
              {appointmentTime && (
                <Text style={{ fontSize: '14px', color: '#555', margin: 0, textAlign: 'center' }}>
                  at {appointmentTime}
                </Text>
              )}
              {serviceType && (
                <Text style={{ fontSize: '13px', color: '#888', margin: '8px 0 0', textAlign: 'center' }}>
                  {serviceType}
                </Text>
              )}
            </Section>
          )}
        </>
      )}

      {bookingLink && (
        <Section style={{ marginTop: '28px', textAlign: 'center' }}>
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
            }}
          >
            {reminderType === 'annual_service' ? 'Schedule Now' : reminderType === 'follow_up' ? 'Book Again' : 'View Appointment'}
          </Button>
        </Section>
      )}

      <Text style={{ ...bodyTextStyle, marginTop: '24px' }}>
        Thank you for being a valued customer.
      </Text>
    </BaseLayout>
  );
}

const headingStyle: React.CSSProperties = { fontSize: '22px', fontWeight: 700, color: '#0a0a0a', margin: '0 0 8px' };
const greetingStyle: React.CSSProperties = { fontSize: '15px', color: '#333', margin: '16px 0 4px' };
const bodyTextStyle: React.CSSProperties = { fontSize: '14px', color: '#555', lineHeight: '22px', margin: '4px 0' };
const detailsBoxStyle: React.CSSProperties = { backgroundColor: '#f9f9fa', borderRadius: '6px', padding: '20px 24px', marginTop: '20px' };

export default ReminderEmail;
