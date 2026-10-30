import React, { useState } from 'react';
import { User, UserRole, UserPermissions } from '../../types';
import { DEFAULT_ROLE_PERMISSIONS, ROLE_DEFINITIONS } from '../../data/mockData';
import { api } from '../../services/api';
import { 
  Users, Shield, ShieldCheck, UserPlus, Edit3, Trash2, CheckCircle2, 
  X, Search, Filter, Phone, Mail, Building, Key, Lock, Check, AlertCircle, RefreshCw
} from 'lucide-react';

interface UserManagementModuleProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User;
  onUpdateCurrentUser?: (user: User) => void;
}

const PERMISSION_LABELS: Record<keyof UserPermissions, { labelAr: string; descAr: string }> = {
  canAccessCRM: { labelAr: 'إدارة العملاء والمبيعات (CRM)', descAr: 'متابعة العملاء المحتملين وتسجيل الطلبات' },
  canAccessProjects: { labelAr: 'إدارة المشاريع والتنفيذ', descAr: 'متابعة المشروعات والمهام ونسب الإنجاز' },
  canAccessQuotations: { labelAr: 'العروض والمقايسات (الأسعار)', descAr: 'إنشاء عروض الأسعار والبنود التعاقدية' },
  canAccessFinance: { labelAr: 'الإدارة المالية والمصروفات', descAr: 'تسجيل المقبوضات والدفعات ومصروفات المواقع' },
  canAccessMedia: { labelAr: 'معرض الصور والملفات', descAr: 'إضافة وتعديل صور المشاريع في المعرض' },
  canAccessNews: { labelAr: 'إدارة الأخبار والمقالات (CMS)', descAr: 'نشر وحذف الأخبار المعمارية بالصور' },
  canAccessUsers: { labelAr: 'الموظفين والصلاحيات (RBAC)', descAr: 'التحكم في حسابات الموظفين وتعديل أدوارهم' },
  canAccessSettings: { labelAr: 'إعدادات الشركة والمنصة', descAr: 'تعديل بيانات الشركة وإظهار/إخفاء الصفحات' },
  canApproveQuotations: { labelAr: 'اعتماد وقبول المقايسات المالية', descAr: 'صلاحية التحويل إلى مقايسة معتمدة رسمياً' },
};

const ALL_ROLES: UserRole[] = ['super_admin', 'manager', 'sales', 'pm', 'accountant', 'execution', 'client'];

