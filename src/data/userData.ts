import { User } from "@/contexts/AuthContext";

// User database (simulated - in production, use actual database)
export interface StoredUser extends User {
  password: string; // Hashed in production
  createdAt: Date;
}

// Initialize with some demo users
export let users: StoredUser[] = [
  {
    id: "user-1",
    name: "Dr. John Smith",
    email: "doctor@clinic.com",
    phone: "9876543210",
    role: "doctor",
    password: "doctor123", // In production, this should be hashed
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "user-2",
    name: "Patient Demo",
    email: "patient@clinic.com",
    phone: "9876543211",
    role: "patient",
    password: "patient123", // In production, this should be hashed
    createdAt: new Date("2024-01-01"),
  },
];

// Helper function to find user by email
export const findUserByEmail = (email: string): StoredUser | undefined => {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

// Helper function to create new user
export const createUser = (userData: Omit<StoredUser, 'id' | 'createdAt'>): StoredUser => {
  const newUser: StoredUser = {
    ...userData,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  };
  users.push(newUser);
  return newUser;
};

// Helper function to update user
export const updateUser = (userId: string, updates: Partial<User>): StoredUser | null => {
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) return null;

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
  };

  return users[userIndex];
};

// Helper function to change password
export const changePassword = (userId: string, currentPassword: string, newPassword: string): boolean => {
  const user = users.find(u => u.id === userId);
  if (!user) return false;

  if (user.password !== currentPassword) return false;

  user.password = newPassword;
  return true;
};
