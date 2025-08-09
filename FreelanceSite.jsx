import React, { useEffect, useRef, useState } from "react";

// Single-file React + Tailwind component
// - Animated 3D-like floating polygons background (Canvas)
// - Dark futuristic UI with neon accents
// - Sections: Hero, Services (with price), Analytics focus, Testimonials (separate anchor), Contact (form -> attempts Formspree POST, falls back to mailto), Newsletter signup
// - LinkedIn: https://www.linkedin.com/in/onlinesanjo
// - Email: sanjojose147@gmail.com
// - WhatsApp: +91 7510339490

// NOTE for deployment:
// - Replace `FORM_ENDPOINT` with your Formspree/Netlify/Formcarry endpoint if you want server-side delivery.
// - The contact form will attempt to POST to FORM_ENDPOINT. If not configured, it falls back to opening the user's email client with a pre-filled mailto to sanjojose147@gmail.com

const FORM_ENDPOINT = ""; // <-- OPTIONAL: insert your form endpoint (e.g. https://formspree.io/f/yourid)
const EMAIL = "sanjojose147@gmail.com";
const WHATSAPP_NUMBER = "+917510339490"; // for wa.me use without plus: 917510339490
const LINKEDIN = "https://www.linkedin.com/in/onlinesanjo";
const HOURLY_RATE = 2490; // INR

