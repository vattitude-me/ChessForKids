import LegalPage, { LegalSection } from '@/components/legal/LegalPage';

export const metadata = { title: 'Privacy · Little Knights' };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 2026">
      <LegalSection title="The short version">
        <p>Little Knights is built for children. It works without an account, shows no ads, and uses no tracking or analytics.</p>
      </LegalSection>
      <LegalSection title="What we store">
        <ul>
          <li>Learning progress: lessons, puzzle results, games, badges, XP and settings.</li>
          <li>The nickname, avatar and age range chosen when starting. We use the age range only to pick a starting level.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Where it is stored">
        <p>By default everything stays in your browser&apos;s local storage on this device and is never sent anywhere.</p>
        <p>
          If a grown-up creates an optional account, progress is also saved to Google Firebase so it can be used on other devices. The nickname is
          encrypted before it is uploaded, and the age range is never uploaded. Accounts use a username, not an email address.
        </p>
      </LegalSection>
      <LegalSection title="The chess engine">
        <p>Computer opponents and hints use Stockfish, which runs entirely inside your browser. Your moves are not sent to a server.</p>
      </LegalSection>
      <LegalSection title="Children's privacy">
        <p>We don&apos;t ask for real names, email addresses, photos or locations. Please use a nickname.</p>
      </LegalSection>
      <LegalSection title="Deleting data">
        <p>Use &ldquo;Reset all progress&rdquo; on the Me page, or clear this site&apos;s data in your browser. Signed-in families can ask us to delete their cloud copy.</p>
      </LegalSection>
      <LegalSection title="Changes and contact">
        <p>If this policy changes, we&apos;ll update this page. Questions? Reach out through the project&apos;s repository or contact channels.</p>
      </LegalSection>
    </LegalPage>
  );
}
