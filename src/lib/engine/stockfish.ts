'use client';

/**
 * Thin client for Stockfish 19 (lite, single-threaded WASM build) running in a
 * Web Worker. Requests are queued and answered one at a time, so callers can
 * simply `await engine.analyse(fen)` without worrying about UCI plumbing.
 */

export interface EngineLine {
  move: string; // UCI
  cp: number | null; // centipawns, side-to-move POV
  mate: number | null; // moves to mate, side-to-move POV
  pv: string[];
  depth: number;
}

export interface AnalyseOptions {
  depth?: number;
  movetime?: number;
  multipv?: number;
}

const ENGINE_URL = '/engine/stockfish-19-lite-single.js';

interface Job {
  fen: string;
  opts: AnalyseOptions;
  resolve: (lines: EngineLine[]) => void;
  reject: (e: unknown) => void;
}

class StockfishClient {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private queue: Job[] = [];
  private busy = false;
  private current: { job: Job; lines: Map<number, EngineLine> } | null = null;
  private failed = false;

  get available() {
    return !this.failed;
  }

  private boot(): Promise<void> {
    if (this.ready) return this.ready;
    this.ready = new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined' || typeof Worker === 'undefined' || typeof WebAssembly === 'undefined') {
        this.failed = true;
        reject(new Error('Engine unavailable'));
        return;
      }
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          this.failed = true;
          reject(new Error('Engine load timeout'));
        }
      }, 20000);
      try {
        this.worker = new Worker(ENGINE_URL);
      } catch (e) {
        this.failed = true;
        clearTimeout(timer);
        reject(e);
        return;
      }
      this.worker.onerror = () => {
        if (!settled) {
          settled = true;
          this.failed = true;
          clearTimeout(timer);
          reject(new Error('Engine failed'));
        }
      };
      this.worker.onmessage = (e: MessageEvent) => {
        const line = typeof e.data === 'string' ? e.data : '';
        if (line === 'uciok') {
          this.send('setoption name Hash value 16');
          this.send('isready');
        } else if (line === 'readyok' && !settled) {
          settled = true;
          clearTimeout(timer);
          resolve();
        } else {
          this.handleLine(line);
        }
      };
      this.send('uci');
    });
    return this.ready;
  }

  private send(cmd: string) {
    this.worker?.postMessage(cmd);
  }

  private handleLine(line: string) {
    if (!this.current) return;
    if (line.startsWith('info') && line.includes(' pv ')) {
      if (/\b(lowerbound|upperbound)\b/.test(line)) return;
      const depth = /\bdepth (\d+)/.exec(line);
      const mpv = /\bmultipv (\d+)/.exec(line);
      const cp = /\bscore cp (-?\d+)/.exec(line);
      const mate = /\bscore mate (-?\d+)/.exec(line);
      const pv = line.split(' pv ')[1].trim().split(/\s+/);
      this.current.lines.set(mpv ? +mpv[1] : 1, {
        move: pv[0],
        pv,
        depth: depth ? +depth[1] : 0,
        cp: cp ? +cp[1] : null,
        mate: mate ? +mate[1] : null,
      });
    } else if (line.startsWith('bestmove')) {
      const { job, lines } = this.current;
      this.current = null;
      this.busy = false;
      const result = [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([, l]) => l);
      const best = line.split(' ')[1];
      if (result.length === 0 && best && best !== '(none)') {
        result.push({ move: best, pv: [best], depth: 0, cp: 0, mate: null });
      }
      job.resolve(result);
      this.pump();
    }
  }

  private pump() {
    if (this.busy || this.queue.length === 0) return;
    const job = this.queue.shift()!;
    this.busy = true;
    this.current = { job, lines: new Map() };
    const { depth, movetime, multipv = 1 } = job.opts;
    this.send(`setoption name MultiPV value ${multipv}`);
    this.send(`position fen ${job.fen}`);
    if (movetime) this.send(`go movetime ${movetime}${depth ? ` depth ${depth}` : ''}`);
    else this.send(`go depth ${depth ?? 12}`);
  }

  async analyse(fen: string, opts: AnalyseOptions = {}): Promise<EngineLine[]> {
    await this.boot();
    return new Promise<EngineLine[]>((resolve, reject) => {
      this.queue.push({ fen, opts, resolve, reject });
      this.pump();
    });
  }

  /** Drop everything that hasn't started yet and stop the current search. */
  cancelAll() {
    const pending = this.queue.splice(0);
    pending.forEach((j) => j.resolve([]));
    if (this.busy) this.send('stop');
  }

  preload() {
    this.boot().catch(() => {});
  }
}

let singleton: StockfishClient | null = null;

export function getEngine(): StockfishClient {
  if (!singleton) singleton = new StockfishClient();
  return singleton;
}
