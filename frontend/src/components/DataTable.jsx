import React from 'react';
import Loader from './Loader';
import EmptyState from './EmptyState';
import { Inbox } from 'lucide-react';

/**
 * Reusable DataTable component.
 * @param {Object} props
 * @param {string[]} props.headers - Array of header strings
 * @param {any[]} props.items - Array of items to display
 * @param {function} props.renderRow - Function to render each row: (item, index) => ReactNode
 * @param {boolean} [props.loading=false] - Loading state
 * @param {string} [props.emptyTitle='Aucune donnée'] - Empty title message
 * @param {string} [props.emptyDescription=''] - Empty description message
 * @param {React.ComponentType} [props.emptyIcon] - Empty icon
 */
const DataTable = ({
  headers = [],
  items = [],
  renderRow,
  loading = false,
  emptyTitle = 'Aucune donnée disponible',
  emptyDescription = 'Il n\'y a actuellement aucun élément à afficher.',
  emptyIcon = Inbox,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12">
        <Loader size="md" />
        <p className="text-center text-sm text-slate-400 mt-2 font-medium">Chargement des données...</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="my-2">
        <EmptyState 
          title={emptyTitle} 
          description={emptyDescription} 
          icon={emptyIcon} 
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
              {headers.map((header, idx) => (
                <th key={idx} className="py-4 px-6 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {items.map((item, index) => renderRow(item, index))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
