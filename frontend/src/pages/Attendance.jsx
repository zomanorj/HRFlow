import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { getErrorMessage } from '../utils/errorHandler';
import { 
  Clock, 
  Search, 
  Calendar,
  Hourglass,
  ArrowDownRight,
  ArrowUpRight,
  Download
} from 'lucide-react';
import FormField from '../components/FormField';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { formatDate, formatShortDate, formatTime, formatHours } from '../utils/formatters';

const Attendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchAttendanceLogs = async () => {
    try {
      const res = await api.get('attendance/');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
      toast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPayroll = async () => {
    setExporting(true);
    try {
      const response = await api.get('attendance/export-payroll/', {
        responseType: 'blob'
      });
      
      // Create a blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payroll_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast("Export CSV effectué avec succès", "success");
    } catch (err) {
      console.error(err);
      toast(getErrorMessage(err), "error");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchAttendanceLogs();
  }, []);

  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';

  // Filter logs based on search query (coworker name) and date
  const filteredLogs = logs.filter(log => {
    const nameQuery = search.toLowerCase();
    const fullName = log.employee_name?.toLowerCase() || '';
    const matchesName = fullName.includes(nameQuery);

    const matchesDate = dateFilter ? log.date === dateFilter : true;

    return matchesName && matchesDate;
  });

  if (loading) {
    return <Loader size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Présences</h1>
        <p className="text-slate-500 mt-1 font-medium">
          {isAdminOrHR 
            ? "Historique global des pointages de l'entreprise"
            : "Historique personnel de vos heures travaillées"}
        </p>
      </div>

      {/* Barre de Recherche et de Filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        {isAdminOrHR ? (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:max-w-md">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom d'employé..."
              className="flex-1 text-sm bg-transparent outline-none placeholder-slate-400 text-slate-700 font-semibold"
            />
          </div>
        ) : (
          <div className="text-sm font-bold text-slate-500">
            Total : {filteredLogs.length} pointages enregistrés
          </div>
        )}

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-auto">
          <Calendar className="h-5 w-5 text-slate-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-sm bg-transparent outline-none text-slate-700 font-semibold w-full"
          />
          {dateFilter && (
            <button 
              onClick={() => setDateFilter('')}
              className="text-xs text-rose-500 font-bold hover:text-rose-700 transition"
            >
              Effacer
            </button>
          )}
        </div>

        {isAdminOrHR && (
          <button
            onClick={handleExportPayroll}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Export...' : 'Export CSV'}
          </button>
        )}
      </div>

      {/* Tableau d'historique */}
      <DataTable
        headers={['Employé', 'Date', 'Check In (Arrivée)', 'Check Out (Départ)', 'Heures travaillées']}
        items={filteredLogs}
        emptyTitle="Aucun pointage trouvé"
        emptyDescription="Aucun enregistrement de présence ne correspond aux critères de recherche."
        emptyIcon={Clock}
        renderRow={(log) => (
          <tr key={log.id} className="hover:bg-slate-50/50 transition">
            <td className="py-4 px-6 font-bold text-slate-700">
              {log.employee_name}
            </td>
            <td className="py-4 px-6 text-slate-500 font-semibold">
              {formatShortDate(log.date)}
            </td>
            <td className="py-4 px-6">
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <ArrowDownRight className="h-4 w-4" />
                <span>{formatTime(log.check_in)}</span>
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <ArrowUpRight className="h-4 w-4" />
                <span>{formatTime(log.check_out)}</span>
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                <Hourglass className="h-4 w-4 text-indigo-400" />
                <span>{formatHours(log.hours_worked)}</span>
              </div>
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default Attendance;
