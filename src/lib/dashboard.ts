export type Project = { id: string; name: string; description: string; category: string; priority: string; memberIds: string[] }
export type Member = { userId: string; role: string; name: string; email: string; position: string; birthdate: string; phone: string; projectId: string; isActive: boolean }
export type Task = { id: string; description: string; projectId: string; status: string; priority: string; userId: string; dateline: string }
export type DashboardData = { projects: Project[]; members: Member[]; tasks: Task[] }
export type Preferences = { workspace: string; email: string; notifications: boolean; weeklyReport: boolean; pageSize: string; theme: string }

export const initialPreferences: Preferences = { workspace: "Mi espacio de trabajo", email: "estudiante@tecsup.edu.pe", notifications: true, weeklyReport: false, pageSize: "5", theme: "violet" }
export const initialData: DashboardData = {
  projects: [
    { id: "p1", name: "E-commerce Platform", description: "Plataforma de comercio electrónico con Next.js", category: "web", priority: "Alta", memberIds: ["u1", "u2"] },
    { id: "p2", name: "Mobile App", description: "Aplicación móvil con React Native", category: "mobile", priority: "Media", memberIds: ["u3"] },
    { id: "p3", name: "API Gateway", description: "Microservicios y documentación", category: "web", priority: "Alta", memberIds: ["u4", "u5"] },
  ],
  members: [
    { userId: "u1", name: "María García", email: "maria@example.com", role: "Desarrollador", position: "Frontend Developer", birthdate: "1999-05-12", phone: "987654321", projectId: "p1", isActive: true },
    { userId: "u2", name: "Juan Pérez", email: "juan@example.com", role: "Desarrollador", position: "Backend Developer", birthdate: "1998-03-22", phone: "987654322", projectId: "p1", isActive: true },
    { userId: "u3", name: "Ana López", email: "ana@example.com", role: "Diseñador", position: "UI/UX Designer", birthdate: "2000-07-10", phone: "987654323", projectId: "p2", isActive: false },
    { userId: "u4", name: "Carlos Ruiz", email: "carlos@example.com", role: "Desarrollador", position: "DevOps Engineer", birthdate: "1997-11-01", phone: "987654324", projectId: "p3", isActive: true },
    { userId: "u5", name: "Laura Martínez", email: "laura@example.com", role: "Administrador", position: "Project Manager", birthdate: "1996-02-18", phone: "987654325", projectId: "p3", isActive: true },
  ],
  tasks: [
    { id: "t1", description: "Implementar autenticación", projectId: "p1", status: "En progreso", priority: "Alta", userId: "u1", dateline: "2026-11-15" },
    { id: "t2", description: "Diseñar pantalla de perfil", projectId: "p2", status: "Pendiente", priority: "Media", userId: "u3", dateline: "2026-11-20" },
    { id: "t3", description: "Configurar CI/CD", projectId: "p3", status: "Completado", priority: "Alta", userId: "u4", dateline: "2026-11-10" },
    { id: "t4", description: "Optimizar consultas SQL", projectId: "p1", status: "En progreso", priority: "Urgente", userId: "u2", dateline: "2026-11-12" },
    { id: "t5", description: "Documentar API endpoints", projectId: "p3", status: "Pendiente", priority: "Baja", userId: "u5", dateline: "2026-11-25" },
    { id: "t6", description: "Revisar accesibilidad", projectId: "p1", status: "Pendiente", priority: "Media", userId: "u1", dateline: "2026-11-28" },
  ],
}

// Un miembro pertenece a un proyecto. Las dos vistas de la relación se actualizan juntas.
export function saveProject(data: DashboardData, project: Project): DashboardData {
  const memberIds = project.memberIds.filter(id => data.members.some(m => m.userId === id))
  const members = data.members.map(m => ({ ...m, projectId: memberIds.includes(m.userId) ? project.id : m.projectId === project.id ? "" : m.projectId }))
  const projects = [...data.projects.filter(p => p.id !== project.id), { ...project, memberIds }].map(p => ({ ...p, memberIds: members.filter(m => m.projectId === p.id).map(m => m.userId) }))
  return { ...data, projects, members, tasks: data.tasks.map(t => members.some(m => m.userId === t.userId && m.projectId === t.projectId) ? t : { ...t, userId: "" }) }
}
export function saveMember(data: DashboardData, member: Member): DashboardData {
  const members = [...data.members.filter(m => m.userId !== member.userId), member]
  return { ...data, members, projects: data.projects.map(p => ({ ...p, memberIds: members.filter(m => m.projectId === p.id).map(m => m.userId) })), tasks: data.tasks.map(t => t.userId === member.userId && t.projectId !== member.projectId ? { ...t, userId: "" } : t) }
}
export function deleteRecord(data: DashboardData, kind: "project" | "member" | "task", id: string): DashboardData {
  if (kind === "task") return { ...data, tasks: data.tasks.filter(t => t.id !== id) }
  if (kind === "project") return { projects: data.projects.filter(p => p.id !== id), tasks: data.tasks.filter(t => t.projectId !== id), members: data.members.map(m => m.projectId === id ? { ...m, projectId: "" } : m) }
  return { projects: data.projects.map(p => ({ ...p, memberIds: p.memberIds.filter(mid => mid !== id) })), members: data.members.filter(m => m.userId !== id), tasks: data.tasks.map(t => t.userId === id ? { ...t, userId: "" } : t) }
}
export function projectProgress(data: DashboardData, id: string) {
  const tasks = data.tasks.filter(t => t.projectId === id)
  return tasks.length ? Math.round(tasks.filter(t => t.status === "Completado").length / tasks.length * 100) : 0
}
export function dateLabel(value: string) { return value ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(`${value}T12:00:00`)) : "Sin fecha" }
export function dateValue(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` }
