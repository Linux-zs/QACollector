import { useNavigate } from 'react-router-dom';
import TermForm from '../components/TermForm';
import { api } from '../api/client';

export default function CreateTermPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新建词条</h1>
      <TermForm
        submitLabel="创建词条"
        onSubmit={async (data) => {
          const term = await api.createTerm(data);
          navigate(`/term/${term.id}`);
        }}
      />
    </div>
  );
}
