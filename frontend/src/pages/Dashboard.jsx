import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import useConfirm from '../hooks/useConfirm';
import { getErrorMessage } from '../utils/errorHandler';
import { 
  Users, 
  Building2, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Play,
  Square,
  AlertCircle
} from 'lucide-react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { formatTime, formatLongDate, formatFullTime } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [data, setData] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('dashboard/');
      setData(res.data);
      try {
        const balRes = await api.get('leaves/balance/');
        setBalance(balRes.data);
      } catch (balErr) {
        console.log("No leave balance profile", balErr);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Clock for pointage
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleApprove = async (id) => {
    const hasConfirmed = await confirm({
      title: "Approuver la demande de congé",
      message: "Êtes-vous sûr de vouloir approuver cette demande de congé ?",
      confirmVariant: "success",
      confirmLabel: "Approuver"
    });
    if (!hasConfirmed) return;

    setActionLoading(true);
    try {
      await api.post(`leaves/${id}/approve/`);
      toast("La demande de congé a été approuvée avec succès.", "success");
      fetchDashboardData();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    const hasConfirmed = await confirm({
      title: "Refuser la demande de congé",
      message: "Êtes-vous sûr de vouloir refuser cette demande de congé ?",
      confirmVariant: "danger",
      confirmLabel: "Refuser"
    });
    if (!hasConfirmed) return;

    setActionLoading(true);
    try {
      await api.post(`leaves/${id}/reject/`);
      toast("La demande de congé a été refusée.", "info");
      fetchDashboardData();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await api.post('attendance/check-in/');
      toast("Check-in effectué avec succès. Bonne journée de travail !", "success");
      fetchDashboardData();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await api.post('attendance/check-out/');
      toast("Check-out enregistré avec succès. Bonne soirée !", "success");
      fetchDashboardData();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loader size="lg" fullScreen={false} className="mt-20" />;
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-center gap-3">
        <AlertCircle className="h-6 w-6" />
        <span className="font-semibold">{error}</span>
      </div>
    );
  }

  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tableau de bord</h1>
        <p className="text-slate-500 mt-1 font-medium">
          {isAdminOrHR 
            ? "Aperçu global de l'activité de l'entreprise"
            : "Suivi personnel de vos présences et congés"}
        </p>
      </div>

      {/* Cartes Statistiques */}
      {isAdminOrHR ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Employés actifs"
            value={data?.stats?.employees_count || 0}
            icon={Users}
            bgIconClass="bg-indigo-50 text-indigo-600 border border-indigo-100"
          />
          <StatCard
            title="Départements"
            value={data?.stats?.departments_count || 0}
            icon={Building2}
            bgIconClass="bg-purple-50 text-purple-600 border border-purple-100"
          />
          <StatCard
            title="Congés en attente"
            value={data?.stats?.pending_leaves_count || 0}
            icon={CalendarDays}
            bgIconClass="bg-amber-50 text-amber-600 border border-amber-100"
          />
          <StatCard
            title="Présences aujourd'hui"
            value={data?.stats?.today_attendance_count || 0}
            icon={Clock}
            bgIconClass="bg-emerald-50 text-emerald-600 border border-emerald-100"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Heures ce mois-ci"
            value={`${data?.stats?.total_hours_this_month || 0}h`}
            icon={Clock}
            bgIconClass="bg-indigo-50 text-indigo-600 border border-indigo-100"
          />
          <StatCard
            title="Mes congés en attente"
            value={data?.stats?.pending_leaves || 0}
            icon={CalendarDays}
            bgIconClass="bg-amber-50 text-amber-600 border border-amber-100"
          />
          <StatCard
            title="Mon Solde de Congés"
            value={balance ? `${balance.remaining} jours` : "30 jours"}
            icon={CheckCircle2}
            bgIconClass="bg-purple-50 text-purple-600 border border-purple-100"
          />
          <StatCard
            title="Congés approuvés"
            value={data?.stats?.approved_leaves || 0}
            icon={CheckCircle2}
            bgIconClass="bg-emerald-50 text-emerald-600 border border-emerald-100"
          />
        </div>
      )}

      {/* Zone Spécifique par Rôle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isAdminOrHR ? (
          /* Admin/HR Panel: Recent leaves list */
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-3">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Demandes de congés récentes</h3>
            <DataTable
              headers={['Employé', 'Période', 'Motif', 'Statut', 'Actions']}
              items={data?.recent_leaves || []}
              emptyTitle="Aucune demande de congé"
              emptyDescription="Toutes les demandes de congés ont été traitées."
              emptyIcon={CalendarDays}
              renderRow={(leave) => (
                <tr key={leave.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 font-bold text-slate-700">{leave.employee_name}</td>
                  <td className="py-4 px-6 text-slate-500">
                    Du {new Date(leave.start_date).toLocaleDateString()} au {new Date(leave.end_date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-slate-500 max-w-xs truncate">{leave.reason}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      leave.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                      leave.status === 'REJECTED' ? 'bg-rose-50 text-rose-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {leave.status === 'APPROVED' ? 'Approuvé' :
                       leave.status === 'REJECTED' ? 'Refusé' : 'En attente'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {leave.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleApprove(leave.id)}
                          icon={CheckCircle2}
                          title="Approuver"
                        >
                          Approuver
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleReject(leave.id)}
                          icon={XCircle}
                          title="Refuser"
                        >
                          Refuser
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">Traitée</span>
                    )}
                  </td>
                </tr>
              )}
            />
          </div>
        ) : (
          /* Employee Panel: Check-in/out */
          <>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Horodatage & Pointage</h3>
                <p className="text-sm text-slate-400 font-medium">Enregistrez vos heures d'arrivée et de départ quotidiennement.</p>
              </div>

              <div className="my-8 text-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-5xl font-extrabold tracking-tight text-slate-800">
                  {formatFullTime(currentTime)}
                </p>
                <p className="text-sm text-slate-400 font-semibold mt-2">
                  {formatLongDate(currentTime)}
                </p>
              </div>

              {/* Status indicators */}
              <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500 font-bold">Statut du jour :</span>
                {data?.stats?.status_today === 'NOT_CHECKED_IN' && (
                  <span className="text-slate-500 font-bold">Non pointé</span>
                )}
                {data?.stats?.status_today === 'CHECKED_IN' && (
                  <span className="text-indigo-600 font-bold">Présent (Pointage effectué)</span>
                )}
                {data?.stats?.status_today === 'CHECKED_OUT' && (
                  <span className="text-emerald-600 font-bold">Journée terminée (Départ enregistré)</span>
                )}
              </div>

              <div className="flex gap-4">
                {data?.stats?.status_today === 'NOT_CHECKED_IN' && (
                  <Button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    variant="primary"
                    className="w-full py-3.5"
                    icon={Play}
                  >
                    Pointer Arrivée (Check-in)
                  </Button>
                )}
                {data?.stats?.status_today === 'CHECKED_IN' && (
                  <Button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    variant="success"
                    className="w-full py-3.5"
                    icon={Square}
                  >
                    Pointer Départ (Check-out)
                  </Button>
                )}
                {data?.stats?.status_today === 'CHECKED_OUT' && (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full py-3.5 cursor-not-allowed"
                  >
                    Pointage effectué pour aujourd'hui
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Horaires du jour</h3>
                <p className="text-sm text-slate-400 font-medium">Résumé de votre horodatage pour aujourd'hui.</p>
              </div>

              <div className="space-y-4 my-6">
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-sm">
                  <span className="text-slate-400 font-semibold">Arrivée (In)</span>
                  <span className="font-bold text-slate-700">
                    {formatTime(data?.today_attendance?.check_in)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-sm">
                  <span className="text-slate-400 font-semibold">Départ (Out)</span>
                  <span className="font-bold text-slate-700">
                    {formatTime(data?.today_attendance?.check_out)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 text-sm font-bold">
                  <span className="text-indigo-600">Total travaillé</span>
                  <span className="text-indigo-600">
                    {data?.stats?.status_today === 'CHECKED_OUT' 
                      ? `${data.stats.total_hours_this_month} heures`
                      : 'Calculé après check-out'}
                  </span>
                </div>
              </div>

              <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl border border-indigo-100 text-xs font-semibold text-center leading-relaxed">
                Merci de respecter vos horaires contractuels. En cas d'erreur de pointage, contactez le département RH.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
