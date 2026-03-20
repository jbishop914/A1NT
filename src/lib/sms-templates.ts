// System SMS Templates — Pre-built message templates for common business events
// These are seeded as system templates (isSystem: true, organizationId: null)
// Uses {{variable}} syntax for interpolation

export interface SystemSmsTemplate {
  name: string;
  slug: string;
  description: string;
  body: string;
  variables: Array<{ name: string; description: string; required: boolean }>;
}

export const SYSTEM_SMS_TEMPLATES: SystemSmsTemplate[] = [
  // ---- BOOKING ----
  {
    name: 'Booking Confirmation',
    slug: 'booking-confirmation',
    description: 'Sent when a booking is confirmed',
    body: '{{companyName}}: Your appointment is confirmed for {{date}} at {{time}}. Service: {{serviceName}}. Confirmation #{{confirmationCode}}. Reply HELP for assistance or call {{companyPhone}}.',
    variables: [
      { name: 'companyName', description: 'Business name', required: true },
      { name: 'date', description: 'Appointment date', required: true },
      { name: 'time', description: 'Appointment time', required: true },
      { name: 'serviceName', description: 'Service type', required: true },
      { name: 'confirmationCode', description: 'Booking confirmation code', required: true },
      { name: 'companyPhone', description: 'Business phone number', required: false },
    ],
  },
  {
    name: 'Appointment Reminder',
    slug: 'appointment-reminder',
    description: 'Sent 24h before a scheduled appointment',
    body: 'Reminder from {{companyName}}: Your {{serviceName}} appointment is tomorrow, {{date}} at {{time}}. Address: {{address}}. Need to reschedule? Call {{companyPhone}}.',
    variables: [
      { name: 'companyName', description: 'Business name', required: true },
      { name: 'serviceName', description: 'Service type', required: true },
      { name: 'date', description: 'Appointment date', required: true },
      { name: 'time', description: 'Appointment time', required: true },
      { name: 'address', description: 'Service address', required: false },
      { name: 'companyPhone', description: 'Business phone number', required: false },
    ],
  },

  // ---- INVOICE ----
  {
    name: 'Invoice Notification',
    slug: 'invoice-notification',
    description: 'Sent when a new invoice is ready',
    body: '{{companyName}}: Invoice #{{invoiceNumber}} for {{amount}} is ready. Due {{dueDate}}. Pay online: {{paymentLink}}',
    variables: [
      { name: 'companyName', description: 'Business name', required: true },
      { name: 'invoiceNumber', description: 'Invoice number', required: true },
      { name: 'amount', description: 'Total amount (e.g., $150.00)', required: true },
      { name: 'dueDate', description: 'Payment due date', required: true },
      { name: 'paymentLink', description: 'Online payment URL', required: false },
    ],
  },
  {
    name: 'Invoice Overdue',
    slug: 'invoice-overdue',
    description: 'Sent when an invoice is past due',
    body: '{{companyName}}: Invoice #{{invoiceNumber}} for {{amount}} is past due. Please make payment at your earliest convenience. Pay online: {{paymentLink}} or call {{companyPhone}}.',
    variables: [
      { name: 'companyName', description: 'Business name', required: true },
      { name: 'invoiceNumber', description: 'Invoice number', required: true },
      { name: 'amount', description: 'Total amount', required: true },
      { name: 'paymentLink', description: 'Online payment URL', required: false },
      { name: 'companyPhone', description: 'Business phone number', required: false },
    ],
  },

  // ---- WORK ORDER ----
  {
    name: 'Work Order Assigned',
    slug: 'work-order-assigned',
    description: 'Sent to technician when a work order is assigned',
    body: 'New WO assigned: {{title}} | Client: {{clientName}} | Priority: {{priority}} | Address: {{address}}. View details in your A1 dashboard.',
    variables: [
      { name: 'title', description: 'Work order title', required: true },
      { name: 'clientName', description: 'Client name', required: true },
      { name: 'priority', description: 'Priority level', required: true },
      { name: 'address', description: 'Service address', required: false },
    ],
  },
  {
    name: 'Work Order Completed',
    slug: 'work-order-completed',
    description: 'Sent to client when work is done',
    body: '{{companyName}}: Your work order "{{title}}" has been completed. If you have any questions, call us at {{companyPhone}}. Thank you for your business!',
    variables: [
      { name: 'companyName', description: 'Business name', required: true },
      { name: 'title', description: 'Work order title', required: true },
      { name: 'companyPhone', description: 'Business phone number', required: false },
    ],
  },

  // ---- PAYMENT ----
  {
    name: 'Payment Receipt',
    slug: 'payment-receipt',
    description: 'Sent when payment is received',
    body: '{{companyName}}: Payment of {{amount}} received. Transaction ID: {{transactionId}}. Thank you!',
    variables: [
      { name: 'companyName', description: 'Business name', required: true },
      { name: 'amount', description: 'Payment amount (e.g., $150.00)', required: true },
      { name: 'transactionId', description: 'Transaction/confirmation ID', required: true },
    ],
  },

  // ---- ESTIMATE ----
  {
    name: 'Estimate Ready',
    slug: 'estimate-ready',
    description: 'Sent when an estimate/quote is prepared',
    body: '{{companyName}}: Your estimate for {{amount}} is ready. View and approve: {{approveLink}}. Questions? Call {{companyPhone}}.',
    variables: [
      { name: 'companyName', description: 'Business name', required: true },
      { name: 'amount', description: 'Estimate total', required: true },
      { name: 'approveLink', description: 'Link to view/approve', required: false },
      { name: 'companyPhone', description: 'Business phone number', required: false },
    ],
  },

  // ---- WELCOME ----
  {
    name: 'Welcome',
    slug: 'welcome',
    description: 'Sent to new clients',
    body: 'Welcome to {{companyName}}! We\'re glad to have you. Save this number for future updates. Need anything? Call us at {{companyPhone}} or visit {{websiteUrl}}.',
    variables: [
      { name: 'companyName', description: 'Business name', required: true },
      { name: 'companyPhone', description: 'Business phone number', required: false },
      { name: 'websiteUrl', description: 'Business website URL', required: false },
    ],
  },
];

// Seed system templates into the database
export async function seedSystemSmsTemplates(db: any): Promise<number> {
  let seeded = 0;

  for (const tmpl of SYSTEM_SMS_TEMPLATES) {
    const existing = await db.smsTemplate.findFirst({
      where: { slug: tmpl.slug, isSystem: true },
    });

    if (!existing) {
      await db.smsTemplate.create({
        data: {
          name: tmpl.name,
          slug: tmpl.slug,
          description: tmpl.description,
          body: tmpl.body,
          variables: tmpl.variables,
          isSystem: true,
          organizationId: null,
        },
      });
      seeded++;
    }
  }

  return seeded;
}
