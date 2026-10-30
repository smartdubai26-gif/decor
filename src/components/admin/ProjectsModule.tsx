import React, { useState } from 'react';
import { Project, Customer, ProjectTask } from '../../types';
import { FolderKanban, Plus, Calendar, CheckCircle2, Building, UserCheck, CheckSquare, Square, X } from 'lucide-react';

interface ProjectsModuleProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  customers: Customer[];
}

export const ProjectsModule: React.FC<ProjectsModuleProps> = ({ projects, setProjects, customers }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Project tasks state
  const [tasks, setTasks] = useState<ProjectTask[]>([
    { id: 't1', projectId: 'pr1', title: 'تكسير وتجهيز المسارات المعمارية', assignedTo: 'فريق التأسيس', dueDate: '2026-02-15', status: 'completed', priority: 'high' },
    { id: 't2', projectId: 'pr1', title: 'تمديد مواسير السباكة وكابلات الكهرباء السويدي', assignedTo: 'م. وليد حسن', dueDate: '2026-03-01', status: 'completed', priority: 'urgent' },
    { id: 't3', projectId: 'pr1', title: 'تركيب الأسقف المعلقة وتوزيع الإضاءة المودرن', assignedTo: 'فني الأسقف', dueDate: '2026-04-10', status: 'in_progress', priority: 'normal' },
    { id: 't4', projectId: 'pr1', title: 'أعمال البورسلين والرخام الإيطالي للأرضيات', assignedTo: 'فريق الرخام', dueDate: '2026-05-20', status: 'pending', priority: 'high' },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('م. كريم الشريف');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-06-01');

  const toggleTaskStatus = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const nextStatus: ProjectTask['status'] = t.status === 'completed' ? 'in_progress' : 'completed';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTasks(updated);

    // Recalculate progress percentage for project
    if (selectedProject) {
      const projTasks = updated.filter(t => t.projectId === selectedProject.id);
      if (projTasks.length > 0) {
        const completedCount = projTasks.filter(t => t.status === 'completed').length;
        const newPct = Math.round((completedCount / projTasks.length) * 100);
        const updatedProj = { ...selectedProject, progressPercentage: newPct };
        setSelectedProject(updatedProj);
        setProjects(projects.map(p => p.id === selectedProject.id ? updatedProj : p));
      }
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedProject) return;

    const created: ProjectTask = {
      id: `t-${Date.now()}`,
      projectId: selectedProject.id,
      title: newTaskTitle.trim(),
      assignedTo: newTaskAssignee,
      dueDate: newTaskDueDate,
      status: 'pending',
      priority: 'normal'
    };

    const updated = [...tasks, created];
    setTasks(updated);
    setNewTaskTitle('');

    // Update progress
    const projTasks = updated.filter(t => t.projectId === selectedProject.id);
    const completedCount = projTasks.filter(t => t.status === 'completed').length;
    const newPct = Math.round((completedCount / projTasks.length) * 100);
    const updatedProj = { ...selectedProject, progressPercentage: newPct };
    setSelectedProject(updatedProj);
    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProj : p));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">إدارة المشاريع والتنفيذ الميداني (Project Management)</h2>
          <p className="text-xs text-slate-500 mt-1">متابعة نسب الإنجاز الواقعية، المهام الهندسية، والمواعيد النهائية لكل موقع.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => {
          const projTasks = tasks.filter(t => t.projectId === project.id);
          const completedTasksCount = projTasks.filter(t => t.status === 'completed').length;

          return (
            <div key={project.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 hover:border-[#C6A780] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-[#C6A780]">{project.projectNumber}</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{project.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{project.address}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  {project.status}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>نسبة الإنجاز المحسوبة:</span>
                  <span className="font-mono font-bold text-slate-900">{project.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#C6A780] h-full rounded-full transition-all duration-300" style={{ width: `${project.progressPercentage}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 block">قيمة العقد المتفق عليها:</span>
                  <span className="font-mono font-bold text-slate-900">{project.contractValueEgp.toLocaleString()} ج.م</span>
                </div>
                <div>
                  <span className="text-slate-500 block">المصروفات الفعلية المسجلة:</span>
                  <span className="font-mono font-bold text-slate-900">{project.actualExpensesEgp.toLocaleString()} ج.م</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>تاريخ التسليم المستهدف: <strong className="font-mono text-slate-700">{project.targetCompletionDate}</strong></span>
                <button
                  onClick={() => setSelectedProject(project)}
                  className="font-bold text-[#28332F] bg-[#C6A780]/20 hover:bg-[#C6A780]/30 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  المهام والتفاصيل ({completedTasksCount}/{projTasks.length})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Detail & Interactive Tasks Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden my-auto p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#C6A780]">{selectedProject.projectNumber}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedProject.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedProject.address}</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs text-slate-600">
              <div><strong>العميل:</strong> {selectedProject.customerName}</div>
              <div><strong>نسبة التقدم:</strong> <span className="font-mono font-bold text-[#28332F]">{selectedProject.progressPercentage}%</span></div>
              <div><strong>تاريخ البدء:</strong> <span className="font-mono">{selectedProject.startDate}</span></div>
              <div><strong>الموعد المستهدف:</strong> <span className="font-mono">{selectedProject.targetCompletionDate}</span></div>
            </div>

            {/* Tasks Management */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900">قائمة المهام الهندسية والمراحل التنفيذية:</h4>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {tasks.filter(t => t.projectId === selectedProject.id).map(task => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isDone ? 'bg-emerald-50/60 border-emerald-200 text-slate-600 line-through' : 'bg-white border-slate-200 text-slate-900 hover:border-[#C6A780]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isDone ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                        <div>
                          <div className={`text-xs font-bold ${isDone ? 'line-through text-slate-500' : ''}`}>{task.title}</div>
                          <div className="text-[10px] text-slate-400">{task.assignedTo} • يستحق في <span className="font-mono">{task.dueDate}</span></div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {isDone ? 'مكتمل' : 'قيد التنفيذ'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Add New Task Form */}
              <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="عنوان المهمة التنفيذية الجديدة..."
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C6A780]"
                />
                <input
                  type="text"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  placeholder="المسؤول"
                  className="sm:w-32 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="bg-[#28332F] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#1b2320] cursor-pointer shrink-0"
                >
                  + إضافة مهمة
                </button>
              </form>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedProject(null)}
                className="bg-[#28332F] text-white px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
