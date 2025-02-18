'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';



export default function Home() {

  const router = useRouter();


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: any) => {
    e.preventDefault();

    const res = await fetch('/api/auth/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    console.log(data);

    

    if (res.ok) {
      document.cookie = `token=${data.token}; path=/`;
      router.push('/protected/'); 
    } else {
      setError(data.error || 'Erro ao fazer login');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        required
      />
      <button type="submit">Entrar</button>
      {error && <p>{error}</p>}
    </form>
  );
}

