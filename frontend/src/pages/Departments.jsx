import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import useConfirm from '../hooks/useConfirm';
import { getErrorMessage } from '../utils/errorHandler';
import { 
  Plus, 
  Building2, 
  Edit2, 
  Trash2, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { formatDate } from '../utils/formatters';

const Departments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  
  // Form State
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('departments/');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      toast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';

  const handleOpenCreate = () => {
    setSelectedDept(null);
    setNom('');
    setDescription('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setSelectedDept(dept);
    setNom(dept.nom);
    setDescription(dept.description || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nom.trim()) {
      setFormError("Le nom du département est requis.");
      return;
    }

    setFormError('');
    setFormLoading(true);

    try {
      if (selectedDept) {
        // Edit Mode
        await api.put(`departments/${selectedDept.id}/`, { nom, description });
        toast("Département mis à jour avec succès !", "success");
      } else {
        // Create Mode
        await api.post('departments/', { nom, description });
        toast("Département créé avec succès !", "success");
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const hasConfirmed = await confirm({
      title: "Supprimer le département",
      message: "Êtes-vous sûr de vouloir supprimer ce département ?",
      confirmVariant: "danger",
      confirmLabel: "Supprimer"
    });

    if (hasConfirmed) {
      try {
        await api.delete(`departments/${id}/`);
        toast("Département supprimé avec succès.", "success");
        fetchDepartments();
      } catch (err) {
        toast(getErrorMessage(err), "error");
      }
    }
  };

  if (loading) {
    return <Loader size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Départements</h1>
          <p className="text-slate-500 mt-1 font-medium">Organisation et services de l'entreprise</p>
        </div>
        {isAdminOrHR && (
          <Button
            onClick={handleOpenCreate}
            icon={Plus}
            variant="primary"
          >
            Créer un département
          </Button>
        )}
      </div>

      {/* Liste des départements sous forme de grille de cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm font-semibold col-span-3">
            Aucun département enregistré.
          </div>
        ) : (
          departments.map((dept) => (
            <div key={dept.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition duration-200">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Building2 className="h-6 w-6" />
                  </div>
                  {isAdminOrHR && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenEdit(dept)}
                        variant="outline"
                        size="sm"
                        icon={Edit2}
                        title="Modifier"
                        className="!p-2"
                      />
                      <Button
                        onClick={() => handleDelete(dept.id)}
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        title="Supprimer"
                        className="!p-2"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-slate-800">{dept.nom}</h3>
                  <p className="text-slate-500 text-sm mt-1.5 line-clamp-3 font-semibold leading-relaxed">
                    {dept.description || "Aucune description fournie."}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Créé le {formatDate(dept.created_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Création/Modification */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedDept ? "Modifier le département" : "Créer un département"}
        icon={Building2}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{formError}</span>
            </div>
          )}

          <FormField
            label="Nom du département"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex: Ressources Humaines"
          />

          <FormField
            label="Description"
            type="textarea"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez brièvement les missions de ce département..."
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
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
