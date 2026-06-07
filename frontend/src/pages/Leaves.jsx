import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import useConfirm from '../hooks/useConfirm';
import { getErrorMessage } from '../utils/errorHandler';
import { 
  Plus, 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Download
} from 'lucide-react';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { formatDate } from '../utils/formatters';

const Leaves = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [exporting, setExporting] = useState(false);
  
  // Submit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLeaves = async () => {
    try {
      const res = await api.get('leaves/');
      setLeaves(res.data);
      try {
        const balRes = await api.get('leaves/balance/');
        setBalance(balRes.data);
      } catch (balErr) {
        console.log("No leave balance profile", balErr);
      }
    } catch (err) {
      console.error(err);
      toast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleOpenRequest = () => {
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setReason('');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (new Date(startDate) > new Date(endDate)) {
      setFormError("La date de fin doit être supérieure ou égale à la date de début.");
      return;
    }

    setFormError('');
    setFormLoading(true);

    try {
      await api.post('leaves/', {
        start_date: startDate,
        end_date: endDate,
        reason: reason
      });
      toast("Demande de congé soumise avec succès !", "success");
      setModalOpen(false);
      fetchLeaves();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

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
      fetchLeaves();
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
      fetchLeaves();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportIcal = async () => {
    setExporting(true);
    try {
      const response = await api.get('leaves/export-ical/', {
        responseType: 'blob'
      });
      
      // Create a blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'hrflow_calendar.ics');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast("Export iCal effectué avec succès", "success");
    } catch (err) {
      console.error(err);
      toast(getErrorMessage(err), "error");
    } finally {
      setExporting(false);
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    if (filter === 'ALL') return true;
    return leave.status === filter;
  });

  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';

  if (loading) {
    return <Loader size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Congés</h1>
          <p className="text-slate-500 mt-1 font-medium">
            {isAdminOrHR 
              ? "Gestion et approbation des absences collaborateurs"
              : "Suivi de vos demandes d'absence et congés"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportIcal}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Export...' : 'iCal'}
          </button>
          {!isAdminOrHR && (
            <Button
              onClick={handleOpenRequest}
              icon={Plus}
              variant="primary"
            >
              Demander un congé
            </Button>
          )}
        </div>
      </div>

      {balance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Congés utilisés</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{balance.used} {balance.used > 1 ? 'jours' : 'jour'}</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Congés restants</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{balance.remaining} {balance.remaining > 1 ? 'jours' : 'jour'} (sur 30)</p>
            </div>
          </div>
        </div>
      )}

      {/* Boutons de Filtre */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 border border-slate-200 rounded-xl max-w-lg">
        {[
          { key: 'ALL', label: 'Tous' },
          { key: 'PENDING', label: 'En attente' },
          { key: 'APPROVED', label: 'Approuvés' },
          { key: 'REJECTED', label: 'Refusés' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === item.key
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tableau des Demandes */}
      <DataTable
        headers={['Employé', 'Date de Début', 'Date de Fin', 'Motif', 'Statut', ...(isAdminOrHR ? ['Actions'] : [])]}
        items={filteredLeaves}
        emptyTitle="Aucune demande de congé"
        emptyDescription="Aucun congé ne correspond aux critères sélectionnés."
        emptyIcon={CalendarDays}
        renderRow={(leave) => (
          <tr key={leave.id} className="hover:bg-slate-50/50 transition">
            <td className="py-4 px-6 font-bold text-slate-700">{leave.employee_name}</td>
            <td className="py-4 px-6 text-slate-600 font-semibold">{formatDate(leave.start_date)}</td>
            <td className="py-4 px-6 text-slate-600 font-semibold">{formatDate(leave.end_date)}</td>
            <td className="py-4 px-6 text-slate-500 max-w-xs truncate font-medium">{leave.reason}</td>
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
            {isAdminOrHR && (
              <td className="py-4 px-6 text-right">
                {leave.status === 'PENDING' ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => handleApprove(leave.id)}
                      icon={CheckCircle2}
                    >
                      Approuver
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => handleReject(leave.id)}
                      icon={XCircle}
                    >
                      Refuser
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Traitée</span>
                )}
              </td>
            )}
          </tr>
        )}
      />

      {/* Modal Soumission de Congé */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Demande de congé"
        icon={CalendarDays}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Date de début"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <FormField
              label="Date de fin"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <FormField
            label="Motif de l'absence"
            type="textarea"
            rows={4}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Expliquez le motif de votre absence..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={formLoading}
              variant="primary"
            >
              Envoyer la demande
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leaves;
