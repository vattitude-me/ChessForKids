'use client';

import React from 'react';

interface PieceProps {
  fill?: string;
  square?: string;
  svgStyle?: React.CSSProperties;
}

type PieceRenderFn = (props?: PieceProps) => React.JSX.Element;

const pieceConfig: Record<string, { src: string; maxWidth: string; paddingTop: string }> = {
  wK: { src: '/pieces/w-king.png', maxWidth: '50%', paddingTop: '5%' },
  wQ: { src: '/pieces/w-queen.png', maxWidth: '50%', paddingTop: '5%' },
  wR: { src: '/pieces/w-rook.png', maxWidth: '42%', paddingTop: '10%' },
  wB: { src: '/pieces/w-bishop.png', maxWidth: '42%', paddingTop: '8%' },
  wN: { src: '/pieces/w-knight.png', maxWidth: '45%', paddingTop: '8%' },
  wP: { src: '/pieces/w-pawn.png', maxWidth: '38%', paddingTop: '15%' },
  bK: { src: '/pieces/b-king.png', maxWidth: '50%', paddingTop: '5%' },
  bQ: { src: '/pieces/b-queen.png', maxWidth: '50%', paddingTop: '5%' },
  bR: { src: '/pieces/b-rook.png', maxWidth: '42%', paddingTop: '10%' },
  bB: { src: '/pieces/b-bishop.png', maxWidth: '42%', paddingTop: '8%' },
  bN: { src: '/pieces/b-knight.png', maxWidth: '45%', paddingTop: '8%' },
  bP: { src: '/pieces/b-pawn.png', maxWidth: '38%', paddingTop: '15%' },
};

export const fantasyPieces: Record<string, PieceRenderFn> = Object.fromEntries(
  Object.entries(pieceConfig).map(([key, { src, maxWidth, paddingTop }]) => [
    key,
    (props: PieceProps = {}) => (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingTop, ...props.svgStyle }}>
        <img
          src={src}
          alt={key}
          style={{ maxWidth, height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
          draggable={false}
        />
      </div>
    ),
  ])
);
