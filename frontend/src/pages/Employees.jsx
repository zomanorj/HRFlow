import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import useConfirm from '../hooks/useConfirm';
import { getErrorMessage } from '../utils/errorHandler';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  UserPlus, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  Calendar,
  Users
} from 'lucide-react';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { formatDate } from '../utils/formatters';

const Employees = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    date_embauche: '',
    poste: '',
    department: '',
    role: 'EMPLOYEE',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchEmployeesAndDeps = async () => {
    try {
      const [empRes, depRes] = await Promise.all([
        api.get('employees/'),
        api.get('departments/')
      ]);
      setEmployees(empRes.data);
      setDepartments(depRes.data);
    } catch (err) {
      console.error("Erreur de chargement", err);
      toast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesAndDeps();
  }, []);

  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';

  const handleOpenCreate = () => {
    setSelectedEmployee(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      date_embauche: new Date().toISOString().split('T')[0],
      poste: '',
      department: departments[0]?.id || '',
      role: 'EMPLOYEE',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      nom: emp.nom,
      prenom: emp.prenom,
      email: emp.email,
      telephone: emp.telephone || '',
      adresse: emp.adresse || '',
      date_embauche: emp.date_embauche,
      poste: emp.poste,
      department: emp.department || '',
      role: emp.user_role || 'EMPLOYEE',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (selectedEmployee) {
        // Mode Edition
        await api.put(`employees/${selectedEmployee.id}/`, formData);
        toast("Collaborateur modifié avec succès !", "success");
      } else {
        // Mode Création
        await api.post('employees/', formData);
        toast("Collaborateur créé avec succès !", "success");
      }
      setModalOpen(false);
      fetchEmployeesAndDeps();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const hasConfirmed = await confirm({
      title: "Supprimer l'employé",
      message: "Êtes-vous sûr de vouloir supprimer cet employé ? Cela supprimera également son compte utilisateur lié.",
      confirmVariant: "danger",
      confirmLabel: "Supprimer"
    });

    if (hasConfirmed) {
      try {
        await api.delete(`employees/${id}/`);
        toast("Employé supprimé avec succès.", "success");
        fetchEmployeesAndDeps();
      } catch (err) {
        toast(getErrorMessage(err), "error");
      }
    }
  };

  // Filter employees based on search input
  const filteredEmployees = employees.filter(emp => {
    const query = search.toLowerCase();
    const fullName = `${emp.prenom} ${emp.nom}`.toLowerCase();
    const deptName = emp.department_detail?.nom?.toLowerCase() || '';
    const posteName = emp.poste?.toLowerCase() || '';
    return fullName.includes(query) || deptName.includes(query) || posteName.includes(query);
  });

  if (loading) {
    return <Loader size="lg" className="mt-20" />;
  }

  const roleLabels = {
    ADMIN: 'Admin',
    HR: 'RH',
    EMPLOYEE: 'Employé',
  };

  const deptOptions = [
    { value: '', label: 'Sélectionner un département' },
    ...departments.map(d => ({ value: d.id, label: d.nom }))
  ];

  const roleOptions = [
    { value: 'EMPLOYEE', label: 'Employé' },
    { value: 'HR', label: 'Ressources Humaines (RH)' },
    { value: 'ADMIN', label: 'Administrateur' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Employés</h1>
          <p className="text-slate-500 mt-1 font-medium">Annuaire et administration des collaborateurs des différents départements</p>
        </div>
        {isAdminOrHR && (
          <Button
            onClick={handleOpenCreate}
            icon={Plus}
            variant="primary"
          >
            Créer un employé
          </Button>
        )}
      </div>

      {/* Barre de Recherche */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, poste, département..."
          className="flex-1 text-sm bg-transparent outline-none placeholder-slate-400 text-slate-700 font-semibold"
        />
      </div>

      {/* Tableau des Employés */}
      <DataTable
        headers={['Collaborateur', 'Poste / Service', 'Contact', "Date d'embauche", ...(isAdminOrHR ? ['Actions'] : [])]}
        items={filteredEmployees}
        emptyTitle="Aucun collaborateur trouvé"
        emptyDescription="Aucun employé ne correspond à votre recherche ou la liste est vide."
        emptyIcon={Users}
        renderRow={(emp) => (
          <tr key={emp.id} className="hover:bg-slate-50/50 transition">
            <td className="py-4 px-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-inner">
                  {emp.prenom.charAt(0)}{emp.nom.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{emp.prenom} {emp.nom}</p>
                  <p className="text-xs font-semibold text-slate-400">Rôle : {roleLabels[emp.user_role] || 'Employé'}</p>
                </div>
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  <span>{emp.poste}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{emp.department_detail?.nom || 'Aucun département'}</span>
                </div>
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs">{emp.email}</span>
                </div>
                {emp.telephone && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{emp.telephone}</span>
                  </div>
                )}
              </div>
            </td>
            <td className="py-4 px-6 text-slate-500 font-semibold">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatDate(emp.date_embauche)}</span>
              </div>
            </td>
            {isAdminOrHR && (
              <td className="py-4 px-6 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => handleOpenEdit(emp)}
                    variant="outline"
                    size="sm"
                    icon={Edit2}
                    title="Modifier"
                  >
                    Modifier
                  </Button>
                  <Button
                    onClick={() => handleDelete(emp.id)}
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    title="Supprimer"
                  >
                    Supprimer
                  </Button>
                </div>
              </td>
            )}
          </tr>
        )}
      />

      {/* Modal Création/Modification */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedEmployee ? "Modifier le collaborateur" : "Ajouter un collaborateur"}
        icon={UserPlus}
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-bold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Prénom"
              name="prenom"
              required
              value={formData.prenom}
              onChange={handleInputChange}
              placeholder="Jean"
            />
            <FormField
              label="Nom"
              name="nom"
              required
              value={formData.nom}
              onChange={handleInputChange}
              placeholder="Dupont"
            />
            <FormField
              label="Adresse Email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="jean.dupont@hrflow.com"
            />
            <FormField
              label="Téléphone"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              placeholder="0612345678"
            />
            <FormField
              label="Adresse"
              name="adresse"
              type="textarea"
              rows={2}
              value={formData.adresse}
              onChange={handleInputChange}
              placeholder="45 Avenue de la République, Lyon"
              className="md:col-span-2"
            />
            <FormField
              label="Poste occupé"
              name="poste"
              required
              value={formData.poste}
              onChange={handleInputChange}
              placeholder="Ex: Développeur Python"
            />
            <FormField
              label="Département"
              name="department"
              type="select"
              required
              value={formData.department}
              onChange={handleInputChange}
              options={deptOptions}
            />
            <FormField
              label="Date d'embauche"
              name="date_embauche"
              type="date"
              required
              value={formData.date_embauche}
              onChange={handleInputChange}
            />
            <FormField
              label="Rôle Système"
              name="role"
              type="select"
              required
              value={formData.role}
              onChange={handleInputChange}
              options={roleOptions}
            />
          </div>

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

export default Employees;
