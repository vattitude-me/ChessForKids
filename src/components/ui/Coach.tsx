import { Fragment, ReactNode } from 'react';
import Mascot, { MascotMood } from './Mascot';

/** Renders **bold** segments and line breaks from lesson text. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={i} className="font-extrabold text-primary">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <Fragment key={i}>{part}</Fragment>
            ),
          )}
        </Fragment>
      ))}
    </>
  );
}

export default function Coach({
  text,
  mood = 'happy',
  size = 72,
  children,
  tone = 'default',
  className = '',
}: {
  text?: string;
  mood?: MascotMood;
  size?: number;
  children?: ReactNode;
  tone?: 'default' | 'good' | 'bad' | 'info';
  className?: string;
}) {
  const toneClass =
    tone === 'good'
      ? 'border-mint bg-mint-soft'
      : tone === 'bad'
        ? 'border-coral bg-coral-soft'
        : tone === 'info'
          ? 'border-sky bg-sky-soft'
          : 'border-line bg-paper';
  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <div className="shrink-0 animate-float">
        <Mascot mood={mood} size={size} />
      </div>
      <div className={`relative mb-3 flex-1 rounded-3xl rounded-bl-md border-2 px-4 py-3 text-[1.05rem] leading-snug font-semibold text-ink shadow-[0_3px_0_var(--color-line)] ${toneClass}`}>
        {text && <RichText text={text} />}
        {children}
      </div>
    </div>
  );
}