export default function FreelanceSite() {
  const canvasRef = useRef(null);
  const [formStatus, setFormStatus] = useState(null);
  const [newsletterMsg, setNewsletterMsg] = useState("");

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const polys = [];
    const POLY_COUNT = Math.max(8, Math.floor(window.innerWidth / 160));

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function makePoly() {
      const size = rand(60, 220);
      const x = rand(-width * 0.2, width * 1.2);
      const y = rand(-height * 0.2, height * 1.2);
      const z = rand(0.2, 1.4);
      const speed = rand(0.1, 0.6);
      const rot = rand(0, Math.PI * 2);
      const rotSpeed = rand(-0.003, 0.003);
      const sides = Math.floor(rand(3, 6));
      const hue = Math.floor(rand(180, 280));
      return { x, y, z, size, speed, rot, rotSpeed, sides, hue };
    }

    for (let i = 0; i < POLY_COUNT; i++) polys.push(makePoly());

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", resize);

    function drawPolygon(cx, cy, radius, sides, rotation) {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + rotation;
        const sx = cx + Math.cos(angle) * radius;
        const sy = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      // background gradient
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, "#05030a");
      g.addColorStop(1, "#07051a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      // subtle grid glow
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = "#6ee7b7";
      ctx.lineWidth = 1;
      const step = 120;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // draw polys
      for (let p of polys) {
        p.rot += p.rotSpeed;
        p.x += Math.cos(p.rot) * p.speed;
        p.y += Math.sin(p.rot * 0.6) * p.speed * 0.6;

        // wrap around
        if (p.x > width * 1.2) p.x = -width * 0.2;
        if (p.x < -width * 0.2) p.x = width * 1.2;
        if (p.y > height * 1.2) p.y = -height * 0.2;
        if (p.y < -height * 0.2) p.y = height * 1.2;

        const perspectiveScale = 0.6 + (p.z - 0.2) / 1.2; // 0.6 - 1.4
        const px = p.x;
        const py = p.y;
        const size = p.size * perspectiveScale;

        // shadow / glow
        ctx.save();
        ctx.globalAlpha = 0.14 * (1 / p.z);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 55%, 0.06)`;
        drawPolygon(px + 6, py + 6, size * 0.98, p.sides, p.rot + 0.35);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.9 * (1 / p.z);
        const grd = ctx.createLinearGradient(px - size, py - size, px + size, py + size);
        grd.addColorStop(0, `hsla(${p.hue - 30},90%,55%,0.15)`);
        grd.addColorStop(1, `hsla(${p.hue + 40},80%,62%,0.25)`);
        ctx.fillStyle = grd;
        ctx.strokeStyle = `hsla(${p.hue + 20},90%,68%,0.45)`;
        ctx.lineWidth = 1.2 * (1 / p.z);
        drawPolygon(px, py, size, p.sides, p.rot);
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Contact form handler: try POST to FORM_ENDPOINT, else open mailto
  async function handleContactSubmit(e) {
    e.preventDefault();
    setFormStatus(null);
    const form = new FormData(e.target);
    const payload = Object.fromEntries(form.entries());

    // If a FORM_ENDPOINT is provided, try to POST JSON
    if (FORM_ENDPOINT && FORM_ENDPOINT.trim().length > 0) {
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setFormStatus("SENT");
          e.target.reset();
          return;
        } else {
          setFormStatus("FAILED");
        }
      } catch (err) {
        setFormStatus("FAILED");
      }
    }

    // Fallback: open mailto prefilled (this opens user's email client)
    const subject = encodeURIComponent("New lead from website: " + payload.name);
    const bodyLines = [];
    bodyLines.push(`Name: ${payload.name}`);
    bodyLines.push(`Email: ${payload.email}`);
    bodyLines.push(`Phone: ${payload.phone}`);
    bodyLines.push(`Message: ${payload.message}`);
    bodyLines.push(`Interested Service: ${payload.service || "Not specified"}`);
    const body = encodeURIComponent(bodyLines.join("\n"));
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setFormStatus("FALLBACK_MAILTO");
    e.target.reset();
  }

  async function handleNewsletter(e) {
    e.preventDefault();
    const email = e.target.elements.newsEmail.value;
    if (!email) return setNewsletterMsg("Please enter an email");
    // Try to POST to FORM_ENDPOINT/newsletter if configured
    if (FORM_ENDPOINT && FORM_ENDPOINT.trim().length > 0) {
      try {
        await fetch(FORM_ENDPOINT + "/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        setNewsletterMsg("Thanks — you're subscribed!");
        e.target.reset();
        return;
      } catch (err) {
        // continue to fallback
      }
    }
    // Fallback: just show message (you'll need to wire up an actual subscriber flow)
    setNewsletterMsg("Thanks — please expect updates via email (manual fallback).\n(Configure FORM_ENDPOINT for automatic delivery)");
    e.target.reset();
  }

  return (
    <div className="min-h-screen relative text-slate-100 font-inter">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="fixed inset-0 -z-10" />

      {/* Top navigation */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
  src="/sj.jpg" 
  alt="Sanjo Jose" 
  className="w-12 h-12 rounded-2xl object-cover shadow-2xl"
/>

          <div>
            <div className="text-sm text-slate-300">Sanjo Jose</div>
            <div className="text-xs text-slate-400">Digital Marketing & Analytics</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a href="#services" className="text-sm hover:underline">Services</a>
          <a href="#testimonials" className="text-sm hover:underline">Testimonials</a>
          <a href="#contact" className="text-sm hover:underline">Contact</a>
          <a href={LINKEDIN} target="_blank" rel="noreferrer" className="text-sm hover:underline">LinkedIn</a>
          <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-md text-emerald-300 text-sm border border-emerald-700 hover:bg-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5L3 18V8z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-6xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-start gap-12">
        <div className="flex-1">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Sanjo Jose —
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300"> Digital Marketing</span>
            <br />& Analytics
          </h1>

          <p className="mt-6 text-slate-300 max-w-2xl">I help businesses grow with data-driven marketing — performance ads, SEO, content strategy, analytics, and growth systems tailored for measurable ROI.</p>

          <div className="mt-6 flex gap-4">
            <a href="#contact" className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-black font-semibold shadow-lg">Hire Me</a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, "")}`} target="_blank" rel="noreferrer" className="px-5 py-3 rounded-2xl border border-slate-700 text-slate-200">Message on WhatsApp</a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
            <div className="p-4 rounded-xl bg-white/3 backdrop-blur-sm border border-white/6">
              <div className="text-sm text-slate-300">Rate</div>
              <div className="text-2xl font-bold">₹{HOURLY_RATE} / hour</div>
              <div className="text-xs text-slate-400 mt-1">Transparent pricing — pay by the hour. Discounts for longer retainer contracts.</div>
            </div>
            <div className="p-4 rounded-xl bg-white/3 backdrop-blur-sm border border-white/6">
              <div className="text-sm text-slate-300">Availability</div>
              <div className="text-2xl font-bold">Open for projects</div>
              <div className="text-xs text-slate-400 mt-1">Book a consultation or send me a brief.</div>
            </div>
          </div>

        </div>

        <div className="w-full lg:w-96 p-6 rounded-2xl bg-gradient-to-br from-white/3 to-white/2 border border-white/6 backdrop-blur-sm shadow-2xl">
          <div className="text-sm text-slate-300">Get a quick quote</div>
          <div className="mt-3 text-lg font-semibold">Request a 30-min assessment</div>
          <form onSubmit={handleContactSubmit} className="mt-4 space-y-3">
            <input name="name" required className="w-full px-3 py-2 rounded-md bg-transparent border border-white/8" placeholder="Your name" />
            <input name="email" type="email" required className="w-full px-3 py-2 rounded-md bg-transparent border border-white/8" placeholder="Email" />
            <input name="phone" className="w-full px-3 py-2 rounded-md bg-transparent border border-white/8" placeholder="Phone" />
            <select name="service" className="w-full px-3 py-2 rounded-md bg-transparent border border-white/8">
              <option>Marketing Strategy</option>
              <option>Performance Ads (Google / Meta)</option>
              <option>SEO & Content</option>
              <option>Marketing Analytics & Dashboards</option>
              <option>Growth Hacking</option>
              <option>Airdrop & Token Launch Consulting</option>
            </select>
            <textarea name="message" rows={3} className="w-full px-3 py-2 rounded-md bg-transparent border border-white/8" placeholder="Brief about the project (optional)" />
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-semibold">Send</button>
              <div className="text-sm text-slate-400">or email: <a href={`mailto:${EMAIL}`} className="underline">{EMAIL}</a></div>
            </div>
            {formStatus === "SENT" && <div className="text-sm text-emerald-300">Thanks — I received your message and will reply shortly.</div>}
            {formStatus === "FAILED" && <div className="text-sm text-amber-300">Submission failed. Falling back to email client...</div>}
            {formStatus === "FALLBACK_MAILTO" && <div className="text-sm text-slate-300">Opened your email client to send the message.</div>}
          </form>
        </div>
      </header>

      {/* Services */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        <section id="services" className="mt-6 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Services — Full-stack Digital Marketing & Analytics</h2>
            <p className="text-slate-300">I provide end-to-end marketing services — strategy to execution. Pricing is transparent at <strong>₹{HOURLY_RATE}/hour</strong>. Retainers and package pricing available on request.</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 rounded-xl bg-white/3 border border-white/6">
                <h3 className="font-semibold">Performance Advertising</h3>
                <p className="text-sm text-slate-300 mt-2">Google Ads, Meta Ads, programmatic campaigns, landing page CRO, and A/B testing for measurable ROAS.</p>
              </div>

              <div className="p-6 rounded-xl bg-white/3 border border-white/6">
                <h3 className="font-semibold">Marketing Analytics</h3>
                <p className="text-sm text-slate-300 mt-2">GA4, Google Tag Manager, dashboarding (Looker, Power BI, Data Studio), event tracking, funnel analysis, attribution models.</p>
              </div>

              <div className="p-6 rounded-xl bg-white/3 border border-white/6">
                <h3 className="font-semibold">SEO & Content</h3>
                <p className="text-sm text-slate-300 mt-2">Technical SEO audits, on-page optimization, content strategy and long-form content that drives organic traffic.</p>
              </div>

              <div className="p-6 rounded-xl bg-white/3 border border-white/6">
                <h3 className="font-semibold">Growth & Community</h3>
                <p className="text-sm text-slate-300 mt-2">Growth experiments, airdrop strategy consulting, community building and retention tactics.</p>
              </div>

            </div>

          </div>

          <aside className="p-6 rounded-xl bg-gradient-to-br from-white/3 to-white/2 border border-white/6">
            <div className="text-slate-300">Quick Packages</div>
            <div className="mt-3 space-y-3">
              <div className="p-3 rounded-md bg-white/4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Starter Audit</div>
                    <div className="text-xs text-slate-400">1-week quick audit & plan</div>
                  </div>
                  <div className="font-semibold">₹6,990</div>
                </div>
              </div>

              <div className="p-3 rounded-md bg-white/4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Campaign Setup</div>
                    <div className="text-xs text-slate-400">Ads + Landing page</div>
                  </div>
                  <div className="font-semibold">₹14,900</div>
                </div>
              </div>

              <div className="p-3 rounded-md bg-white/4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Analytics Dashboard</div>
                    <div className="text-xs text-slate-400">Custom dashboard & tracking</div>
                  </div>
                  <div className="font-semibold">₹24,900</div>
                </div>
              </div>

            </div>

            <div className="mt-6">
              <a href="#contact" className="block text-center px-4 py-2 rounded-xl bg-emerald-400/10 border border-emerald-600">Get a Quote</a>
            </div>

          </aside>
        </section>

        {/* Analytics highlight */}
        <section className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-white/6">
          <h3 className="text-xl font-semibold">Marketing Analytics & Dashboards</h3>
          <p className="text-slate-300 mt-2">I design tracking plans, implement GTM and GA4, and build dashboards that stakeholders actually use. Example deliverables:</p>
          <ul className="mt-3 list-disc list-inside text-slate-300">
            <li>Event taxonomy & tracking plan</li>
            <li>Funnel & cohort analysis</li>
            <li>Automated monthly reporting</li>
            <li>Attribution and incrementality testing</li>
          </ul>
        </section>

        {/* Testimonials separate from home */}
        <section id="testimonials" className="mt-12">
          <h2 className="text-2xl font-bold">What clients say</h2>
          <p className="text-slate-300 mt-2">Selected testimonials (real clients or placeholders — replace with real quotes as needed).</p>

          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <blockquote className="p-6 rounded-xl bg-white/3 border border-white/6">
              <div className="text-slate-300">"Sanjo transformed our acquisition with a clear ad strategy and clean tracking — 3x ROI in two months."</div>
              <div className="mt-4 text-sm text-slate-400">— Priya R., Founder</div>
            </blockquote>

            <blockquote className="p-6 rounded-xl bg-white/3 border border-white/6">
              <div className="text-slate-300">"Excellent analytics setup — we finally understand where our conversions come from."</div>
              <div className="mt-4 text-sm text-slate-400">— Rohit S., Head of Growth</div>
            </blockquote>

            <blockquote className="p-6 rounded-xl bg-white/3 border border-white/6">
              <div className="text-slate-300">"Clear, fast, and data-driven. Sanjo's recommendations resulted in measurable growth."</div>
              <div className="mt-4 text-sm text-slate-400">— Aisha K., Marketing Lead</div>
            </blockquote>
          </div>
        </section>

        {/* Contact / Footer */}
        <section id="contact" className="mt-12 grid lg:grid-cols-2 gap-8 items-start">
          <div className="p-8 rounded-xl bg-white/3 border border-white/6">
            <h3 className="text-xl font-semibold">Contact — Let's get to work</h3>
            <p className="text-slate-300 mt-2">Fill the form and I'll respond to your email within 24–48 hours. For urgent messages use WhatsApp.</p>

            <form onSubmit={handleContactSubmit} className="mt-4 grid gap-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input name="name" required placeholder="Name" className="px-3 py-2 rounded-md bg-transparent border border-white/8" />
                <input name="email" required type="email" placeholder="Email" className="px-3 py-2 rounded-md bg-transparent border border-white/8" />
              </div>

              <input name="phone" placeholder="Phone" className="px-3 py-2 rounded-md bg-transparent border border-white/8" />
              <select name="service" className="px-3 py-2 rounded-md bg-transparent border border-white/8">
                <option>General Inquiry</option>
                <option>Performance Ads</option>
                <option>Analytics & Dashboards</option>
                <option>SEO & Content</option>
                <option>Growth Strategy</option>
              </select>
              <textarea name="message" rows={4} placeholder="Tell me about your project" className="px-3 py-2 rounded-md bg-transparent border border-white/8" />

              <div className="flex items-center gap-3">
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-500 text-black font-semibold">Get a Quote</button>
                <a href={`mailto:${EMAIL}`} className="text-sm text-slate-300 underline">Or email: {EMAIL}</a>
              </div>
              {formStatus === "SENT" && <div className="text-sm text-emerald-300">Thanks — I received your message and will reply shortly.</div>}
            </form>

            <div className="mt-6">
              <h4 className="text-sm text-slate-300">Newsletter</h4>
              <form onSubmit={handleNewsletter} className="mt-2 flex gap-2">
                <input name="newsEmail" type="email" placeholder="Your email" className="px-3 py-2 rounded-md bg-transparent border border-white/8" />
                <button className="px-3 py-2 rounded-md bg-emerald-500 text-black">Subscribe</button>
              </form>
              {newsletterMsg && <div className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">{newsletterMsg}</div>}
            </div>

          </div>

          <div className="p-8 rounded-xl bg-white/3 border border-white/6">
            <h4 className="font-semibold">Quick contact</h4>
            <div className="mt-3 text-slate-300">Email: <a href={`mailto:${EMAIL}`} className="underline">{EMAIL}</a></div>
            <div className="mt-2 text-slate-300">WhatsApp: <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, "")}`} target="_blank" rel="noreferrer" className="underline">{WHATSAPP_NUMBER}</a></div>
            <div className="mt-2 text-slate-300">LinkedIn: <a href={LINKEDIN} target="_blank" rel="noreferrer" className="underline">onlinesanjo</a></div>

            <div className="mt-6">
              <h5 className="text-sm text-slate-300">Hours & response</h5>
              <div className="text-sm text-slate-400 mt-2">Typically replies within 24–48 hours. For urgent matters ping on WhatsApp.</div>
            </div>

            <div className="mt-6">
              <h5 className="text-sm text-slate-300">Payment & billing</h5>
              <div className="text-sm text-slate-400 mt-2">Standard rate: ₹{HOURLY_RATE}/hr. I invoice monthly or per-project depending on the agreement.</div>
            </div>

          </div>
        </section>

        <footer className="mt-12 py-8 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} Sanjo Jose — Digital Marketing & Analytics • <a href={LINKEDIN} className="underline">LinkedIn</a>
        </footer>

      </main>

      {/* small floating action for quick WhatsApp */}
      <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, "")}`} target="_blank" rel="noreferrer" className="fixed right-6 bottom-6 bg-emerald-500 p-3 rounded-full shadow-2xl border-2 border-emerald-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m-6 4a9 9 0 1011.95 11.95L21 21l-2.05-3.95A9 9 0 003 9z" />
        </svg>
      </a>

    </div>
  );
}
