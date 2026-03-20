// Booking Confirmation Email — Sent when a booking is confirmed
import * as React from 'react';
import { Text, Section, Row, Column, Button } from '@react-email/components';
import { BaseLayout } from './base-layout';

interface BookingConfirmationProps {
  companyName: string;
  companyLogo?: string;
  accentColor?: string;
  customerName: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: string;
  serviceAddress: string;
  technicianName?: string;
  confirmationNumber: string;
  amountPaid?: string;
  notes?: string;
  rescheduleLink?: string;
  cancelLink?: string;
}

export function BookingConfirmation({
  companyName,
  companyLogo,
  accentColor = '#0a0a0a',
  customerName,
  serviceType,
  appointmentDate,
  appointmentTime,
  duration,
  serviceAddress,
  technicianName,
  confirmationNumber,
  amountPaid,
  notes,
  rescheduleLink,
  cancelLink,
}: BookingConfirmationProps) {
  return (
    <BaseLayout
      preview={`Your ${serviceType} appointment is confirmed for ${appointmentDate}`}
      companyName={companyName}
      companyLogo={companyLogo}
      accentColor={accentColor}
    >
      <Text style={headingStyle}>Booking Confirmed ✓</Text>

      <Text style={greetingStyle}>Hi {customerName},</Text>

      <Text style={bodyTextStyle}>
        Your appointment has been confirmed. Here are the details:
      </Text>

      <Section style={detailsBoxStyle}>
        <Row style={detailRowStyle}>
          <Column style={{ width: '120px' }}>
            <Text style={labelStyle}>Service</Text>
          </Column>
          <Column>
            <Text style={valueStyle}>{serviceType}</Text>
          </Column>
        </Row>
        <Row style={detailRowStyle}>
          <Column style={{ width: '120px' }}>
            <Text style={labelStyle}>Date</Text>
          </Column>
          <Column>
            <Text style={valueStyle}>{appointmentDate}</Text>
          </Column>
        </Row>
        <Row style={detailRowStyle}>
          <Column style={{ width: '120px' }}>
            <Text style={labelStyle}>Time</Text>
          </Column>
          <Column>
            <Text style={valueStyle}>{appointmentTime}</Text>
          </Column>
        </Row>
        <Row style={detailRowStyle}>
          <Column style={{ width: '120px' }}>
            <Text style={labelStyle}>Duration</Text>
          </Column>
          <Column>
            <Text style={valueStyle}>{duration}</Text>
          </Column>
        </Row>
        <Row style={detailRowStyle}>
          <Column style={{ width: '120px' }}>
            <Text style={labelStyle}>Address</Text>
          </Column>
          <Column>
            <Text style={valueStyle}>{serviceAddress}</Text>
          </Column>
        </Row>
        {technicianName && (
          <Row style={detailRowStyle}>
            <Column style={{ width: '120px' }}>
              <Text style={labelStyle}>Technician</Text>
            </Column>
            <Column>
              <Text style={valueStyle}>{technicianName}</Text>
            </Column>
          </Row>
        )}
        <Row style={detailRowStyle}>
          <Column style={{ width: '120px' }}>
            <Text style={labelStyle}>Confirmation #</Text>
          </Column>
          <Column>
            <Text style={{ ...valueStyle, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{confirmationNumber}</Text>
          </Column>
        </Row>
        {amountPaid && (
          <Row style={{ ...detailRowStyle, borderTop: '1px solid #e5e5e5', paddingTop: '12px', marginTop: '4px' }}>
            <Column style={{ width: '120px' }}>
              <Text style={labelStyle}>Amount Paid</Text>
            </Column>
            <Column>
              <Text style={{ ...valueStyle, fontWeight: 700, color: '#16a34a' }}>{amountPaid}</Text>
            </Column>
          </Row>
        )}
      </Section>

      {notes && (
        <Text style={{ ...bodyTextStyle, marginTop: '16px', color: '#666', fontStyle: 'italic' }}>
          Note: {notes}
        </Text>
      )}

      {/* Action buttons */}
      {(rescheduleLink || cancelLink) && (
        <Section style={{ marginTop: '28px', textAlign: 'center' }}>
          {rescheduleLink && (
            <Button
              href={rescheduleLink}
              style={{
                backgroundColor: accentColor,
                color: '#ffffff',
                padding: '12px 28px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                marginRight: '12px',
              }}
            >
              Reschedule
            </Button>
          )}
          {cancelLink && (
            <Button
              href={cancelLink}
              style={{
                backgroundColor: '#ffffff',
                color: '#666',
                padding: '12px 28px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
                border: '1px solid #d4d4d4',
              }}
            >
              Cancel Appointment
            </Button>
          )}
        </Section>
      )}

      <Text style={{ ...bodyTextStyle, marginTop: '24px' }}>
        If you have any questions, don't hesitate to reach out. We look forward to seeing you.
      </Text>
    </BaseLayout>
  );
}

const headingStyle: React.CSSProperties = { fontSize: '22px', fontWeight: 700, color: '#0a0a0a', margin: '0 0 8px' };
const greetingStyle: React.CSSProperties = { fontSize: '15px', color: '#333', margin: '16px 0 4px' };
const bodyTextStyle: React.CSSProperties = { fontSize: '14px', color: '#555', lineHeight: '22px', margin: '4px 0' };
const detailsBoxStyle: React.CSSProperties = { backgroundColor: '#f9f9fa', borderRadius: '6px', padding: '20px 24px', marginTop: '20px' };
const detailRowStyle: React.CSSProperties = { padding: '6px 0' };
const labelStyle: React.CSSProperties = { fontSize: '12px', color: '#888', margin: 0 };
const valueStyle: React.CSSProperties = { fontSize: '14px', color: '#0a0a0a', fontWeight: 500, margin: 0 };

export default BookingConfirmation;
