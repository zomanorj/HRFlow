import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Lock, User } from 'lucide-react';
import FormField from '../components/FormField';
import Button from '../components/Button';
import useToast from '../hooks/useToast';
import { getErrorMessage } from '../utils/errorHandler';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const testAccounts = [
    { username: 'admin', role: 'Admin', label: 'Marc (Admin)' },
    { username: 'rh', role: 'RH', label: 'Lalatiana (RH)' },
    { username: 'andry.andria', role: 'Employé', label: 'Andry (Dev)' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      toast("Connexion réussie. Bienvenue dans HRFlow !", "success");
      navigate('/');
    } else {
      const formattedError = getErrorMessage(result.error);
      setError(formattedError);
      toast(formattedError, "error");
      setLoading(false);
    }
  };

  const handleFillAccount = (userVal) => {
    setUsername(userVal);
    setPassword('HRFlowPassword123!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 via-slate-50 to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
            H
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-800">
            HR<span className="text-indigo-600">Flow</span>
          </span>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Connexion à votre espace
        </h2>
        <p className="mt-2 text-center text-sm font-semibold text-slate-400">
          Gestion des Ressources Humaines
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 animate-fade-in">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-100 sm:rounded-2xl border border-slate-100">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 font-semibold animate-pulse">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormField
              label="Identifiant / Email"
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={User}
              placeholder="Ex: jean.dupont"
            />

            <FormField
              label="Mot de passe"
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              placeholder="••••••••"
            />

            <div>
              <Button
                type="submit"
                loading={loading}
                className="w-full py-3"
              >
                Se connecter
              </Button>
            </div>
          </form>

          {/* Test accounts QoL shortcut */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
              Comptes de test (cliquez pour remplir)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {testAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleFillAccount(acc.username)}
                  className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 hover:shadow-sm transition-all text-center group cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {acc.label}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    Rôle : {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-6 border-t border-slate-100 pt-6 text-center">
            <span className="text-xs text-slate-400 font-semibold">
              HRFlow - Plateforme de Gestion RH
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
