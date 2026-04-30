import { getDB, saveDB } from '../db';

export interface Term {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  tags: string;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface TermWithAuthor extends Term {
  author_name: string;
  updater_name: string | null;
}

export interface SearchResult extends TermWithAuthor {
  matchField: 'question' | 'answer' | 'tags';
  matchedTags?: string[];
  matchSnippet?: string;
}

function rowToTerm(row: any[]): TermWithAuthor {
  return {
    id: row[0] as number,
    question: row[1] as string,
    answer: row[2] as string,
    category: row[3] as string | null,
    tags: row[4] as string,
    created_by: row[5] as number,
    updated_by: row[6] as number | null,
    created_at: row[7] as string,
    updated_at: row[8] as string,
    author_name: row[9] as string,
    updater_name: row[10] as string | null,
  };
}

const SELECT_SQL = `
  SELECT t.id, t.question, t.answer, t.category, t.tags, t.created_by, t.updated_by,
         t.created_at, t.updated_at, u1.username, u2.username
  FROM terms t
  LEFT JOIN users u1 ON t.created_by = u1.id
  LEFT JOIN users u2 ON t.updated_by = u2.id
`;

export const TermModel = {
  create(question: string, answer: string, category: string | null, tags: string[], createdBy: number): Term {
    const db = getDB();
    db.run(
      'INSERT INTO terms (question, answer, category, tags, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
      [question, answer, category, JSON.stringify(tags), createdBy, createdBy]
    );
    const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number;
    saveDB();
    const result = db.exec('SELECT * FROM terms WHERE id = ?', [id]);
    const vals = result[0].values[0];
    return {
      id: vals[0] as number,
      question: vals[1] as string,
      answer: vals[2] as string,
      category: vals[3] as string | null,
      tags: vals[4] as string,
      created_by: vals[5] as number,
      updated_by: vals[6] as number | null,
      created_at: vals[7] as string,
      updated_at: vals[8] as string,
    };
  },

  findById(id: number): TermWithAuthor | null {
    const db = getDB();
    const result = db.exec(`${SELECT_SQL} WHERE t.id = ?`, [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    return rowToTerm(result[0].values[0]);
  },

  search(query: string, limit: number = 10): SearchResult[] {
    const db = getDB();
    const pattern = `%${query}%`;
    const q = query.toLowerCase();
    const result = db.exec(
      `${SELECT_SQL}
       WHERE t.question LIKE ? OR t.answer LIKE ? OR t.tags LIKE ?
       ORDER BY
         CASE WHEN t.question LIKE ? THEN 0 WHEN t.answer LIKE ? THEN 1 ELSE 2 END,
         t.updated_at DESC
       LIMIT ?`,
      [pattern, pattern, pattern, pattern, pattern, limit]
    );
    if (result.length === 0) return [];

    return result[0].values.map(row => {
      const term = rowToTerm(row);
      const questionMatch = term.question.toLowerCase().includes(q);
      const answerMatch = term.answer.toLowerCase().includes(q);
      let matchedTags: string[] = [];

      try {
        const tags: string[] = JSON.parse(term.tags);
        matchedTags = tags.filter(t => t.toLowerCase().includes(q));
      } catch {}

      let matchField: 'question' | 'answer' | 'tags';
      let matchSnippet: string | undefined;

      if (questionMatch) {
        matchField = 'question';
      } else if (answerMatch) {
        matchField = 'answer';
        const idx = term.answer.toLowerCase().indexOf(q);
        const start = Math.max(0, idx - 30);
        const end = Math.min(term.answer.length, idx + query.length + 30);
        matchSnippet = (start > 0 ? '...' : '') + term.answer.slice(start, end) + (end < term.answer.length ? '...' : '');
      } else {
        matchField = 'tags';
      }

      return { ...term, matchField, matchedTags, matchSnippet };
    });
  },

  latest(limit: number = 20): TermWithAuthor[] {
    const db = getDB();
    const result = db.exec(`${SELECT_SQL} ORDER BY t.created_at DESC LIMIT ?`, [limit]);
    if (result.length === 0) return [];
    return result[0].values.map(rowToTerm);
  },

  update(id: number, question: string, answer: string, category: string | null, tags: string[], updatedBy: number): boolean {
    const db = getDB();
    db.run(
      'UPDATE terms SET question = ?, answer = ?, category = ?, tags = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [question, answer, category, JSON.stringify(tags), updatedBy, id]
    );
    const changes = db.getRowsModified();
    saveDB();
    return changes > 0;
  },

  delete(id: number): boolean {
    const db = getDB();
    db.run('DELETE FROM terms WHERE id = ?', [id]);
    const changes = db.getRowsModified();
    saveDB();
    return changes > 0;
  },

  filter(category?: string, tags?: string[], limit: number = 50): TermWithAuthor[] {
    const db = getDB();
    const conditions: string[] = [];
    const params: any[] = [];

    if (category) {
      conditions.push('t.category = ?');
      params.push(category);
    }
    if (tags && tags.length > 0) {
      tags.forEach(t => {
        conditions.push("t.tags LIKE ?");
        params.push(`%${t}%`);
      });
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = db.exec(`${SELECT_SQL} ${where} ORDER BY t.updated_at DESC LIMIT ?`, [...params, limit]);
    if (result.length === 0) return [];
    return result[0].values.map(rowToTerm);
  },

  getCategories(): string[] {
    const db = getDB();
    const result = db.exec('SELECT DISTINCT category FROM terms WHERE category IS NOT NULL ORDER BY category');
    if (result.length === 0) return [];
    return result[0].values.map(row => row[0] as string);
  },

  getTags(): string[] {
    const db = getDB();
    const result = db.exec('SELECT tags FROM terms');
    if (result.length === 0) return [];
    const tagSet = new Set<string>();
    for (const row of result[0].values) {
      try {
        const arr = JSON.parse(row[0] as string);
        if (Array.isArray(arr)) arr.forEach(t => tagSet.add(t));
      } catch {}
    }
    return Array.from(tagSet).sort();
  },

  count(): number {
    const db = getDB();
    const result = db.exec('SELECT COUNT(*) FROM terms');
    return result[0].values[0][0] as number;
  }
};
