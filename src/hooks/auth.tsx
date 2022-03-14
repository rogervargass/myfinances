import React, { createContext, ReactNode, useContext, useState } from 'react';
import * as AuthSession from 'expo-auth-session';

const { CLIENT_ID } = process.env;
const { REDIRECT_ID } = process.env;

interface AuthProviderProps {
  children: ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface AuthContextData {
  user: User;
  signInWithGoogle(): Promise<void>;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
  };
  type: string;
}

const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User);

  async function signInWithGoogle() {
    try {
      const baseUrl = 'https://accounts.google.com/o/oauth2/v2/';
      const RESPONSE_TYPE = 'token';
      const SCOPE = encodeURI('profile email');

      const authUrl = `${baseUrl}auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_ID}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

      const { type, params } = (await AuthSession.startAsync({ authUrl })) as AuthorizationResponse;

      if (type === 'success') {
        const reponse = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`
        );

        const userinfo = await reponse.json();

        setUser({
          id: userinfo.id,
          email: userinfo.email,
          name: userinfo.given_name,
          photo: userinfo.picture,
        });
      }
    } catch (error) {
      throw new Error(error as string);
    }
  }

  return <AuthContext.Provider value={{ user, signInWithGoogle }}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { useAuth, AuthProvider };
