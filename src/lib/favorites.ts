// src/lib/favorites.ts
//
// A student's saved/bookmarked trainers, backed by a mutable in-memory
// store — same "mock now, wire up later" seam as students.ts and
// enquiries.ts. Resets on server restart.
//
// trainerSlug is effectively always the one demo trainer account today —
// same known limitation Enquiry.courseTitle already documents in
// enquiries.ts. Revisit both together once there's more than one trainer
// account to route between.

export interface SavedTrainer {
  studentEmail: string;
  trainerSlug: string;
  savedAt: string; // ISO datetime
}

let savedTrainers: SavedTrainer[] = [];

export function getSavedTrainersForStudent(email: string): SavedTrainer[] {
  const target = email.trim().toLowerCase();
  return savedTrainers.filter((s) => s.studentEmail.toLowerCase() === target);
}

export function isTrainerSaved(email: string, trainerSlug: string): boolean {
  const target = email.trim().toLowerCase();
  return savedTrainers.some(
    (s) => s.studentEmail.toLowerCase() === target && s.trainerSlug === trainerSlug,
  );
}

/** Adds or removes the (student, trainer) pair. Returns the new saved state. */
export function toggleSavedTrainer(
  email: string,
  trainerSlug: string,
  savedAt: string,
): boolean {
  const target = email.trim().toLowerCase();
  const exists = savedTrainers.some(
    (s) => s.studentEmail.toLowerCase() === target && s.trainerSlug === trainerSlug,
  );
  if (exists) {
    savedTrainers = savedTrainers.filter(
      (s) => !(s.studentEmail.toLowerCase() === target && s.trainerSlug === trainerSlug),
    );
    return false;
  }
  savedTrainers = [...savedTrainers, { studentEmail: target, trainerSlug, savedAt }];
  return true;
}
