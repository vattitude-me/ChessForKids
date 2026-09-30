import LegalPage, { LegalSection } from '@/components/legal/LegalPage';

export const metadata = { title: 'Terms · Chess 4 Kids' };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="September 2026">
      <LegalSection title="Acceptance of terms">
        <p>By using Chess 4 Kids you agree to these terms. If you are a parent or guardian, you agree on behalf of your child.</p>
      </LegalSection>
      <LegalSection title="Using the app">
        <p>Chess 4 Kids is a free educational app for learning chess, for personal, non-commercial use.</p>
        <ul>
          <li>The app is provided &ldquo;as is&rdquo;, without warranty.</li>
          <li>Please don&apos;t use it for anything unlawful or harmful.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Intellectual property">
        <p>
          Lessons, graphics, designs and code belong to Chess 4 Kids unless stated otherwise. Third-party components keep their own licenses. In particular,
          the Stockfish chess engine is licensed under the GNU GPL v3 (see <a className="underline" href="/engine/STOCKFISH-LICENSE.txt">license</a> and{' '}
          <a className="underline" href="https://github.com/nmrugg/stockfish.js">source</a>).
        </p>
      </LegalSection>
      <LegalSection title="Limitation of liability">
        <p>Chess 4 Kids is not liable for any indirect, incidental or consequential damages arising from use of the app.</p>
      </LegalSection>
      <LegalSection title="Changes and contact">
        <p>We may update these terms. Continuing to use the app means you accept the changes. Questions? Reach out through the project&apos;s repository or contact channels.</p>
      </LegalSection>
    </LegalPage>
  );
}
