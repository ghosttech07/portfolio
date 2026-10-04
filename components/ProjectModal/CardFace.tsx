import Image from 'next/image';
import type { Project } from '@/data/content';
import { pad2 } from '@/lib/utils';

/**
 * DOM version of a project card. Used by the mobile carousel and as the
 * "ghost" that morphs into the case-study panel (so the 3D card and the panel
 * share the same face during the transition).
 */
export default function CardFace({
  project,
  index,
  sizes = '(max-width: 768px) 80vw, 400px',
  priority = false,
}: {
  project: Project;
  index?: number;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#111]">
      <Image
        src={project.thumbnail}
        alt={`${project.title} — ${project.category} project thumbnail`}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={project.thumbnail.endsWith('.svg')}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
        {project.category}
      </span>
      {index !== undefined && (
        <span className="absolute right-4 top-4 font-display text-sm text-white">{pad2(index + 1)}</span>
      )}
      <h3 className="absolute inset-x-4 bottom-4 font-display text-3xl uppercase leading-none text-white">
        {project.title}
      </h3>
    </div>
  );
}
