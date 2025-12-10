
import { User } from "../types";

const MOCK_DELAY = 1200;

export const authService = {
  
  async login(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email.includes('@')) {
          reject(new Error("Invalid email format"));
          return;
        }
        if (password.length < 6) {
          reject(new Error("Password must be at least 6 characters"));
          return;
        }

        // Mock Success
        const user: User = {
          id: btoa(email),
          email: email,
          name: email.split('@')[0],
          role: 'FOUNDER', // Default
          onboarded: false
        };

        // Persist session
        localStorage.setItem('entreprenos_session', JSON.stringify(user));
        
        resolve(user);
      }, MOCK_DELAY);
    });
  },

  async register(name: string, email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email.includes('@')) {
          reject(new Error("Invalid email format"));
          return;
        }
        
        const user: User = {
          id: btoa(email),
          email: email,
          name: name,
          role: 'FOUNDER',
          onboarded: false
        };

        localStorage.setItem('entreprenos_session', JSON.stringify(user));
        resolve(user);
      }, MOCK_DELAY);
    });
  },

  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('entreprenos_session');
        resolve();
      }, 500);
    });
  },

  async getSession(): Promise<User | null> {
    // Simulate token check delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem('entreprenos_session');
        if (stored) {
          try {
            const user = JSON.parse(stored);
            resolve(user);
          } catch {
            localStorage.removeItem('entreprenos_session');
            resolve(null);
          }
        } else {
          resolve(null);
        }
      }, 500);
    });
  }
};
