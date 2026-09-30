import { notFound } from 'next/navigation';
import { ALL_LESSONS, findLesson } from '@/lib/curriculum';
import LessonPlayer from '@/components/lesson/LessonPlayer';

export function generateStaticParams() {
  return ALL_LESSONS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = findLesson(id);
  return { title: found ? `${found.lesson.title} · Chess 4 Kids` : 'Lesson · Chess 4 Kids' };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!findLesson(id)) notFound();
  return <LessonPlayer id={id} />;
}
