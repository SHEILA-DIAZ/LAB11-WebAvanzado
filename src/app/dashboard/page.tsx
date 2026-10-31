"use client"

import { useRef, useState } from "react"
import { LayoutDashboard, FolderKanban, Users, ListTodo, Settings, Sparkles, Plus, Pencil, Trash2, Eye, CheckCircle2, CircleAlert } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { ProjectForm } from "@/components/ProjectForm"
import { TasksTable } from "@/components/TasksTable"
import { EntityForm, SettingsForm } from "@/components/dashboard-forms"
import { initialData, initialPreferences, saveProject, saveMember, deleteRecord, projectProgress, dateLabel, type Project, type Member, type Task, type Preferences } from "@/lib/dashboard"

type Kind = "project" | "member" | "task"
type RecordType = Project | Member | Task
type Modal = { mode: "edit"; kind: Kind; record?: RecordType } | { mode: "view" | "delete"; kind: Kind; record: RecordType }
const names = { project: "proyecto", member: "miembro", task: "tarea" }
const title = (record: RecordType) => "name" in record ? record.name : record.description

export default function DashboardPage() {
  const [data, setData] = useState(initialData)
  const [preferences, setPreferences] = useState(initialPreferences)
  const [modal, setModal] = useState<Modal | null>(null)
  const [busy, setBusy] = useState(false)
  const saving = useRef(false)
  const [notice, setNotice] = useState("")
  const [activity, setActivity] = useState<string[]>([])
  const [tab, setTab] = useState("overview")
  const log = (message: string) => { setNotice(message); setActivity(list => [message, ...list].slice(0, 6)) }
  async function simulate(action: () => void) {
    if (saving.current) return
    saving.current = true
    setBusy(true)
    try { await new Promise(resolve => setTimeout(resolve, 700)); action() }
    finally { saving.current = false; setBusy(false) }
  }
  async function save(kind: Kind, record: RecordType) {
    await simulate(() => {
      setData(current => kind === "project" ? saveProject(current, record as Project) : kind === "member" ? saveMember(current, record as Member) : { ...current, tasks: [...current.tasks.filter(t => t.id !== (record as Task).id), record as Task] })
      log(`${title(record)}: cambios guardados.`)
      setModal(null)
    })
  }
  const edit = (kind: Kind, record?: RecordType) => setModal({ mode: "edit", kind, record })
  const view = (kind: Kind, record: RecordType) => setModal({ mode: "view", kind, record })
  const remove = (kind: Kind, record: RecordType) => setModal({ mode: "delete", kind, record })
  const completed = data.tasks.filter(t => t.status === "Completado").length
  const progress = data.tasks.length ? Math.round(completed / data.tasks.length * 100) : 0
  const projectName = (id: string) => data.projects.find(p => p.id === id)?.name || "Sin proyecto"
  const memberName = (id: string) => data.members.find(m => m.userId === id)?.name || "Sin asignar"
  const stats = [
    { label: "Total proyectos", value: data.projects.length, detail: "Proyectos en tu espacio", icon: FolderKanban },
    { label: "Tareas completadas", value: completed, detail: `${data.tasks.length} tareas en total`, icon: CheckCircle2 },
    { label: "Avance general", value: `${progress}%`, detail: `${data.tasks.filter(t => t.status === "En progreso").length} tareas en progreso`, icon: ListTodo },
    { label: "Miembros activos", value: data.members.filter(m => m.isActive).length, detail: `${data.members.length} miembros en el equipo`, icon: Users },
  ]
  return <div className="dashboard min-h-screen p-4 sm:p-8 lg:p-12" data-theme={preferences.theme}><div className="mx-auto max-w-7xl">
    <header className="dashboard-hero mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div className="relative z-10"><span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-widest text-white"><Sparkles className="size-3.5" aria-hidden="true" />{preferences.workspace}</span><h1 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">Dashboard de Proyectos</h1><p className="max-w-lg text-sm text-white/85 sm:text-base">Organiza tus ideas, conecta a tu equipo y haz que las cosas sucedan.</p></div><Button onClick={() => edit("project")} className="relative z-10 h-11 shrink-0 rounded-xl bg-white px-5 font-semibold text-violet-700 shadow-lg hover:bg-violet-50"><Plus />Nuevo Proyecto</Button></header>
    <p className="mb-4 text-xs text-muted-foreground">Demo en memoria · Los cambios se conservan al cambiar de pestaña y se reinician al recargar la página.</p>
    {notice && <Alert className="mb-5 border-emerald-200 bg-emerald-50 text-emerald-900" role="status"><CheckCircle2 /><AlertTitle>Listo</AlertTitle><AlertDescription className="flex flex-wrap items-center justify-between gap-2 text-emerald-800"><span>{notice}</span><Button variant="ghost" size="xs" onClick={() => setNotice("")}>Cerrar aviso</Button></AlertDescription></Alert>}
    <Tabs value={tab} onValueChange={setTab} className="space-y-4"><TabsList className="dashboard-nav">{[{ value: "overview", label: "Resumen", icon: LayoutDashboard }, { value: "projects", label: "Proyectos", icon: FolderKanban }, { value: "team", label: "Equipo", icon: Users }, { value: "tasks", label: "Tareas", icon: ListTodo }, { value: "settings", label: "Configuración", icon: Settings }].map(t => <TabsTrigger key={t.value} value={t.value}><t.icon aria-hidden="true" />{t.label}</TabsTrigger>)}</TabsList>
      <TabsContent value="overview" className="space-y-6"><div className="dashboard-stats grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(s => <Card key={s.label}><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">{s.label}</CardTitle><s.icon className="size-4" aria-hidden="true" /></CardHeader><CardContent><div className="text-3xl font-bold">{s.value}</div><p className="text-xs text-muted-foreground">{s.detail}</p></CardContent></Card>)}</div>
        <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle>Progreso de proyectos</CardTitle><CardDescription>Calculado según las tareas completadas</CardDescription></CardHeader><CardContent className="space-y-5">{data.projects.length ? data.projects.map(p => <div key={p.id}><div className="mb-2 flex justify-between gap-3 text-sm"><span>{p.name}</span><span className="font-semibold">{projectProgress(data, p.id)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-label={`Progreso de ${p.name}`} aria-valuenow={projectProgress(data, p.id)} aria-valuemin={0} aria-valuemax={100}><div className="project-progress h-full" style={{ width: `${projectProgress(data, p.id)}%` }} /></div></div>) : <Empty text="Aún no hay proyectos." />}</CardContent></Card><Card><CardHeader><CardTitle>Actividad de esta sesión</CardTitle><CardDescription>Tus cambios más recientes</CardDescription></CardHeader><CardContent className="space-y-4">{activity.length ? activity.map((a, i) => <div key={i} className="flex items-start gap-3 border-b pb-3 last:border-0"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /><p className="text-sm">{a}</p></div>) : <Empty text="Crea o actualiza un registro para ver la actividad aquí." />}</CardContent></Card></div>
      </TabsContent>
      <TabsContent value="projects" className="space-y-5"><Section title="Tus proyectos" description="Todo tu trabajo, en un solo lugar." action="Nuevo proyecto" onClick={() => edit("project")} /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{data.projects.map(p => <Card key={p.id} className="project-card"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><CardTitle className="text-lg">{p.name}</CardTitle><Badge variant="secondary">{p.priority}</Badge></div><CardDescription>{p.description || "Sin descripción"}</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex justify-between text-sm"><span>Progreso</span><span>{projectProgress(data, p.id)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="project-progress h-full" style={{ width: `${projectProgress(data, p.id)}%` }} /></div><p className="text-sm text-muted-foreground">{p.memberIds.length} miembros · {data.tasks.filter(t => t.projectId === p.id).length} tareas</p><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => view("project", p)}><Eye />Ver detalles</Button><Button variant="ghost" size="icon-sm" aria-label={`Editar ${p.name}`} onClick={() => edit("project", p)}><Pencil /></Button><Button variant="ghost" size="icon-sm" className="text-rose-600" aria-label={`Eliminar ${p.name}`} onClick={() => remove("project", p)}><Trash2 /></Button></div></CardContent></Card>)}</div>{!data.projects.length && <Empty text="Crea tu primer proyecto para empezar." />}</TabsContent>
      <TabsContent value="team" className="space-y-5"><Section title="Miembros del equipo" description="Personas, roles y proyectos que comparten." action="Agregar miembro" onClick={() => edit("member")} /><Card><CardContent className="space-y-3 pt-6">{data.members.map(m => <div key={m.userId} className="team-row flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"><div className="flex items-center gap-3"><Avatar><AvatarFallback>{m.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</AvatarFallback></Avatar><div><p className="font-semibold">{m.name}</p><p className="text-sm text-muted-foreground">{m.position} · {m.role}</p><p className="break-all text-xs text-muted-foreground">{m.email}</p><p className="mt-1 text-xs text-primary">{projectName(m.projectId)}</p></div></div><div className="flex items-center gap-2"><Badge variant={m.isActive ? "default" : "outline"}>{m.isActive ? "Activo" : "Inactivo"}</Badge><Button variant="ghost" size="icon-sm" aria-label={`Ver ${m.name}`} onClick={() => view("member", m)}><Eye /></Button><Button variant="ghost" size="icon-sm" aria-label={`Editar ${m.name}`} onClick={() => edit("member", m)}><Pencil /></Button><Button variant="ghost" size="icon-sm" className="text-rose-600" aria-label={`Eliminar ${m.name}`} onClick={() => remove("member", m)}><Trash2 /></Button></div></div>)}{!data.members.length && <Empty text="No hay miembros. Agrega a tu equipo." />}</CardContent></Card></TabsContent>
      <TabsContent value="tasks" className="space-y-5"><Section title="Gestión de tareas" description="Asigna responsables y sigue cada entrega." action="Nueva tarea" onClick={() => edit("task")} /><Card><CardContent className="pt-6"><TasksTable key={preferences.pageSize} data={data} pageSize={Number(preferences.pageSize)} onEdit={t => edit("task", t)} onDelete={t => remove("task", t)} onView={t => view("task", t)} /></CardContent></Card></TabsContent>
      <TabsContent value="settings"><Card><CardHeader><CardTitle>Tu espacio, a tu manera</CardTitle><CardDescription>Personaliza el tema, las notificaciones y la paginación.</CardDescription></CardHeader><CardContent><SettingsForm preferences={preferences} busy={busy} onSave={async (p: Preferences) => { await simulate(() => { setPreferences(p); log("Preferencias aplicadas correctamente.") }) }} /></CardContent></Card></TabsContent>
    </Tabs>
    <Dialog open={!!modal} onOpenChange={open => { if (!open && !saving.current) setModal(null) }}><DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl p-6 sm:max-w-xl" showCloseButton={!busy} onEscapeKeyDown={e => { if (busy) e.preventDefault() }} onInteractOutside={e => { if (busy) e.preventDefault() }}><DialogHeader><DialogTitle>{modal?.mode === "edit" ? `${modal.record ? "Editar" : "Crear"} ${names[modal.kind]}` : modal?.mode === "delete" ? `Eliminar ${names[modal.kind]}` : "Detalles"}</DialogTitle><DialogDescription>{modal?.mode === "delete" ? "Revisa la información antes de confirmar." : modal?.mode === "view" ? "Información del registro y sus relaciones." : "Completa los campos marcados con *. Los cambios se aplicarán a esta sesión."}</DialogDescription></DialogHeader>
      {modal?.mode === "edit" && (modal.kind === "project" ? <ProjectForm data={data} project={modal.record as Project | undefined} busy={busy} onSave={p => save("project", p)} onCancel={() => setModal(null)} /> : <EntityForm kind={modal.kind} data={data} record={modal.record} busy={busy} onSave={r => save(modal.kind, r)} onCancel={() => setModal(null)} />)}
      {modal?.mode === "delete" && <><Alert variant="destructive"><CircleAlert /><AlertTitle>{title(modal.record)}</AlertTitle><AlertDescription>{modal.kind === "project" ? `Se eliminarán el proyecto y sus ${data.tasks.filter(t => t.projectId === (modal.record as Project).id).length} tareas. Los miembros quedarán sin proyecto.` : modal.kind === "member" ? "El miembro se eliminará y sus tareas quedarán sin responsable." : "La tarea se eliminará y las métricas se actualizarán."}</AlertDescription></Alert><DialogFooter><Button variant="outline" disabled={busy} onClick={() => setModal(null)}>Cancelar</Button><Button variant="destructive" disabled={busy} onClick={() => simulate(() => { const r = modal.record; setData(d => deleteRecord(d, modal.kind, "id" in r ? r.id : r.userId)); log(`${title(r)}: eliminado.`); setModal(null) })}>{busy ? <Spinner /> : <Trash2 />}{busy ? "Eliminando…" : "Confirmar eliminación"}</Button></DialogFooter></>}
      {modal?.mode === "view" && <div className="space-y-4"><h3 className="text-xl font-semibold">{title(modal.record)}</h3><dl className="grid gap-4 text-sm sm:grid-cols-2">{Object.entries(modal.record).filter(([key]) => !["memberIds", "name"].includes(key)).map(([key, value]) => <div key={key}><dt className="text-muted-foreground">{({ id: "ID", userId: modal.kind === "member" ? "ID de usuario" : "Responsable", description: "Descripción", category: "Categoría", priority: "Prioridad", role: "Rol", email: "Correo", position: "Cargo", birthdate: "Nacimiento", phone: "Teléfono", projectId: "Proyecto", isActive: "Estado", status: "Estado", dateline: "Fecha límite" } as Record<string, string>)[key] || key}</dt><dd className="mt-1 break-words font-medium">{key === "projectId" ? projectName(String(value)) : key === "userId" && modal.kind === "task" ? memberName(String(value)) : ["birthdate", "dateline"].includes(key) ? dateLabel(String(value)) : typeof value === "boolean" ? value ? "Activo" : "Inactivo" : String(value) || "Sin información"}</dd></div>)}</dl>{modal.kind === "project" && <><h4 className="font-semibold">Equipo asignado</h4><p className="text-sm">{(modal.record as Project).memberIds.map(memberName).join(", ") || "Sin miembros asignados"}</p><h4 className="font-semibold">Tareas del proyecto</h4><ul className="space-y-2 text-sm">{data.tasks.filter(t => t.projectId === (modal.record as Project).id).map(t => <li key={t.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-secondary p-3"><span>{t.description}</span><Badge variant="outline">{t.status}</Badge></li>)}</ul>{!data.tasks.some(t => t.projectId === (modal.record as Project).id) && <p className="text-sm text-muted-foreground">Todavía no tiene tareas.</p>}</>}<Button variant="outline" onClick={() => setModal(null)}>Cerrar</Button></div>}
    </DialogContent></Dialog>
  </div></div>
}
function Section({ title, description, action, onClick }: { title: string; description: string; action: string; onClick: () => void }) { return <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-bold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div><Button onClick={onClick}><Plus />{action}</Button></div> }
function Empty({ text }: { text: string }) { return <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">{text}</p> }
