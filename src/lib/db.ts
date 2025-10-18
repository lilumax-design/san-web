type User = { id: string; email: string; passwordHash: string };

const users = new Map<string, User>(); 

export function getUserByEmail(email: string) {
  return users.get(email.toLowerCase()) || null;
}

export function addUser(u: User) {
  users.set(u.email.toLowerCase(), u);
}

export function resetAll() { users.clear(); } 
