import Link from "next/link";
import { ArrowLeft, FileText, Mail, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Terms of Service | TapGenie by CreAiTechnology",
  description: "Terms of Service and legal agreement for TapGenie.",
};

export default function TermsOfServicePage() {
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
            href="/privacy"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
          >
            Privacy Policy &rarr;
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/90 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-3 border border-teal-200">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Legal Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              TapGenie by CreAiTechnology &bull; Last updated: November 11, 2026
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">1. Agreement</h2>
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) are a binding legal agreement between you and <strong>CreAiTechnology</strong>, located at #15/1 New Vellalar Street, Thirukkalukundram, Chengalpattu, Tamil Nadu, India (&ldquo;TapGenie&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). They govern your access to and use of the TapGenie website at <a href="https://creaitechnology.com" className="text-teal-700 underline font-semibold">creaitechnology.com</a>, the business dashboard, physical NFC cards, QR codes, stands, and associated software services (collectively, the &ldquo;Service&rdquo;).
            </p>
            <p>
              By creating an account, purchasing a subscription plan or physical card, or accessing the Service, you signify that you have read, understood, and agree to be bound by these Terms and our <Link href="/privacy" className="text-teal-700 underline font-semibold">Privacy Policy</Link>. If you are accepting these Terms on behalf of a business, company, or legal entity, you represent and warrant that you have full legal authority to bind that entity.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">2. The Service</h2>
            <p>
              TapGenie enables businesses to design and deploy interactive mobile experiences for NFC cards and QR codes, collect voluntary customer feedback and enquiries, share direct UPI payment identifiers, monitor scan analytics, and (when authorized) manage aspects of their Google Business Profile. Certain features may be marked &ldquo;Coming Soon&rdquo; and are under active development. We reserve the right to modify, enhance, or discontinue features of the Service at our discretion.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">3. Accounts and eligibility</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>You must be at least 18 years old and capable of entering into a legally binding contract.</li>
              <li>You must provide true, accurate, and current information when registering, and keep your login credentials confidential. You are solely responsible for all activities that occur under your account.</li>
              <li>You agree to notify us immediately at <a href="mailto:support@creaitechnology.com" className="text-teal-700 underline">support@creaitechnology.com</a> if you discover or suspect unauthorized access to your account.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 p-5 rounded-2xl bg-teal-50/50 border border-teal-200/80">
            <h2 className="text-lg font-bold text-slate-950">4. Connecting your Google Business Profile</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>You may only connect a Google Business Profile that you own or are legally authorized to manage. By connecting a profile, you certify that you have such authority.</li>
              <li>You grant TapGenie permission to access, cache, and (upon your request) update that profile through Google&apos;s Business Profile APIs as detailed in our Privacy Policy. You can disconnect your Google account at any time in 1 click.</li>
              <li>Your use of Google services is governed by Google&apos;s respective Terms of Service and Policies. Google may alter, restrict, or suspend API access or your profile at its discretion; TapGenie is not liable for actions taken by Google.</li>
              <li><strong>Trademark Disclaimer:</strong> TapGenie is an independent product and is not affiliated with, sponsored by, or endorsed by Google LLC. Google, Google Maps, and Google Business Profile are registered trademarks of Google LLC.</li>
              <li>We only publish replies, posts, photos, or listing edits to Google when you explicitly authorize them. If you choose to enable an automated reply setting, you may disable it at any time.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80">
            <h2 className="text-lg font-bold text-amber-950 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>5. Reviews and feedback: Merchant responsibilities</span>
            </h2>
            <p className="text-amber-900 font-medium">To protect consumer trust and comply with global anti-gating policies, you agree that you will:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-amber-950/90 text-xs sm:text-sm">
              <li><strong>Offer every customer the same opportunity to leave a public review:</strong> You will not use TapGenie to filter, gate, block, delay, or discourage negative reviews, or selectively route only satisfied customers to Google.</li>
              <li><strong>Zero review incentives:</strong> You will not offer discounts, gifts, cash, freebies, or incentives in exchange for leaving reviews.</li>
              <li><strong>Authentic reviews only:</strong> You will not write, purchase, solicit, or publish fraudulent reviews, and will not provide pre-written, ready-made review text for customers to copy and paste.</li>
              <li><strong>Follow Google&apos;s Content Guidelines:</strong> You will comply with all Google Maps and Business Profile policies as well as consumer protection laws.</li>
            </ul>
            <p className="text-xs text-amber-900 pt-1">
              TapGenie&apos;s optional private feedback form is strictly an additional customer communication channel and must never be configured to replace, intercept, or discourage public reviews. We reserve the right to suspend or terminate accounts that violate this section.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">6. AI-generated content</h2>
            <p>
              Certain features provide artificial intelligence suggestions (such as drafting suggested responses to customer reviews). AI outputs may contain inaccuracies, unintended phrasing, or factual errors. You are exclusively responsible for reviewing, editing, and verifying all AI-generated drafts prior to publication. TapGenie bears no liability for content published through manual or automated reply features.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">7. Plans, fees, and payments</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Subscription tiers and pricing are detailed on our website. All listed fees are in Indian Rupees (INR) and <strong>exclude GST and applicable taxes</strong> unless explicitly noted otherwise.</li>
              <li>Monthly and annual subscriptions automatically renew at the close of each billing cycle unless cancelled prior to renewal in your dashboard or via written notice to support.</li>
              <li><strong>Lite Plan Lifetime Terms:</strong> &ldquo;Lifetime&rdquo; refers to the commercial product lifecycle of the TapGenie Lite tier as offered by CreAiTechnology, not the biological lifespan of the purchaser. In the event the Lite tier is retired, we will provide at least 90 days&apos; advance notice.</li>
              <li><strong>Price adjustments:</strong> We may revise subscription fees with at least 30 days&apos; advance notice. Price changes take effect at your next renewal.</li>
              <li><strong>Refund policy:</strong> Annual subscription plans are eligible for a refund within 7 calendar days of initial purchase if the service has not been materially utilized. Monthly subscriptions and one-time physical hardware costs are non-refundable.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">8. Physical hardware: Cards, stands, and stickers</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Hardware orders are shipped to the postal address provided at checkout. Estimated delivery timelines are indicative.</li>
              <li><strong>Defects and replacements:</strong> Physical items received damaged or malfunctioning must be reported within 7 calendar days of delivery with photo/video evidence to <a href="mailto:support@creaitechnology.com" className="text-teal-700 underline">support@creaitechnology.com</a> for replacement.</li>
              <li><strong>Device compatibility:</strong> NFC functionality requires an NFC-enabled smartphone (e.g. iPhone XR and newer, or compatible Android devices). Every physical TapGenie card is printed with a high-resolution dynamic QR code as a universal fallback.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">9. Customer data collected through TapGenie</h2>
            <p>
              When end customers submit private feedback, contact requests, or reservation enquiries through your TapGenie card, you act as the data controller and are responsible for providing all necessary legal disclosures and obtaining customer consent. TapGenie processes this data solely on your behalf. You agree not to use TapGenie to collect sensitive personal data such as financial passwords, payment card numbers, or biometric records.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-950">10. UPI and payment links</h2>
            <p>
              TapGenie provides convenience tiles to display your merchant UPI ID or dynamic payment link so customers can pay you directly. <strong>TapGenie is not a payment gateway, payment aggregator, or financial intermediary. TapGenie does not process, hold, touch, or guarantee transaction funds.</strong>
            </p>
            <p className="text-xs text-slate-600 pt-1">
              All payment transactions occur directly between the customer and your merchant bank via their UPI application (Google Pay, PhonePe, Paytm, BHIM, etc.). You are solely responsible for ensuring the accuracy of your UPI ID and handling any customer payment disputes.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">11. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Violate applicable laws, regulations, or third-party intellectual property rights.</li>
              <li>Upload malicious code, phishing links, or defamatory, explicit, or fraudulent content.</li>
              <li>Reprogram or redirect NFC cards/QR codes to deceptive URLs or scam sites.</li>
              <li>Reverse engineer, scrape, probe, or attempt to circumvent any security controls of the Service.</li>
              <li>Resell, white-label, or sublicense the platform without express written authorization.</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">12. Intellectual property &amp; content ownership</h2>
            <p>
              You retain all ownership rights to the trademarks, logos, menu items, and text you upload (&ldquo;Your Content&rdquo;). You grant us a worldwide, non-exclusive license to host, display, and format your content solely to provide the Service. TapGenie&apos;s software, interface, designs, code, and documentation are the exclusive intellectual property of CreAiTechnology.
            </p>
          </section>

          {/* Section 13 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">13. Third-party services</h2>
            <p>
              The Service integrates with and links to external services including Google Business Profile, WhatsApp, Swiggy, and Zomato. We do not control and are not responsible for the performance, policies, or uptime of third-party platforms.
            </p>
          </section>

          {/* Section 14 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">14. Availability and service changes</h2>
            <p>
              We strive for high uptime and availability but do not warrant that the Service will be completely uninterrupted or bug-free. We may modify or retire specific features with reasonable notice where practicable.
            </p>
          </section>

          {/* Section 15 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">15. Suspension and termination</h2>
            <p>
              You may terminate your account at any time. We may suspend or terminate your account if you breach these Terms, engage in fraudulent review practices, fail to pay fees, or create legal exposure for us or third parties.
            </p>
          </section>

          {/* Section 16 */}
          <section className="space-y-3 p-5 rounded-2xl bg-slate-100 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-950">16. Disclaimers: No guarantees</h2>
            <p className="font-semibold text-slate-900">
              The Service is provided strictly &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. TapGenie makes no warranties or representations of any kind, whether express or implied.
            </p>
            <p className="text-xs text-slate-600">
              <strong>We do not guarantee any specific number of reviews, star ratings, local search rankings, Google 3-Pack placement, or revenue increases.</strong> Customer reviews and search rankings depend entirely on authentic customer sentiment and Google&apos;s proprietary algorithms.
            </p>
          </section>

          {/* Section 17 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">17. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, CreAiTechnology and its directors, officers, and employees shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of profits, data, goodwill, or business reputation. Our aggregate liability arising out of or related to these Terms will not exceed the total fees actually paid by you to TapGenie in the 12 months immediately preceding the event giving rise to liability.
            </p>
          </section>

          {/* Section 18 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">18. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless CreAiTechnology from and against any claims, losses, liabilities, and expenses (including reasonable attorney fees) arising from your breach of these Terms, your misuse of the Service, your violation of third-party rights, or any infringement of Google&apos;s review policies.
            </p>
          </section>

          {/* Section 19 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">19. Governing law and dispute resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the substantive laws of India. Any legal dispute, action, or proceeding arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>Chengalpattu / Chennai, Tamil Nadu, India</strong>.
            </p>
          </section>

          {/* Section 20 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">20. Changes to these Terms</h2>
            <p>
              We reserve the right to revise these Terms at any time. Changes will be posted to this page with an updated date. Continued use of the Service following any update constitutes acceptance of the amended Terms.
            </p>
          </section>

          {/* Section 21 */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-950">21. Contact information</h2>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <p><strong>Entity:</strong> CreAiTechnology</p>
              <p><strong>Address:</strong> #15/1 New Vellalar Street, Thirukkalukundram, Chengalpattu, Tamil Nadu, India</p>
              <p><strong>Contact Email:</strong> <a href="mailto:support@creaitechnology.com" className="text-teal-700 underline">support@creaitechnology.com</a></p>
              <p><strong>Grievance Officer:</strong> Legal &amp; Compliance Team, CreAiTechnology</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

