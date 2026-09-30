import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chess 4 Kids',
    short_name: 'Chess 4 Kids',
    description: 'Learn chess step by step with lessons, puzzles and friendly computer opponents.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff8ee',
    theme_color: '#5b4df5',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
