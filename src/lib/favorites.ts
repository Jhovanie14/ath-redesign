// src/lib/favorites.ts
//
// A student's saved/bookmarked trainers, backed by a mutable in-memory
// store — same "mock now, wire up later" seam as students.ts and
// enquiries.ts. Resets on server restart.
//
// trainerSlug is validated against the repository at write time (see
// toggleSavedTrainerAction in src/app/student/saved/actions.ts) rather than
// hardcoded — every one of the app's public trainer profiles can be saved.

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
