import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  nickname: string | null;
  login: (nickname: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [nickname, setNickname] = useState<string | null>('사용자');

  useEffect(() => {
    // 앱 시작 시 저장된 로그인 정보 확인, 없으면 기본값 사용
    const savedNickname = localStorage.getItem('userNickname');
    if (savedNickname) {
      setNickname(savedNickname);
    } else {
      // 기본 닉네임 설정
      localStorage.setItem('userNickname', '사용자');
      const nicknameHash = 'user'.toLowerCase().replace(/\s+/g, '_');
      const userId = `user_${nicknameHash}_${Date.now()}`;
      localStorage.setItem('userId', userId);
    }
    setIsAuthenticated(true);
  }, []);

  const login = (nickname: string) => {
    if (nickname.trim()) {
      const trimmedNickname = nickname.trim();
      localStorage.setItem('userNickname', trimmedNickname);
      setNickname(trimmedNickname);
      setIsAuthenticated(true);
      
      // userId도 업데이트 (닉네임 기반)
      const nicknameHash = trimmedNickname.toLowerCase().replace(/\s+/g, '_');
      const userId = `user_${nicknameHash}_${Date.now()}`;
      localStorage.setItem('userId', userId);
    }
  };

  const logout = () => {
    localStorage.removeItem('userNickname');
    // userId는 유지 (같은 브라우저에서 다시 로그인할 수 있도록)
    setNickname(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, nickname, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

