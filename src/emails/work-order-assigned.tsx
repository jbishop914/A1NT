// Work Order Assignment Email — Sent to technician when assigned a work order
import * as React from 'react';
import { Text, Section, Row, Column, Button } from '@react-email/components';
import { BaseLayout } from './base-layout';

interface WorkOrderAssignedProps {
  companyName: string;
  accentColor?: string;
  technicianName: string;
  workOrderNumber: string;
  clientName: string;
  serviceAddress: string;
  scheduledDate?: string;
  scheduledTime?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
  specialInstructions?: string;
  viewLink?: string;
}

export function WorkOrderAssigned({
  companyName,
  accentColor = '#0a0a0a',
  technicianName,
  workOrderNumber,
  clientName,
  serviceAddress,
  scheduledDate,
  scheduledTime,
  priority,
  description,
  specialInstructions,
  viewLink,
}: WorkOrderAssignedProps) {
  const priorityColors = { LOW: '#6b7280', MEDIUM: '#2563eb', HIGH: '#ea580c', URGENT: '#dc2626' };

  return (
    <BaseLayout
      preview={`New work order #${workOrderNumber} assigned to you`}
      companyName={companyName}
      accentColor={accentColor}
    >
      <Text style={headingStyle}>New Work Order Assigned</Text>

      <Text style={greetingStyle}>Hi {technicianName},</Text>
      <Text style={bodyTextStyle}>
        A new work order has been assigned to you. Please review the details below.
      </Text>

      <Section style={detailsBoxStyle}>
        <Row style={detailRowStyle}>
          <Column style={{ width: '130px' }}><Text style={labelStyle}>Work Order #</Text></Column>
          <Column><Text style={{ ...valueStyle, fontFamily: 'monospace' }}>{workOrderNumber}</Text></Column>
        </Row>
        <Row style={detailRowStyle}>
          <Column style={{ width: '130px' }}><Text style={labelStyle}>Priority</Text></Column>
          <Column>
            <Text style={{ ...valueStyle, color: priorityColors[priority], fontWeight: 700 }}>
              {priority}
            </Text>
          </Column>
        </Row>
        <Row style={detailRowStyle}>
          <Column style={{ width: '130px' }}><Text style={labelStyle}>Client</Text></Column>
          <Column><Text style={valueStyle}>{clientName}</Text></Column>
        </Row>
        <Row style={detailRowStyle}>
          <Column style={{ width: '130px' }}><Text style={labelStyle}>Address</Text></Column>
          <Column><Text style={valueStyle}>{serviceAddress}</Text></Column>
        </Row>
        {scheduledDate && (
          <Row style={detailRowStyle}>
            <Column style={{ width: '130px' }}><Text style={labelStyle}>Scheduled</Text></Column>
            <Column><Text style={valueStyle}>{scheduledDate} {scheduledTime && `at ${scheduledTime}`}</Text></Column>
          </Row>
        )}
      </Section>

      <Section style={{ marginTop: '20px' }}>
        <Text style={sectionLabelStyle}>Description</Text>
        <Text style={bodyTextStyle}>{description}</Text>
      </Section>

      {specialInstructions && (
        <Section style={{ marginTop: '16px', backgroundColor: '#fffbeb', padding: '12px 16px', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
          <Text style={{ ...sectionLabelStyle, color: '#92400e' }}>Special Instructions</Text>
          <Text style={{ ...bodyTextStyle, color: '#78350f' }}>{specialInstructions}</Text>
        </Section>
      )}

      {viewLink && (
        <Section style={{ marginTop: '28px', textAlign: 'center' }}>
          <Button
            href={viewLink}
            style={{
              backgroundColor: accentColor,
              color: '#ffffff',
              padding: '12px 28px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            View Work Order
          </Button>
        </Section>
      )}
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
const sectionLabelStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' };

export default WorkOrderAssigned;
