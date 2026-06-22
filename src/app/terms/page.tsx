import Link from 'next/link';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0d0a1a] pt-20 md:pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-[#a0a0b0] hover:text-white transition-colors mb-6 inline-block">
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-8">Terms of Use</h1>

        <div className="space-y-6 text-[#c4c4d4] text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">Acceptance of Terms</h2>
            <p>
              By accessing and using Chess for Kids, you agree to be bound by these Terms of Use.
              If you are a parent or guardian, you agree to these terms on behalf of your child.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">Use of the Application</h2>
            <p>
              Chess for Kids is a free educational application designed to teach chess to children.
              You may use it for personal, non-commercial, educational purposes.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The application is provided &ldquo;as is&rdquo; without warranty</li>
              <li>You may not copy, modify, or redistribute the application code without permission</li>
              <li>You may not use the application for any unlawful purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">Intellectual Property</h2>
            <p>
              All content, including but not limited to graphics, designs, text, and code, is the
              property of Chess for Kids and is protected by intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">User Conduct</h2>
            <p>
              This application is designed for a safe, educational environment. Users are expected to
              use the application respectfully and in accordance with its intended educational purpose.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">Limitation of Liability</h2>
            <p>
              Chess for Kids shall not be liable for any indirect, incidental, or consequential
              damages arising from your use of the application. The application is provided for
              educational entertainment purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the application
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">Contact</h2>
            <p>
              For questions about these terms, please reach out through the application&apos;s
              repository or contact channels.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
