export interface User {
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user?: User;
}

export interface ApiResponse {
  message: string;
  user?: User;
}

// NextAuth type extensions
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
    };
  }

  interface User {
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
  }
}