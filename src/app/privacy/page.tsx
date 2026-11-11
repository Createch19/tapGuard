import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail, MapPin } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | TapGenie by CreAiTechnology",
  description: "Privacy Policy and Google User Data usage disclosure for TapGenie.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4 text-teal-600" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/brand/tapgenie-icon.png" alt="TapGenie Logo" className="w-6 h-6 object-contain" />
            <span className="font-black text-sm tracking-tight text-slate-900">TapGenie</span>
          </div>
          <Link
            href="/terms"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
          >
            Terms of Service &rarr;
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/90 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-3 border border-teal-200">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Official Privacy Policy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              TapGenie by CreAiTechnology &bull; Last updated: November 11, 2026
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">1. Who we are</h2>
            <p>
              TapGenie (&ldquo;TapGenie&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a software service operated by <strong>CreAiTechnology</strong>, located at #15/1 New Vellalar Street, Thirukkalukundram, Chengalpattu, Tamil Nadu, India. Our website is <a href="https://creaitechnology.com" className="text-teal-700 font-semibold underline">https://creaitechnology.com</a>. TapGenie helps businesses (&ldquo;Business Customers&rdquo;) create smart pages for NFC cards and QR codes, collect customer feedback, and manage their Google Business Profile.
            </p>
            <p className="flex items-center gap-2 pt-1 font-medium text-slate-900">
              <Mail className="w-4 h-4 text-teal-600" />
              <span>Contact: <a href="mailto:support@creaitechnology.com" className="text-teal-700 underline">support@creaitechnology.com</a></span>
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">2. What this policy covers</h2>
            <p>
              This policy explains what information we collect, why, how we use and protect it, and the choices you have. It applies to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Business owners, managers, and staff who create an account and use the TapGenie dashboard.</li>
              <li>People who tap an NFC card or scan a QR code connected to a Business Customer&apos;s TapGenie page (&ldquo;Visitors&rdquo;).</li>
              <li>Visitors to our website.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">3. Information we collect</h2>
            <h3 className="font-bold text-slate-900">From Business Customers</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Account details:</strong> name, email address, phone number, password (stored securely using one-way bcrypt hashing) or sign-in method.</li>
              <li><strong>Business details you enter:</strong> business name, address, hours, logo, photos, menu or catalog items, prices, social links, UPI ID, and WhatsApp number.</li>
              <li><strong>Plan and billing details:</strong> plan tier, billing cycle, and payment status. Payments are handled by our verified payment gateway. We do not store full credit/debit card details.</li>
              <li><strong>Card and table information:</strong> which NFC cards and QR codes are linked to which physical tables or locations.</li>
              <li><strong>Support messages</strong> you send us.</li>
              <li><strong>From Google</strong>, when you connect your Google Business Profile (see Section 4).</li>
            </ul>

            <h3 className="font-bold text-slate-900 pt-2">From Visitors who tap or scan</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Technical information such as device type, approximate country or region, time of the tap, and what action the Visitor performed (for example, opened the Google review page, initiated a call, or launched a UPI payment).</li>
              <li>Information a Visitor voluntarily chooses to submit, such as a name, phone number, and message in an optional private feedback or enquiry form.</li>
            </ul>

            <h3 className="font-bold text-slate-900 pt-2">From our website</h3>
            <p>Basic usage and device information, and essential cookies as described in Section 11.</p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 p-5 rounded-2xl bg-teal-50/50 border border-teal-200/80">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>4. Google User Data &amp; Limited Use Disclosure</span>
            </h2>
            <p>
              If a Business Customer chooses to connect their Google Business Profile, we ask them to sign in with Google and approve access. We request only this authorized permission (scope): <code className="bg-white px-2 py-0.5 rounded text-xs text-teal-900 font-mono border border-teal-200">https://www.googleapis.com/auth/business.manage</code>.
            </p>

            <h3 className="font-bold text-slate-900 pt-2">What we access through Google Business Profile APIs</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>The Google account email and the Business Profile accounts and locations you manage.</li>
              <li>Business information: name, categories, address, phone, website, regular and special hours, description, and service items.</li>
              <li>Reviews: star rating, review text, review date, the reviewer&apos;s public display name, and any posted replies.</li>
              <li>Performance metrics: profile views, calls, direction requests, and website clicks.</li>
              <li>Photos and posts associated with your profile.</li>
            </ul>

            <h3 className="font-bold text-slate-900 pt-2">Why we access it</h3>
            <p className="text-slate-600">We use this data only to provide the features you see and choose to use in TapGenie, such as:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Displaying your incoming reviews and indicating which ones need a reply.</li>
              <li>Drafting contextual replies for you to review, edit, and approve before publishing.</li>
              <li>Auditing and suggesting improvements to your profile completeness.</li>
              <li>Allowing you to update your profile details, special hours, and photos directly from your dashboard.</li>
              <li>Showing aggregated performance reports and displaying your rating and review count on your public digital card.</li>
            </ul>

            <h3 className="font-bold text-slate-900 pt-2">What we write to Google</h3>
            <p className="text-slate-600">
              We only post replies, posts, photos, or profile changes when you explicitly ask us to. If you choose to enable an automated reply option, we post replies strictly according to the rules and tone you set, and you can disable this option at any time.
            </p>

            <h3 className="font-bold text-slate-900 pt-2">What we strictly do NOT do</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>We <strong>do not sell</strong> Google user data.</li>
              <li>We <strong>do not use it for advertising</strong>, or share it with advertisers or data brokers.</li>
              <li>We <strong>do not use it to decide which customers are asked to leave a review</strong>, and we <strong>do not hide or filter reviews</strong>.</li>
              <li>We <strong>do not use Google user data to train generalized artificial intelligence or machine learning models</strong>.</li>
              <li>Our staff do not read your private Google data unless you specifically request customer support and provide explicit consent, or where required for security or legal compliance.</li>
            </ul>

            <div className="mt-3 p-3.5 bg-white rounded-xl border border-teal-200 text-xs text-slate-700 leading-relaxed">
              <strong>Google API Services User Data Policy:</strong> TapGenie&apos;s use and transfer to any other app of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-teal-700 underline font-semibold">Google API Services User Data Policy</a>, including the Limited Use requirements.
            </div>

            <h3 className="font-bold text-slate-900 pt-2">Storage and security</h3>
            <p className="text-slate-600">
              We store your Google OAuth access and refresh tokens encrypted at rest. We cache only the Google data needed to run dashboard features (such as recent reviews and profile details) and refresh it regularly.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">5. How we use information</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>To provide, operate, secure, and improve the TapGenie platform.</li>
              <li>To create and display business profile pages, digital menus, and NFC touchpoints, and to generate aggregate analytics for the Business Customer.</li>
              <li>To send service alerts you configure (such as notifications for new customer reviews or private feedback).</li>
              <li>To process subscription plan payments and prevent fraud and abuse.</li>
              <li>To answer customer support requests and communicate important service notices.</li>
              <li>To comply with applicable law and enforce our Terms of Service.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">6. AI features</h2>
            <p>
              Certain optional features utilize artificial intelligence (for example, drafting a suggested reply to a customer review). When invoked, only the minimum text needed for that specific task (such as the customer review text and your store&apos;s public details) is sent to our AI API provider to generate a draft. Our AI providers are contractually prohibited from using your data to train their public models. AI drafts may occasionally contain inaccuracies; you remain responsible for reviewing and approving all content before it is published to Google.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">7. Who we share information with</h2>
            <p>We share information only with:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Trusted service providers:</strong> Secure cloud hosting, transactional email delivery (Resend), verified payment processors, and AI processing APIs, strictly bound by data confidentiality agreements.</li>
              <li><strong>The Business Customer</strong> whose card or page a Visitor interacted with (for example, voluntary feedback submitted by a customer is delivered directly to that business).</li>
              <li><strong>Law enforcement or regulatory authorities</strong>, only when strictly required by applicable law or to protect legal rights, safety, or security.</li>
              <li>A corporate successor in the event of a merger or acquisition, with prior notice to you.</li>
            </ul>
            <p className="font-semibold text-slate-900">We do not sell personal information to any third parties.</p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">8. Data retention and deletion</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Account data:</strong> Retained while your account is active, and permanently deleted or anonymized within 90 days after account closure, unless statutory law mandates retention (e.g. tax and billing invoices).</li>
              <li><strong>Google user data:</strong> Retained only while your Google account remains connected. When you disconnect Google or close your account, access tokens are revoked immediately and cached Google data is purged within 30 days.</li>
              <li><strong>Visitor analytics:</strong> Retained based on your plan&apos;s analytics retention window, then aggregated or permanently deleted.</li>
              <li><strong>Database backups:</strong> Automatically purged within 35 days on standard rotation cycles.</li>
            </ul>

            <h3 className="font-bold text-slate-900 pt-2">How to disconnect Google or delete your data</h3>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
              <li>Inside your TapGenie dashboard, navigate to <strong>Google Hub &rarr; Settings</strong> and click <strong>Disconnect</strong>.</li>
              <li>Alternatively, you can revoke TapGenie&apos;s access at any time directly through Google at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-teal-700 underline font-semibold">https://myaccount.google.com/permissions</a>.</li>
              <li>To request complete deletion of your account and associated data, email <a href="mailto:support@creaitechnology.com" className="text-teal-700 underline font-semibold">support@creaitechnology.com</a> from your registered account email. We confirm requests within 7 business days and complete deletion within 30 days.</li>
            </ol>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">9. Security</h2>
            <p>
              We implement industry-standard security safeguards including TLS/HTTPS encryption in transit, encryption of OAuth tokens at rest, strict database access controls, and detailed audit logging. While no online service can be 100% immune to vulnerabilities, we continuously monitor and patch our systems. In the event of a security incident affecting your personal data, we will notify affected users as required by applicable law.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">10. Information from Visitors &amp; Anti-Gating Commitment</h2>
            <p>
              When a Visitor submits an optional form on a business&apos;s TapGenie page, the business acts as the data controller and determines how that information is handled.
            </p>
            <p className="font-semibold text-slate-900 bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-950">
              Anti-Review-Gating Policy: TapGenie does not prescreen, filter, or gate review links based on customer satisfaction. Every customer who taps an NFC card or scans a QR code receives the exact same direct link to your official Google Review page. Private feedback forms are strictly optional and never act as a barrier to leaving a public review.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">11. Cookies and similar technologies</h2>
            <p>
              We use strictly necessary cookies to keep you securely signed in to your account and prevent cross-site request forgery. You can control or block cookies through your browser settings, though doing so may prevent you from accessing authenticated areas of the dashboard.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">12. Your rights</h2>
            <p>
              Under applicable law, including the Digital Personal Data Protection Act, 2023 (DPDP Act, India), you have the right to access, correct, update, or request deletion of your personal data, to withdraw consent, and to file a grievance. To exercise any of these rights, email us at <a href="mailto:support@creaitechnology.com" className="text-teal-700 underline font-semibold">support@creaitechnology.com</a>.
            </p>
          </section>

          {/* Section 13 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">13. Children</h2>
            <p>
              TapGenie is an enterprise and business software service and is not directed at children under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has provided information to us, please notify us immediately for prompt deletion.
            </p>
          </section>

          {/* Section 14 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">14. Where information is stored</h2>
            <p>
              Our application servers and managed databases are hosted in secure cloud data centers located in India and compliant international regions with appropriate technical and contractual safeguards.
            </p>
          </section>

          {/* Section 15 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">15. Changes to this policy</h2>
            <p>
              We may revise this Privacy Policy periodically. Any updates will be posted to this page with an updated revision date. In the event of material modifications, we will notify registered account holders via email or an in-dashboard notification.
            </p>
          </section>

          {/* Section 16 */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-950">16. Contact and Grievance Officer</h2>
            <p>If you have any questions, concerns, or complaints regarding this Privacy Policy or our data practices:</p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <p><strong>Company:</strong> CreAiTechnology</p>
              <p><strong>Address:</strong> #15/1 New Vellalar Street, Thirukkalukundram, Chengalpattu, Tamil Nadu, India</p>
              <p><strong>Support Email:</strong> <a href="mailto:support@creaitechnology.com" className="text-teal-700 underline">support@creaitechnology.com</a></p>
              <p><strong>Grievance Officer:</strong> Privacy &amp; Compliance Officer, CreAiTechnology</p>
              <p className="text-slate-500 pt-1">We aim to review and respond to all formal inquiries within 7 business days.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
