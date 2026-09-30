export type Arrow = [string, string] | [string, string, string]; // from, to, optional colour

interface Base {
  /** What Coach Hoot says. Supports **bold** markup. */
  say: string;
  arrows?: Arrow[];
  highlights?: string[];
}

/** Just explain something, optionally with a board. */
export interface TalkStep extends Base {
  kind: 'talk';
  fen?: string;
}

/** Multiple choice question. */
export interface QuizStep extends Base {
  kind: 'quiz';
  fen?: string;
  options: string[];
  answer: number;
  explain: string;
}

/** Tap the named squares one after another. */
export interface FindStep extends Base {
  kind: 'find';
  squares: string[];
}

/** Tap every square the highlighted piece could move to. */
export interface TapStep extends Base {
  kind: 'tap';
  fen: string;
  from: string;
  explain: string;
}

/** Move one piece around to collect all stars (enemy pieces are stars too). */
export interface StarsStep extends Base {
  kind: 'stars';
  fen: string; // our piece is the only white piece that can move; black pieces are targets
  stars: string[];
  /** Square of the piece the kid moves (defaults to the only white piece). */
  hero?: string;
  /** Enemy pieces guard squares; landing on a guarded square fails. */
  guarded?: boolean;
  par: number; // moves for a perfect score
}

/** Make a move on a real chess position. */
export interface MoveStep extends Base {
  kind: 'move';
  fen: string;
  /** Accepted answers in UCI. Use `goal` for rule-based checking instead. */
  accept?: string[];
  goal?: 'mate' | 'check' | 'castle' | 'promote' | 'capture' | 'escape' | 'safe';
  /** Optional follow-up: opponent reply and next accepted moves. */
  then?: { reply: string; say: string; accept?: string[]; goal?: MoveStep['goal'] }[];
  success: string;
  hint: string;
  wrong?: string;
}

/** Play out a position against the engine until a goal is reached. */
export interface PlayStep extends Base {
  kind: 'play';
  fen: string;
  goal: 'mate' | 'promote';
  maxMoves: number;
  success: string;
  hint: string;
}

export type LessonStep = TalkStep | QuizStep | FindStep | TapStep | StarsStep | MoveStep | PlayStep;

export interface Lesson {
  id: string;
  title: string;
  icon: string;
  blurb: string;
  steps: LessonStep[];
}

export interface World {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}
