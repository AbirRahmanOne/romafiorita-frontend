import { type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@rf/ui';

export function Login() {
  const navigate = useNavigate();

  // Phase 4 wires this to POST /v1/admin/auth/login (cookie auth).
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    navigate('/');
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      <form onSubmit={onSubmit} className="card flex w-full max-w-sm flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary font-bold text-white">
            RF
          </span>
          <span className="text-lg font-bold">Roma Fiorita admin</span>
        </div>
        <label className="text-sm font-medium">
          Email
          <Input type="email" name="email" required autoComplete="username" className="mt-1" />
        </label>
        <label className="text-sm font-medium">
          Password
          <Input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="mt-1"
          />
        </label>
        <Button type="submit" variant="primary" className="w-full">
          Sign in
        </Button>
      </form>
    </div>
  );
}
