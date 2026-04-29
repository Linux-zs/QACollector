import { Link } from 'react-router-dom';

interface Term {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  tags: string;
  author_name: string;
  created_at: string;
}

export default function TermCard({ term }: { term: Term }) {
  const tags: string[] = (() => { try { return JSON.parse(term.tags); } catch { return []; } })();

  return (
    <Link to={`/term/${term.id}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all">
      <h3 className="font-semibold text-gray-900 text-lg mb-2">{term.question}</h3>
      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{term.answer}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {term.category && (
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{term.category}</span>
        )}
        {tags.map(tag => (
          <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">#{tag}</span>
        ))}
        <span className="text-xs text-gray-400 ml-auto">{term.author_name}</span>
      </div>
    </Link>
  );
}
