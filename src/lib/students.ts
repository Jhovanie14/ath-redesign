import type { Session } from "./auth";

export interface StudentAccount {
  name: string;
  email: string;
  password: string;
}

// Mutable — unlike DEMO_ACCOUNTS in auth.ts, registration needs to add to
// this at runtime. Resets on server restart, same as every other mock
// store in this app (see enquiries.ts).
let students: StudentAccount[] = [
  { name: "Freya Marsh", email: "student@ath.demo", password: "student123" },
];

export function findStudentAccount(
  email: string,
  password: string,
): Session | null {
  const match = students.find(
    (s) =>
      s.email.toLowerCase() === email.trim().toLowerCase() &&
      s.password === password,
  );
  return match ? { role: "student", name: match.name, email: match.email } : null;
}

export function registerStudent(input: {
  name: string;
  email: string;
  password: string;
}): { session: Session } | { error: string } {
  const email = input.email.trim().toLowerCase();
  if (students.some((s) => s.email.toLowerCase() === email)) {
    return { error: "An account with this email already exists." };
  }
  const account: StudentAccount = {
    name: input.name.trim(),
    email,
    password: input.password,
  };
  students = [...students, account];
  return { session: { role: "student", name: account.name, email: account.email } };
}

/** Renames a student may make to their own profile. `updates.password`
 * blank/undefined keeps the existing password (matches the "optional to
 * change" convention on most account-settings forms in this app). */
export function updateStudentAccount(
  currentEmail: string,
  updates: { name: string; email: string; password?: string },
): { session: Session } | { error: string } {
  const index = students.findIndex(
    (s) => s.email.toLowerCase() === currentEmail.trim().toLowerCase(),
  );
  if (index === -1) return { error: "Account not found." };

  const nextEmail = updates.email.trim().toLowerCase();
  const emailTaken = students.some(
    (s, i) => i !== index && s.email.toLowerCase() === nextEmail,
  );
  if (emailTaken) {
    return { error: "An account with this email already exists." };
  }

  const current = students[index];
  const updated: StudentAccount = {
    name: updates.name.trim(),
    email: nextEmail,
    password: updates.password ? updates.password : current.password,
  };
  students = [...students.slice(0, index), updated, ...students.slice(index + 1)];
  return { session: { role: "student", name: updated.name, email: updated.email } };
}
