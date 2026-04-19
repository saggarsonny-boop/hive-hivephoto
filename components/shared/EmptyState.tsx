import Link from "next/link";

interface Props {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-hive-surface border border-hive-border flex items-center justify-center mb-4 text-2xl">
        📭
      </div>
      <h3 className="text-white font-medium text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 text-sm max-w-xs">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-4 px-5 py-2.5 bg-hive-gold text-black font-medium rounded-lg text-sm hover:bg-hive-amber transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
