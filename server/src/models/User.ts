import { getDB, saveDB } from '../db';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: 'admin' | 'contributor' | 'viewer';
  created_at: string;
}

export type UserPublic = Omit<User, 'password_hash'>;

function rowToUser(row: any[]): User {
  return {
    id: row[0] as number,
    username: row[1] as string,
    password_hash: row[2] as string,
    role: row[3] as 'admin' | 'contributor' | 'viewer',
    created_at: row[4] as string,
  };
}

function rowToUserPublic(row: any[]): UserPublic {
  return {
    id: row[0] as number,
    username: row[1] as string,
    role: row[2] as 'admin' | 'contributor' | 'viewer',
    created_at: row[3] as string,
  };
}

export const UserModel = {
  create(username: string, password: string, role: 'admin' | 'contributor' | 'viewer' = 'viewer'): UserPublic {
    const hash = bcrypt.hashSync(password, 10);
    const db = getDB();
    db.run('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [username, hash, role]);
    const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number;
    saveDB();
    return this.findById(id)!;
  },

  findById(id: number): UserPublic | null {
    const db = getDB();
    const result = db.exec('SELECT id, username, role, created_at FROM users WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    return rowToUserPublic(result[0].values[0]);
  },

  findByUsername(username: string): User | null {
    const db = getDB();
    const result = db.exec('SELECT * FROM users WHERE username = ?', [username]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    return rowToUser(result[0].values[0]);
  },

  findAll(): UserPublic[] {
    const db = getDB();
    const result = db.exec('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
    if (result.length === 0) return [];
    return result[0].values.map(rowToUserPublic);
  },

  updateRole(id: number, role: string): boolean {
    const db = getDB();
    db.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    const changes = db.getRowsModified();
    saveDB();
    return changes > 0;
  },

  delete(id: number): boolean {
    const db = getDB();
    // Clear foreign key references before deleting
    db.run('DELETE FROM terms WHERE created_by = ?', [id]);
    db.run('UPDATE terms SET updated_by = NULL WHERE updated_by = ?', [id]);
    db.run('DELETE FROM search_history WHERE user_id = ?', [id]);
    db.run('DELETE FROM users WHERE id = ?', [id]);
    const changes = db.getRowsModified();
    saveDB();
    return changes > 0;
  },

  verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
};