export const UserManagementModule: React.FC<UserManagementModuleProps> = ({
  users,
  setUsers,
  currentUser,
  onUpdateCurrentUser
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('sales');
  const [password, setPassword] = useState('Password@123');
  const [customPermissions, setCustomPermissions] = useState<UserPermissions>(DEFAULT_ROLE_PERMISSIONS.sales);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const openAddUserModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('+20 100 000 0000');
    setDepartment('إدارة المبيعات');
    setRole('sales');
    setPassword('Password@123');
    setCustomPermissions({ ...DEFAULT_ROLE_PERMISSIONS.sales });
    setShowModal(true);
  };

  const openEditUserModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone);
    setDepartment(u.department || 'إدارة التشغيل');
    setRole(u.role);
    setPassword('');
    const basePermissions = DEFAULT_ROLE_PERMISSIONS[u.role] || DEFAULT_ROLE_PERMISSIONS.sales;
    setCustomPermissions({ ...basePermissions, ...(u.permissions || {}) });
    setShowModal(true);
  };

  const handleRoleChangeInForm = (newRole: UserRole) => {
    setRole(newRole);
    // Auto-populate permissions based on selected role
    setCustomPermissions({ ...DEFAULT_ROLE_PERMISSIONS[newRole] });
  };

  const handlePermissionToggle = (key: keyof UserPermissions) => {
    setCustomPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('يرجى ملء الاسم والبريد الإلكتروني', 'error');
      return;
    }

    if (editingUser) {
      // Update existing user
      const updatedData: Partial<User> = {
        name,
        phone,
        department,
        role,
        permissions: customPermissions
      };

      try {
        await api.updateUser(editingUser.id, updatedData);
      } catch (err: any) {
        console.warn('API update failed, updating local state:', err);
      }

      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updatedData } : u));
      if (editingUser.id === currentUser.id && onUpdateCurrentUser) {
        onUpdateCurrentUser({ ...currentUser, ...updatedData });
      }
      showToast(`تم تحديث بيانات وصلاحيات الموظف (${name}) بنجاح`);
    } else {
      // Create new user
      const newUserData = {
        name,
        email,
        phone,
        department,
        role,
        permissions: customPermissions,
        password: password || 'Password@123'
      };

      try {
        const res = await api.createUser(newUserData);
        if (res && res.id) {
          setUsers(prev => [...prev, res]);
        } else {
          const fallbackUser: User = {
            id: `u-${Date.now()}`,
            name,
            email,
            phone,
            department,
            role,
            permissions: customPermissions,
            status: 'active'
          };
          setUsers(prev => [...prev, fallbackUser]);
        }
      } catch (err: any) {
        console.warn('API create user failed, adding local:', err);
        const fallbackUser: User = {
          id: `u-${Date.now()}`,
          name,
          email,
          phone,
          department,
          role,
          permissions: customPermissions,
          status: 'active'
        };
        setUsers(prev => [...prev, fallbackUser]);
      }

      showToast(`تم إنشاء حساب الموظف الجديد (${name}) بنجاح`);
    }

    setShowModal(false);
  };

  const handleQuickRoleChange = async (targetUserId: string, newRole: UserRole) => {
    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) return;

    if (targetUser.role === 'super_admin' && newRole !== 'super_admin') {
      const superAdmins = users.filter(u => u.role === 'super_admin');
      if (superAdmins.length <= 1) {
        showToast('لا يمكن تغيير دور المدير العام الرئيسي الوحيد للنظام', 'error');
        return;
      }
    }

    const defaultRolePerms = DEFAULT_ROLE_PERMISSIONS[newRole];
    const updated = { ...targetUser, role: newRole, permissions: defaultRolePerms };

    setUsers(prev => prev.map(u => u.id === targetUserId ? updated : u));
    if (targetUserId === currentUser.id && onUpdateCurrentUser) {
      onUpdateCurrentUser(updated);
    }

    try {
      await api.updateUserRole(targetUserId, newRole);
      showToast(`تم تعديل دور (${targetUser.name}) إلى (${ROLE_DEFINITIONS[newRole].labelAr})`);
    } catch (err: any) {
      console.warn('API error updating role:', err);
      showToast(`تم تحديث الدور محلياً (${ROLE_DEFINITIONS[newRole].labelAr})`);
    }
  };

  const handleDeleteUser = async (targetUserId: string, userName: string, targetRole: UserRole) => {
    if (targetRole === 'super_admin') {
      const superAdmins = users.filter(u => u.role === 'super_admin');
      if (superAdmins.length <= 1) {
        showToast('لا يمكن حذف المدير العام الرئيسي للنظام', 'error');
        return;
      }
    }

    if (!window.confirm(`هل أنت متأكد من حذف حساب الموظف "${userName}" نهائياً؟`)) {
      return;
    }

    setUsers(prev => prev.filter(u => u.id !== targetUserId));
    try {
      await api.deleteUser(targetUserId);
      showToast(`تم حذف حساب الموظف (${userName}) بنجاح`);
    } catch (err: any) {
      console.warn('API error deleting user:', err);
      showToast(`تم حذف المستخدم محلياً`);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 start-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold text-white transition-all ${
          notification.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-[#C6A780]">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-bold tracking-wider uppercase">نظام الصلاحيات والأدوار الإدارية المعتمدة (RBAC)</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">إدارة المستخدمين والصلاحيات</h2>
          <p className="text-xs text-slate-500 mt-1">
            التحكم في أدوار الموظفين، مستويات الوصول، وتخصيص صلاحيات العمليات المالية والمشروعات.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddUserModal}
            className="flex items-center gap-2 bg-[#28332F] hover:bg-[#1b2320] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4 text-[#C6A780]" />
            إضافة موظف / مستخدم جديد
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500 font-medium">إجمالي الحسابات</div>
          <div className="text-2xl font-black text-slate-900 font-mono">{users.length}</div>
          <div className="text-[10px] text-slate-400">موظفون ومستخدمون مسجلون</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-2xs space-y-1">
          <div className="text-xs text-purple-700 font-medium flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> الإدارة العليا
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">
            {users.filter(u => ['super_admin', 'manager'].includes(u.role)).length}
          </div>
          <div className="text-[10px] text-purple-600/80">مدراء بصلاحيات تنفيذية</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
          <div className="text-xs text-emerald-700 font-medium">المشاريع والتنفيذ</div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {users.filter(u => ['pm', 'execution'].includes(u.role)).length}
          </div>
          <div className="text-[10px] text-emerald-600/80">مهندسو مواقع وتشطيبات</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-2xs space-y-1">
          <div className="text-xs text-amber-700 font-medium">المبيعات والمالية</div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {users.filter(u => ['sales', 'accountant'].includes(u.role)).length}
          </div>
          <div className="text-[10px] text-amber-600/80">عقود، مقايسات ومقبوضات</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#28332F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Users className="w-4 h-4 text-[#C6A780]" />
          قائمة الموظفين وتعديل الأدوار
          <span className="bg-[#C6A780] text-[#28332F] px-1.5 py-0.5 rounded-full text-[10px]">
            {users.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-[#28332F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#C6A780]" />
          مصفوفة الصلاحيات المعتمدة (RBAC Matrix)
        </button>
      </div>

      {/* TAB 1: User Directory & Role Editing */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث باسم الموظف، البريد، الهاتف، أو القسم..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl ps-9 pe-4 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#C6A780]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="all">جميع الأدوار</option>
                {ALL_ROLES.map(r => (
                  <option key={r} value={r}>{ROLE_DEFINITIONS[r].labelAr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                    <th className="py-3.5 px-6">الموظف / المستخدم</th>
                    <th className="py-3.5 px-6">القسم والاتصال</th>
                    <th className="py-3.5 px-6">الدور الصلاحية (Role)</th>
                    <th className="py-3.5 px-6">الصلاحيات النشطة</th>
                    <th className="py-3.5 px-6 text-center">إجراءات التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.map((user) => {
                    const roleInfo = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS.sales;
                    const isSelf = user.id === currentUser.id;
                    const effectivePerms = { ...DEFAULT_ROLE_PERMISSIONS[user.role], ...(user.permissions || {}) };
                    const activePermsCount = Object.values(effectivePerms).filter(Boolean).length;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Name & Badge */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#28332F] text-[#C6A780] flex items-center justify-center font-bold text-sm shrink-0">
                              {user.name.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                <span>{user.name}</span>
                                {isSelf && (
                                  <span className="text-[10px] font-bold bg-[#C6A780]/20 text-[#28332F] px-2 py-0.5 rounded-full border border-[#C6A780]/40">
                                    حسابك الحالي
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Department & Phone */}
                        <td className="py-4 px-6">
                          <div className="text-xs font-bold text-slate-700">{user.department || 'إدارة التشغيل'}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#C6A780]" />
                            {user.phone}
                          </div>
                        </td>

                        {/* Role Selector */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <select
                              value={user.role}
                              onChange={(e) => handleQuickRoleChange(user.id, e.target.value as UserRole)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none transition-all ${roleInfo.badgeClass}`}
                            >
                              {ALL_ROLES.map(r => (
                                <option key={r} value={r}>
                                  {ROLE_DEFINITIONS[r].labelAr}
                                </option>
                              ))}
                            </select>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{roleInfo.descAr}</p>
                          </div>
                        </td>

                        {/* Permissions Summary */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            {activePermsCount} من 9 صلاحيات
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditUserModal(user)}
                              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="تعديل البيانات والصلاحيات التفصيلية"
                            >
                              <Edit3 className="w-4 h-4 text-[#C6A780]" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user.id, user.name, user.role)}
                              disabled={isSelf}
                              className={`p-2 rounded-lg transition-colors ${
                                isSelf 
                                  ? 'text-slate-300 cursor-not-allowed' 
                                  : 'text-rose-600 hover:text-rose-800 hover:bg-rose-50 cursor-pointer'
                              }`}
                              title={isSelf ? 'لا يمكن حذف حسابك الحالي' : 'حذف حساب الموظف'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: RBAC Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">مصفوفة الصلاحيات المعتمدة للأدوار الوظيفية</h3>
              <p className="text-xs text-slate-500">
                توضح الصلاحيات الممنوحة تلقائياً لكل دور إداري. يمكن تخصيص أي صلاحية فردياً لأي موظف عبر زر التعديل.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <th className="py-3 px-4 font-bold">الأقسام والوظائف الرئيسية</th>
                    {ALL_ROLES.map(r => (
                      <th key={r} className="py-3 px-3 text-center font-bold">
                        <span className={`inline-block px-2 py-1 rounded-md text-[10px] ${ROLE_DEFINITIONS[r].badgeClass}`}>
                          {ROLE_DEFINITIONS[r].labelAr.split('(')[0]}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(Object.keys(PERMISSION_LABELS) as (keyof UserPermissions)[]).map((permKey) => (
                    <tr key={permKey} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{PERMISSION_LABELS[permKey].labelAr}</div>
                        <div className="text-[10px] text-slate-400">{PERMISSION_LABELS[permKey].descAr}</div>
                      </td>

                      {ALL_ROLES.map(r => {
                        const hasPerm = DEFAULT_ROLE_PERMISSIONS[r][permKey];
                        return (
                          <td key={r} className="py-3.5 px-3 text-center">
                            {hasPerm ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-300">
                                ✗
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden p-6 sm:p-8 space-y-5 my-auto max-h-[92vh] overflow-y-auto animate-in fade-in duration-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#28332F] text-[#C6A780] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingUser ? 'تعديل بيانات وصلاحيات الموظف' : 'إضافة موظف / مستخدم جديد'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    تعيين الدور الرئيسي وتخصيص صلاحيات الوصول بدقة.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    اسم الموظف بالكامل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: م. مصطفى الشناوي"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#C6A780]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    البريد الإلكتروني المهني <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!!editingUser}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mostafa@artisan-space.eg"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-[#C6A780] disabled:bg-slate-100 disabled:text-slate-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">رقم الهاتف الرسمي</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100 123 4567"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-[#C6A780]"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">القسم أو الإدارة</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="مثال: إدارة التصميم المعماري والمواقع"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#C6A780]"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  الدور الإداري المعتمد (Primary Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChangeInForm(e.target.value as UserRole)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold bg-white focus:outline-none focus:border-[#C6A780]"
                >
                  {ALL_ROLES.map(r => (
                    <option key={r} value={r}>
                      {ROLE_DEFINITIONS[r].labelAr} — {ROLE_DEFINITIONS[r].descAr}
                    </option>
                  ))}
                </select>
              </div>

              {!editingUser && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">كلمة المرور المبدئية</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono bg-slate-50 focus:outline-none"
                  />
                </div>
              )}

              {/* Detailed Permissions Checkboxes */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-[#C6A780]" />
                    تخصيص الصلاحيات الفردية للموظف (Custom Permissions)
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomPermissions({ ...DEFAULT_ROLE_PERMISSIONS[role] })}
                    className="text-[11px] font-bold text-[#C6A780] hover:text-[#b0916b] flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> استعادة افتراضيات الدور
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pt-1">
                  {(Object.keys(PERMISSION_LABELS) as (keyof UserPermissions)[]).map((permKey) => (
                    <label
                      key={permKey}
                      className="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-[#C6A780] transition-colors cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={!!customPermissions[permKey]}
                        onChange={() => handlePermissionToggle(permKey)}
                        className="mt-0.5 w-4 h-4 accent-[#28332F] rounded cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{PERMISSION_LABELS[permKey].labelAr}</div>
                        <div className="text-[10px] text-slate-400">{PERMISSION_LABELS[permKey].descAr}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#28332F] hover:bg-[#1a2320] text-white shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#C6A780]" />
                  {editingUser ? 'حفظ تعديلات الموظف' : 'إنشاء وتفعيل الحساب'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
