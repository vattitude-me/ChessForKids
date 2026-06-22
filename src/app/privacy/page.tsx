import Link from 'next/link';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0d0a1a] pt-20 md:pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-[#a0a0b0] hover:text-white transition-colors mb-6 inline-block">
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-[#c4c4d4] text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">Information We Collect</h2>
            <p>
              Chess for Kids is designed with children&apos;s privacy in mind. We collect minimal data
              necessary to provide the learning experience:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Game progress and puzzle completion (stored locally on your device)</li>
              <li>Difficulty preferences (stored locally on your device)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">Data Storage</h2>
            <p>
              All game data is stored locally in your browser using local storage. We do not transmit
              personal information to external servers. No account creation is required to use this application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">Children&apos;s Privacy</h2>
            <p>
              This application is designed for use by children. We do not knowingly collect personal
              information from children under 13. No personal data, names, email addresses, or
              identifiable information is requested or stored.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">Cookies</h2>
            <p>
              We do not use tracking cookies or third-party analytics. Local storage is used solely
              to save your game progress on your device.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">Third-Party Services</h2>
            <p>
              This application does not integrate with third-party advertising, analytics, or social
              media services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Any changes will be reflected on this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">Contact</h2>
            <p>
              If you have questions about this privacy policy, please reach out through the application&apos;s
              repository or contact channels.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
