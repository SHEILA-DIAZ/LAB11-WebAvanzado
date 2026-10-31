"use client"

import { useState, type ReactNode } from "react"
import { CalendarDays, CircleAlert } from "lucide-react"
import { es } from "react-day-picker/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { DialogFooter } from "@/components/ui/dialog"
import { dateLabel, dateValue, type DashboardData, type Member, type Project, type Task, type Preferences } from "@/lib/dashboard"

export function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return <div className="grid gap-2"><Label htmlFor={id}>{label}</Label>{children}</div>
}
export function Choice({ id, value, onChange, options, placeholder = "Selecciona una opción" }: { id: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return <Select value={value || undefined} onValueChange={onChange}><SelectTrigger id={id} className="w-full"><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
}
export function DateField({ id, value, onChange, birthdate = false }: { id: string; value: string; onChange: (v: string) => void; birthdate?: boolean }) {
  const [open, setOpen] = useState(false)
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button id={id} type="button" variant="outline" className="w-full justify-start"><CalendarDays aria-hidden="true" />{value ? dateLabel(value) : "Seleccionar fecha"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" locale={es} selected={value ? new Date(`${value}T12:00:00`) : undefined} defaultMonth={value ? new Date(`${value}T12:00:00`) : undefined} captionLayout="dropdown" startMonth={birthdate ? new Date(1920, 0) : new Date(2020, 0)} endMonth={birthdate ? new Date() : new Date(2040, 11)} disabled={birthdate ? { after: new Date() } : undefined} onSelect={date => { if (date) { onChange(dateValue(date)); setOpen(false) } }} /></PopoverContent></Popover>
}
export function FormError({ message }: { message: string }) {
  return message ? <Alert variant="destructive"><CircleAlert /><AlertTitle>Revisa los datos</AlertTitle><AlertDescription>{message}</AlertDescription></Alert> : null
}
export function Submit({ busy, label = "Guardar cambios" }: { busy: boolean; label?: string }) {
  return <Button type="submit" disabled={busy}>{busy && <Spinner />} {busy ? "Guardando…" : label}</Button>
}
const priorities = ["Baja", "Media", "Alta", "Urgente"].map(value => ({ value, label: value }))

export function EntityForm({ kind, record, data, busy, onSave, onCancel }: { kind: "project" | "member" | "task"; record?: Project | Member | Task; data: DashboardData; busy: boolean; onSave: (record: Project | Member | Task) => Promise<void>; onCancel: () => void }) {
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const defaults = { name: "", description: "", category: "web", priority: "Media", role: "Desarrollador", email: "", position: "", birthdate: "", phone: "", projectId: "", status: "Pendiente", userId: "", dateline: "" }
    return { ...defaults, ...Object.fromEntries(Object.entries(record || {}).filter((entry): entry is [string, string] => typeof entry[1] === "string")) }
  })
  const [memberIds, setMemberIds] = useState<string[]>(kind === "project" && record ? (record as Project).memberIds : [])
  const [active, setActive] = useState(kind === "member" && record ? (record as Member).isActive : true)
  const [error, setError] = useState("")
  const set = (key: string, value: string) => setDraft(d => ({ ...d, [key]: value }))
  const text = (key: string, label: string, type = "text") => <Field id={key} label={label}><Input id={key} type={type} value={draft[key]} onChange={e => set(key, e.target.value)} /></Field>
  const projectOptions = data.projects.map(p => ({ value: p.id, label: p.name }))
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    let result: Project | Member | Task
    const id = record && "id" in record ? record.id : crypto.randomUUID()
    if (kind === "project") {
      if (!draft.name.trim() || !draft.category || !draft.priority) return setError("Completa el nombre, la categoría y la prioridad del proyecto.")
      if (data.projects.some(p => p.id !== id && p.name.toLowerCase() === draft.name.trim().toLowerCase())) return setError("Ya existe un proyecto con ese nombre.")
      result = { id, name: draft.name.trim(), description: draft.description.trim(), category: draft.category, priority: draft.priority, memberIds }
    } else if (kind === "member") {
      const userId = record && "isActive" in record ? record.userId : crypto.randomUUID()
      if (!draft.name.trim() || !draft.email.trim() || !draft.position.trim() || !draft.role || !draft.birthdate || !draft.phone.trim()) return setError("Completa nombre, correo, cargo, rol, fecha de nacimiento y teléfono.")
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return setError("Ingresa un correo válido.")
      if (data.members.some(m => m.userId !== userId && m.email.toLowerCase() === draft.email.trim().toLowerCase())) return setError("Ese correo ya pertenece a otro miembro.")
      if (!/^[+\d\s()-]{7,20}$/.test(draft.phone.trim())) return setError("Ingresa un teléfono válido (7 a 20 caracteres).")
      if (draft.birthdate > dateValue(new Date())) return setError("La fecha de nacimiento no puede estar en el futuro.")
      result = { userId, role: draft.role, name: draft.name.trim(), email: draft.email.trim(), position: draft.position.trim(), birthdate: draft.birthdate, phone: draft.phone.trim(), projectId: draft.projectId, isActive: active }
    } else {
      if (!draft.description.trim() || !draft.projectId || !draft.userId || !draft.dateline) return setError("Completa descripción, proyecto, responsable y fecha límite.")
      if (!data.members.some(m => m.userId === draft.userId && m.projectId === draft.projectId && (m.isActive || (record as Task | undefined)?.userId === m.userId))) return setError("Selecciona un miembro activo del proyecto.")
      result = { id, description: draft.description.trim(), projectId: draft.projectId, status: draft.status, priority: draft.priority, userId: draft.userId, dateline: draft.dateline }
    }
    setError("")
    try { await onSave(result) } catch { setError("No se pudo guardar. Intenta nuevamente.") }
  }
  return <form onSubmit={submit} noValidate className="grid gap-5"><FormError message={error} /><fieldset disabled={busy} className="grid gap-4 disabled:opacity-60">
    {kind === "project" && <>
      {text("name", "Nombre del proyecto *")}{text("description", "Descripción")}
      <Field id="category" label="Categoría *"><Choice id="category" value={draft.category} onChange={v => set("category", v)} options={[{ value: "web", label: "Desarrollo Web" }, { value: "mobile", label: "Desarrollo Mobile" }, { value: "design", label: "Diseño" }, { value: "marketing", label: "Marketing" }, { value: "other", label: "Otro" }]} /></Field>
      <Field id="project-priority" label="Prioridad *"><Choice id="project-priority" value={draft.priority} onChange={v => set("priority", v)} options={priorities} /></Field>
      <fieldset className="grid gap-3 rounded-xl border p-4"><legend className="px-1 text-sm font-semibold">Miembros del equipo</legend><p className="text-xs text-muted-foreground">Seleccionar un miembro de otro proyecto lo reasignará aquí. Sus tareas anteriores quedarán sin responsable.</p>{data.members.length ? data.members.map(m => <label key={m.userId} className="flex items-center gap-3 text-sm"><Checkbox checked={memberIds.includes(m.userId)} onCheckedChange={checked => setMemberIds(ids => checked ? [...ids, m.userId] : ids.filter(id => id !== m.userId))} />{m.name}<span className="ml-auto text-xs text-muted-foreground">{m.projectId ? data.projects.find(p => p.id === m.projectId)?.name : "Sin proyecto"}</span></label>) : <p className="text-sm text-muted-foreground">Crea miembros en Equipo para asignarlos.</p>}</fieldset>
    </>}
    {kind === "member" && <>
      {record && "isActive" in record && <p className="break-all text-xs text-muted-foreground">ID: {record.userId}</p>}
      {text("name", "Nombre completo *")}{text("email", "Correo electrónico *", "email")}{text("position", "Cargo / puesto *")}
      <Field id="role" label="Rol *"><Choice id="role" value={draft.role} onChange={v => set("role", v)} options={["Administrador", "Desarrollador", "Diseñador", "Colaborador"].map(value => ({ value, label: value }))} /></Field>
      <Field id="birthdate" label="Fecha de nacimiento *"><DateField id="birthdate" value={draft.birthdate} onChange={v => set("birthdate", v)} birthdate /></Field>
      {text("phone", "Teléfono *", "tel")}
      <Field id="member-project" label="Proyecto"><Choice id="member-project" value={draft.projectId || "none"} onChange={v => set("projectId", v === "none" ? "" : v)} options={[{ value: "none", label: "Sin proyecto" }, ...projectOptions]} /></Field>
      <div className="flex items-center justify-between"><Label htmlFor="active-member">Miembro activo</Label><Switch id="active-member" checked={active} onCheckedChange={setActive} /></div>
    </>}
    {kind === "task" && <>
      {text("description", "Descripción de la tarea *")}
      <Field id="task-project" label="Proyecto *"><Choice id="task-project" value={draft.projectId} onChange={v => setDraft(d => ({ ...d, projectId: v, userId: "" }))} options={projectOptions} /></Field>
      <Field id="assignee" label="Responsable *"><Choice id="assignee" value={draft.userId} onChange={v => set("userId", v)} options={data.members.filter(m => m.projectId === draft.projectId && (m.isActive || (record as Task | undefined)?.userId === m.userId)).map(m => ({ value: m.userId, label: `${m.name}${m.isActive ? "" : " (inactivo)"}` }))} placeholder="Selecciona un miembro del proyecto" /></Field>
      <p className="text-xs text-muted-foreground">Si no hay responsables disponibles, asigna miembros activos al proyecto desde Equipo.</p>
      <Field id="status" label="Estado"><Choice id="status" value={draft.status} onChange={v => set("status", v)} options={["Pendiente", "En progreso", "Completado"].map(value => ({ value, label: value }))} /></Field>
      <Field id="task-priority" label="Prioridad"><Choice id="task-priority" value={draft.priority} onChange={v => set("priority", v)} options={priorities} /></Field>
      <Field id="dateline" label="Fecha límite *"><DateField id="dateline" value={draft.dateline} onChange={v => set("dateline", v)} /></Field>
    </>}
  </fieldset><DialogFooter><Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Cancelar</Button><Submit busy={busy} label={record ? "Guardar cambios" : "Crear"} /></DialogFooter></form>
}

