/**
 * Static Site Generator for A1NT Website Builder
 *
 * Takes a ClientWebsite config and produces a complete, self-contained HTML page.
 * The output is a single HTML file with embedded CSS — no external dependencies
 * except Google Fonts. Clean, responsive, professional.
 */

import {
  type ClientWebsite,
  type WebsiteSection,
  type SectionType,
  websiteTemplates,
} from "./sample-data-p3";

// ── Section content defaults (would come from DB in production) ──

interface SectionContent {
  hero: { headline: string; subheadline: string; ctaText: string; ctaHref: string };
  services: { items: { name: string; description: string; icon: string }[] };
  about: { title: string; description: string; values: string[] };
  team: { members: { name: string; role: string; initials: string }[] };
  reviews: { items: { author: string; rating: number; text: string }[] };
  contact: { phone: string; email: string; address: string; hours: string };
  map: { address: string };
  promotions: { items: { title: string; description: string; badge: string }[] };
  gallery: { images: { alt: string; placeholder: string }[] };
  faq: { items: { question: string; answer: string }[] };
  booking: { orgId: string; theme: string };
}

function getDefaultContent(clientName: string): SectionContent {
  return {
    hero: {
      headline: clientName,
      subheadline: "Professional service you can trust. Licensed, insured, and committed to excellence.",
      ctaText: "Get a Free Quote",
      ctaHref: "#contact",
    },
    services: {
      items: [
        { name: "Emergency Service", description: "24/7 availability for urgent situations. Fast response times guaranteed.", icon: "⚡" },
        { name: "Installation", description: "Professional installation with quality materials and expert craftsmanship.", icon: "🔧" },
        { name: "Repair & Maintenance", description: "Keep your systems running efficiently with regular maintenance and prompt repairs.", icon: "🛠️" },
        { name: "Inspection", description: "Thorough inspections to identify issues before they become costly problems.", icon: "🔍" },
        { name: "Consultation", description: "Expert advice on upgrades, energy efficiency, and system planning.", icon: "💬" },
        { name: "Commercial Services", description: "Tailored solutions for businesses of all sizes. Contract options available.", icon: "🏢" },
      ],
    },
    about: {
      title: `About ${clientName}`,
      description: `${clientName} has been serving the community with dedication and expertise. Our team of licensed professionals is committed to delivering exceptional service on every job. We treat your home or business like our own.`,
      values: ["Licensed & Insured", "Satisfaction Guaranteed", "Transparent Pricing", "On-Time Arrival"],
    },
    team: {
      members: [
        { name: "Mike Rodriguez", role: "Owner & Lead Technician", initials: "MR" },
        { name: "Sarah Chen", role: "Operations Manager", initials: "SC" },
        { name: "Dave Sullivan", role: "Senior Technician", initials: "DS" },
        { name: "Lisa Kim", role: "Service Coordinator", initials: "LK" },
      ],
    },
    reviews: {
      items: [
        { author: "James T.", rating: 5, text: "Excellent work! They showed up on time, explained everything clearly, and the price was fair. Will definitely use them again." },
        { author: "Patricia M.", rating: 5, text: "Professional from start to finish. Clean work, respectful of our home. Highly recommend to anyone looking for quality service." },
        { author: "Robert K.", rating: 5, text: "Called for an emergency and they were here within the hour. Fixed the problem quickly and the cost was reasonable. Great company." },
      ],
    },
    contact: {
      phone: "(203) 555-0180",
      email: `info@${clientName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      address: "123 Main Street, Suite 100, Hartford, CT 06103",
      hours: "Mon–Fri: 7am–6pm | Sat: 8am–2pm | 24/7 Emergency",
    },
    map: {
      address: "123 Main Street, Hartford, CT 06103",
    },
    promotions: {
      items: [
        { title: "Spring Special", description: "15% off all maintenance services. Book by March 31st.", badge: "Limited Time" },
        { title: "Referral Bonus", description: "Refer a friend and both receive $50 off your next service.", badge: "Ongoing" },
      ],
    },
    gallery: {
      images: [
        { alt: "Completed project 1", placeholder: "Professional installation — residential" },
        { alt: "Completed project 2", placeholder: "Commercial system upgrade" },
        { alt: "Completed project 3", placeholder: "Emergency repair — same day" },
        { alt: "Completed project 4", placeholder: "New construction rough-in" },
      ],
    },
    faq: {
      items: [
        { question: "Do you offer free estimates?", answer: "Yes! We provide free on-site estimates for all services. Contact us to schedule." },
        { question: "Are you licensed and insured?", answer: "Absolutely. We are fully licensed, bonded, and insured for your protection." },
        { question: "What areas do you serve?", answer: "We serve the greater Hartford area and surrounding communities within a 30-mile radius." },
        { question: "Do you offer emergency services?", answer: "Yes, we offer 24/7 emergency service. Call our main number anytime for urgent situations." },
      ],
    },
    booking: {
      orgId: "demo-org",
      theme: "clean-light",
    },
  };
}

// ── CSS Generation ──

function generateCSS(primaryColor: string, accentColor: string, fontFamily: string): string {
  return `
    :root {
      --primary: ${primaryColor};
      --accent: ${accentColor};
      --bg: #ffffff;
      --bg-alt: #f8f9fa;
      --text: #1a1a2e;
      --text-muted: #6b7280;
      --border: #e5e7eb;
      --radius: 8px;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    html { scroll-behavior: smooth; }

    body {
      font-family: '${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: var(--text);
      background: var(--bg);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Navigation ── */
    nav {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 0 2rem;
    }
    .nav-inner {
      max-width: 1120px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
    }
    .nav-brand {
      font-weight: 700;
      font-size: 1.125rem;
      color: var(--primary);
      text-decoration: none;
    }
    .nav-links { display: flex; gap: 1.5rem; list-style: none; }
    .nav-links a {
      text-decoration: none;
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--text); }
    .nav-cta {
      background: var(--accent);
      color: #fff;
      padding: 0.5rem 1.25rem;
      border-radius: var(--radius);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    .nav-cta:hover { opacity: 0.9; }

    /* ── Sections ── */
    section { padding: 5rem 2rem; }
    section:nth-child(even) { background: var(--bg-alt); }
    .section-inner {
      max-width: 1120px;
      margin: 0 auto;
    }
    .section-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin-bottom: 0.5rem;
    }
    .section-title {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 1rem;
      color: var(--primary);
    }
    .section-subtitle {
      font-size: 1.0625rem;
      color: var(--text-muted);
      max-width: 640px;
      line-height: 1.7;
    }

    /* ── Hero ── */
    .hero {
      padding: 6rem 2rem;
      text-align: center;
      background: linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, var(--accent)) 100%);
      color: #fff;
    }
    .hero .section-inner { max-width: 720px; }
    .hero h1 {
      font-size: 2.75rem;
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 1.25rem;
    }
    .hero p {
      font-size: 1.125rem;
      opacity: 0.88;
      margin-bottom: 2rem;
      line-height: 1.7;
    }
    .hero-cta {
      display: inline-block;
      background: var(--accent);
      color: #fff;
      padding: 0.875rem 2rem;
      border-radius: var(--radius);
      font-weight: 700;
      font-size: 1rem;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .hero-cta:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }

    /* ── Services Grid ── */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 2.5rem;
    }
    .service-card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.75rem;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .service-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      transform: translateY(-2px);
    }
    .service-icon { font-size: 1.75rem; margin-bottom: 0.75rem; }
    .service-card h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .service-card p {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.6;
    }

    /* ── Team ── */
    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-top: 2.5rem;
    }
    .team-card { text-align: center; }
    .team-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
      margin: 0 auto 1rem;
    }
    .team-card h3 { font-size: 1rem; font-weight: 600; }
    .team-card p { font-size: 0.875rem; color: var(--text-muted); }

    /* ── Reviews ── */
    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 2.5rem;
    }
    .review-card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.75rem;
    }
    .review-stars { color: #f59e0b; margin-bottom: 0.75rem; font-size: 1rem; }
    .review-card blockquote {
      font-size: 0.9375rem;
      line-height: 1.7;
      color: var(--text);
      margin-bottom: 1rem;
      font-style: italic;
    }
    .review-card cite {
      font-style: normal;
      font-weight: 600;
      font-size: 0.875rem;
    }

    /* ── Contact ── */
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      margin-top: 2.5rem;
    }
    .contact-info { display: flex; flex-direction: column; gap: 1.5rem; }
    .contact-item h3 {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }
    .contact-item p {
      font-size: 1rem;
      font-weight: 500;
    }
    .contact-item a {
      color: var(--accent);
      text-decoration: none;
    }
    .contact-item a:hover { text-decoration: underline; }
    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .contact-form input,
    .contact-form textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-family: inherit;
      font-size: 0.9375rem;
      transition: border-color 0.2s;
      background: var(--bg);
    }
    .contact-form input:focus,
    .contact-form textarea:focus {
      outline: none;
      border-color: var(--accent);
    }
    .contact-form textarea { min-height: 120px; resize: vertical; }
    .contact-form button {
      background: var(--accent);
      color: #fff;
      border: none;
      padding: 0.875rem;
      border-radius: var(--radius);
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .contact-form button:hover { opacity: 0.9; }

    /* ── Promotions ── */
    .promo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 2.5rem;
    }
    .promo-card {
      background: linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 80%, var(--accent)) 100%);
      color: #fff;
      border-radius: var(--radius);
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }
    .promo-badge {
      display: inline-block;
      background: var(--accent);
      padding: 0.25rem 0.75rem;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    .promo-card h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
    .promo-card p { opacity: 0.88; font-size: 0.9375rem; }

    /* ── Gallery ── */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-top: 2.5rem;
    }
    .gallery-item {
      aspect-ratio: 4/3;
      background: var(--border);
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      color: var(--text-muted);
      transition: transform 0.2s;
    }
    .gallery-item:hover { transform: scale(1.02); }

    /* ── FAQ ── */
    .faq-list {
      max-width: 720px;
      margin: 2.5rem auto 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .faq-item {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .faq-question {
      width: 100%;
      text-align: left;
      padding: 1.25rem 1.5rem;
      background: var(--bg);
      border: none;
      font-family: inherit;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--text);
    }
    .faq-question:hover { background: var(--bg-alt); }
    .faq-question::after { content: '+'; font-size: 1.25rem; color: var(--accent); }
    .faq-answer {
      padding: 0 1.5rem 1.25rem;
      font-size: 0.9375rem;
      color: var(--text-muted);
      line-height: 1.7;
    }

    /* ── About values ── */
    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }
    .value-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
      font-size: 0.9375rem;
    }
    .value-check {
      width: 24px;
      height: 24px;
      background: color-mix(in srgb, var(--accent) 15%, transparent);
      color: var(--accent);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      flex-shrink: 0;
    }

    /* ── Footer ── */
    footer {
      background: var(--primary);
      color: rgba(255,255,255,0.7);
      padding: 3rem 2rem;
      text-align: center;
    }
    footer .footer-brand {
      font-weight: 700;
      font-size: 1.125rem;
      color: #fff;
      margin-bottom: 0.5rem;
    }
    footer p { font-size: 0.875rem; margin-bottom: 0.25rem; }
    footer a { color: rgba(255,255,255,0.9); text-decoration: none; }
    footer a:hover { text-decoration: underline; }
    .footer-powered {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
      font-size: 0.75rem;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .hero h1 { font-size: 2rem; }
      .hero { padding: 4rem 1.5rem; }
      section { padding: 3.5rem 1.5rem; }
      .contact-grid { grid-template-columns: 1fr; gap: 2rem; }
      .nav-links { display: none; }
      .section-title { font-size: 1.5rem; }
    }
  `;
}

// ── Section HTML Generators ──

function renderHero(content: SectionContent["hero"], accentColor: string): string {
  return `
    <section class="hero" id="home">
      <div class="section-inner">
        <h1>${escapeHtml(content.headline)}</h1>
        <p>${escapeHtml(content.subheadline)}</p>
        <a href="${escapeHtml(content.ctaHref)}" class="hero-cta">${escapeHtml(content.ctaText)}</a>
      </div>
    </section>`;
}

function renderServices(content: SectionContent["services"]): string {
  const cards = content.items
    .map(
      (s) => `
      <div class="service-card">
        <div class="service-icon">${s.icon}</div>
        <h3>${escapeHtml(s.name)}</h3>
        <p>${escapeHtml(s.description)}</p>
      </div>`
    )
    .join("");

  return `
    <section id="services">
      <div class="section-inner">
        <div class="section-label">What We Do</div>
        <h2 class="section-title">Our Services</h2>
        <p class="section-subtitle">Expert solutions tailored to your needs — from routine maintenance to complex installations.</p>
        <div class="services-grid">${cards}</div>
      </div>
    </section>`;
}

function renderAbout(content: SectionContent["about"]): string {
  const values = content.values
    .map(
      (v) => `
      <div class="value-item">
        <div class="value-check">✓</div>
        <span>${escapeHtml(v)}</span>
      </div>`
    )
    .join("");

  return `
    <section id="about">
      <div class="section-inner">
        <div class="section-label">Who We Are</div>
        <h2 class="section-title">${escapeHtml(content.title)}</h2>
        <p class="section-subtitle">${escapeHtml(content.description)}</p>
        <div class="values-grid">${values}</div>
      </div>
    </section>`;
}

function renderTeam(content: SectionContent["team"]): string {
  const members = content.members
    .map(
      (m) => `
      <div class="team-card">
        <div class="team-avatar">${escapeHtml(m.initials)}</div>
        <h3>${escapeHtml(m.name)}</h3>
        <p>${escapeHtml(m.role)}</p>
      </div>`
    )
    .join("");

  return `
    <section id="team">
      <div class="section-inner">
        <div class="section-label">Our People</div>
        <h2 class="section-title">Meet the Team</h2>
        <p class="section-subtitle">Skilled professionals dedicated to delivering exceptional service.</p>
        <div class="team-grid">${members}</div>
      </div>
    </section>`;
}

function renderReviews(content: SectionContent["reviews"]): string {
  const reviews = content.items
    .map(
      (r) => `
      <div class="review-card">
        <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
        <blockquote>"${escapeHtml(r.text)}"</blockquote>
        <cite>— ${escapeHtml(r.author)}</cite>
      </div>`
    )
    .join("");

  return `
    <section id="reviews">
      <div class="section-inner">
        <div class="section-label">Testimonials</div>
        <h2 class="section-title">What Our Clients Say</h2>
        <div class="reviews-grid">${reviews}</div>
      </div>
    </section>`;
}

function renderContact(content: SectionContent["contact"]): string {
  return `
    <section id="contact">
      <div class="section-inner">
        <div class="section-label">Get in Touch</div>
        <h2 class="section-title">Contact Us</h2>
        <p class="section-subtitle">Ready to get started? Reach out for a free estimate or to schedule service.</p>
        <div class="contact-grid">
          <div class="contact-info">
            <div class="contact-item">
              <h3>Phone</h3>
              <p><a href="tel:${escapeHtml(content.phone.replace(/[^+\d]/g, ""))}">${escapeHtml(content.phone)}</a></p>
            </div>
            <div class="contact-item">
              <h3>Email</h3>
              <p><a href="mailto:${escapeHtml(content.email)}">${escapeHtml(content.email)}</a></p>
            </div>
            <div class="contact-item">
              <h3>Address</h3>
              <p>${escapeHtml(content.address)}</p>
            </div>
            <div class="contact-item">
              <h3>Hours</h3>
              <p>${escapeHtml(content.hours)}</p>
            </div>
          </div>
          <form class="contact-form" onsubmit="event.preventDefault(); alert('Message sent! We will get back to you shortly.');">
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Email Address" required />
            <input type="tel" placeholder="Phone Number" />
            <textarea placeholder="How can we help?"></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </section>`;
}

function renderMap(content: SectionContent["map"]): string {
  return `
    <section id="service-area" style="padding: 0;">
      <div style="background: var(--bg-alt); padding: 3rem 2rem 1rem;">
        <div class="section-inner">
          <div class="section-label">Location</div>
          <h2 class="section-title">Service Area</h2>
          <p class="section-subtitle">${escapeHtml(content.address)}</p>
        </div>
      </div>
      <div style="height: 300px; background: var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.875rem;">
        Map — Connect Google Maps or Mapbox to display your service area
      </div>
    </section>`;
}

function renderPromotions(content: SectionContent["promotions"]): string {
  const promos = content.items
    .map(
      (p) => `
      <div class="promo-card">
        <span class="promo-badge">${escapeHtml(p.badge)}</span>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.description)}</p>
      </div>`
    )
    .join("");

  return `
    <section id="promotions">
      <div class="section-inner">
        <div class="section-label">Special Offers</div>
        <h2 class="section-title">Current Promotions</h2>
        <div class="promo-grid">${promos}</div>
      </div>
    </section>`;
}

function renderGallery(content: SectionContent["gallery"]): string {
  const items = content.images
    .map(
      (img) => `
      <div class="gallery-item">${escapeHtml(img.placeholder)}</div>`
    )
    .join("");

  return `
    <section id="gallery">
      <div class="section-inner">
        <div class="section-label">Our Work</div>
        <h2 class="section-title">Project Gallery</h2>
        <p class="section-subtitle">See examples of our professional work across residential and commercial projects.</p>
        <div class="gallery-grid">${items}</div>
      </div>
    </section>`;
}

function renderBooking(content: SectionContent["booking"]): string {
  return `
    <section id="booking" style="background: var(--bg-alt);">
      <div class="section-inner" style="text-align: center;">
        <div class="section-label">Online Booking</div>
        <h2 class="section-title">Schedule an Appointment</h2>
        <p class="section-subtitle" style="margin: 0 auto 2.5rem;">Book your appointment online — fast, easy, and available 24/7.</p>
        <div style="display: flex; justify-content: center;">
          <div id="a1nt-booking"></div>
          <script src="https://a1ntegrel.vercel.app/widget/booking-loader.js"
            data-org-id="${escapeHtml(content.orgId)}"
            data-theme="${escapeHtml(content.theme)}"
            data-container="a1nt-booking">
          </script>
        </div>
      </div>
    </section>`;
}

function renderFaq(content: SectionContent["faq"]): string {
  const items = content.items
    .map(
      (f) => `
      <div class="faq-item">
        <button class="faq-question" onclick="this.parentElement.classList.toggle('open')">${escapeHtml(f.question)}</button>
        <div class="faq-answer">${escapeHtml(f.answer)}</div>
      </div>`
    )
    .join("");

  return `
    <section id="faq">
      <div class="section-inner">
        <div class="section-label">Questions</div>
        <h2 class="section-title">Frequently Asked Questions</h2>
        <div class="faq-list">${items}</div>
      </div>
    </section>`;
}

// ── Main Generator ──

const sectionRenderers: Record<SectionType, (content: SectionContent, accentColor: string) => string> = {
  hero: (c, a) => renderHero(c.hero, a),
  services: (c) => renderServices(c.services),
  about: (c) => renderAbout(c.about),
  team: (c) => renderTeam(c.team),
  reviews: (c) => renderReviews(c.reviews),
  contact: (c) => renderContact(c.contact),
  map: (c) => renderMap(c.map),
  promotions: (c) => renderPromotions(c.promotions),
  gallery: (c) => renderGallery(c.gallery),
  faq: (c) => renderFaq(c.faq),
  booking: (c) => renderBooking(c.booking),
};

export function generateSiteHTML(site: ClientWebsite): string {
  const template = websiteTemplates.find((t) => t.id === site.templateId);
  const { primaryColor, accentColor, fontFamily } = site.theme;
  const content = getDefaultContent(site.clientName);

  // If booking section exists, update hero CTA to point to booking
  const hasBooking = site.sections.some((s) => s.type === "booking" && s.visible);
  if (hasBooking) {
    content.hero.ctaText = "Schedule a Free Estimate Now — We're Available!";
    content.hero.ctaHref = "#booking";
  }

  // Build nav links from visible sections
  const visibleSections = site.sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const navAnchors: Record<SectionType, { label: string; href: string }> = {
    hero: { label: "Home", href: "#home" },
    services: { label: "Services", href: "#services" },
    about: { label: "About", href: "#about" },
    team: { label: "Team", href: "#team" },
    reviews: { label: "Reviews", href: "#reviews" },
    contact: { label: "Contact", href: "#contact" },
    map: { label: "Area", href: "#service-area" },
    promotions: { label: "Specials", href: "#promotions" },
    gallery: { label: "Gallery", href: "#gallery" },
    faq: { label: "FAQ", href: "#faq" },
    booking: { label: "Book Now", href: "#booking" },
  };

  const navLinks = visibleSections
    .filter((s) => s.type !== "hero")
    .map((s) => {
      const nav = navAnchors[s.type];
      return `<li><a href="${nav.href}">${nav.label}</a></li>`;
    })
    .join("");

  // Render section HTML
  const sectionsHTML = visibleSections
    .map((s) => {
      const renderer = sectionRenderers[s.type];
      return renderer ? renderer(content, accentColor) : "";
    })
    .join("");

  // Google Fonts URL
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;500;600;700;800&display=swap`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(site.seo.title)}</title>
  <meta name="description" content="${escapeHtml(site.seo.description)}" />
  <meta property="og:title" content="${escapeHtml(site.seo.title)}" />
  <meta property="og:description" content="${escapeHtml(site.seo.description)}" />
  <meta property="og:type" content="website" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fontUrl}" rel="stylesheet" />
  <style>${generateCSS(primaryColor, accentColor, fontFamily)}</style>
  <style>
    /* FAQ toggle */
    .faq-item .faq-answer { display: none; }
    .faq-item.open .faq-answer { display: block; }
    .faq-item.open .faq-question::after { content: '−'; }
  </style>
</head>
<body>
  <nav>
    <div class="nav-inner">
      <a href="#home" class="nav-brand">${escapeHtml(site.clientName)}</a>
      <ul class="nav-links">${navLinks}</ul>
      ${hasBooking
          ? '<a href="#booking" class="nav-cta">Book Now</a>'
          : visibleSections.some((s) => s.type === "contact")
          ? '<a href="#contact" class="nav-cta">Contact Us</a>'
          : ""
      }
    </div>
  </nav>

  ${sectionsHTML}

  <footer>
    <div class="section-inner">
      <div class="footer-brand">${escapeHtml(site.clientName)}</div>
      <p>${escapeHtml(content.contact.address)}</p>
      <p><a href="tel:${escapeHtml(content.contact.phone.replace(/[^+\d]/g, ""))}">${escapeHtml(content.contact.phone)}</a></p>
      <div class="footer-powered">
        <p>Powered by <a href="https://a1nt.app" target="_blank" rel="noopener">A1 Integrations</a></p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

// ── Utility ──

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
