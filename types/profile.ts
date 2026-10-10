// types/profile.ts

export interface Profile {
  id: string;
  first_name: string;
  username: string;
  utr: number | null;
  usta_level: number | null;
}

// USTA NTRP levels, 1.5 to 7.0 in half steps
export const USTA_LEVELS = Array.from({ length: 12 }, (_, i) => (1.5 + i * 0.5).toFixed(1));

export const USERNAME_PATTERN = "^[a-z0-9_]{3,20}$";