export function SettingsForm({ preferences, busy, onSave }: { preferences: Preferences; busy: boolean; onSave: (p: Preferences) => Promise<void> }) {
  const [draft, setDraft] = useState(preferences)
  const [error, setError] = useState("")
  return <form noValidate className="grid max-w-xl gap-6" onSubmit={async e => { e.preventDefault(); if (busy) return; if (!draft.workspace.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return setError("Completa el nombre del espacio y un correo válido."); setError(""); await onSave({ ...draft, workspace: draft.workspace.trim(), email: draft.email.trim() }) }}>
    <FormError message={error} /><fieldset disabled={busy} className="grid gap-5">
      <Field id="workspace" label="Nombre del espacio"><Input id="workspace" value={draft.workspace} onChange={e => setDraft({ ...draft, workspace: e.target.value })} /></Field>
      <Field id="settings-email" label="Correo de notificaciones"><Input id="settings-email" type="email" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} /></Field>
      <Field id="theme" label="Tema de color"><Choice id="theme" value={draft.theme} onChange={theme => setDraft({ ...draft, theme })} options={[{ value: "violet", label: "Azul moderno" }, { value: "teal", label: "Turquesa natural" }, { value: "rose", label: "Rosa intenso" }]} /></Field>
      <Field id="page-size" label="Tareas por página"><Choice id="page-size" value={draft.pageSize} onChange={pageSize => setDraft({ ...draft, pageSize })} options={["3", "5", "10"].map(value => ({ value, label: value }))} /></Field>
      <div className="flex items-center justify-between"><Label htmlFor="notifications">Notificaciones por correo (simuladas)</Label><Switch id="notifications" checked={draft.notifications} onCheckedChange={notifications => setDraft({ ...draft, notifications })} /></div>
      <div className="flex items-center justify-between"><Label htmlFor="weekly-report">Resumen semanal (simulado)</Label><Switch id="weekly-report" checked={draft.weeklyReport} onCheckedChange={weeklyReport => setDraft({ ...draft, weeklyReport })} /></div>
    </fieldset><p className="text-sm text-muted-foreground">Las preferencias se aplican a esta sesión. No se envían correos.</p><div><Submit busy={busy} label="Guardar preferencias" /></div>
  </form>
}
