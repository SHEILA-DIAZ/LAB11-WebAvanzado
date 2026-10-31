"use client"
import { useState } from "react"
import { Pencil, Trash2, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dateLabel, type DashboardData, type Task } from "@/lib/dashboard"

export function TasksTable({ data, pageSize, onEdit, onDelete, onView }: { data: DashboardData; pageSize: number; onEdit: (t: Task) => void; onDelete: (t: Task) => void; onView: (t: Task) => void }) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(data.tasks.length / pageSize))
  const current = Math.min(page, pages)
  const visible = data.tasks.slice((current - 1) * pageSize, current * pageSize)
  return <div className="space-y-5"><div className="overflow-hidden rounded-xl border"><Table><TableHeader><TableRow>{["Tarea", "Proyecto", "Estado", "Prioridad", "Responsable", "Fecha límite", "Acciones"].map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>
    {visible.map(t => <TableRow key={t.id}><TableCell className="min-w-48 whitespace-normal font-medium">{t.description}</TableCell><TableCell>{data.projects.find(p => p.id === t.projectId)?.name || "Sin proyecto"}</TableCell><TableCell><Badge variant={t.status === "Completado" ? "default" : "outline"}>{t.status}</Badge></TableCell><TableCell><Badge variant={t.priority === "Urgente" ? "destructive" : "secondary"}>{t.priority}</Badge></TableCell><TableCell>{data.members.find(m => m.userId === t.userId)?.name || "Sin asignar"}</TableCell><TableCell>{dateLabel(t.dateline)}</TableCell><TableCell><div className="flex gap-1"><Button size="icon-sm" variant="ghost" aria-label={`Ver tarea ${t.description}`} onClick={() => onView(t)}><Eye /></Button><Button size="icon-sm" variant="ghost" aria-label={`Editar tarea ${t.description}`} onClick={() => onEdit(t)}><Pencil /></Button><Button size="icon-sm" variant="ghost" className="text-rose-600" aria-label={`Eliminar tarea ${t.description}`} onClick={() => onDelete(t)}><Trash2 /></Button></div></TableCell></TableRow>)}
    {!visible.length && <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No hay tareas. Crea la primera para comenzar.</TableCell></TableRow>}
  </TableBody></Table></div><div className="flex flex-col items-center justify-between gap-3 sm:flex-row"><p className="shrink-0 text-sm text-muted-foreground" aria-live="polite">{data.tasks.length} tareas · Página {current} de {pages}</p><Pagination className="w-auto" aria-label="Páginas de tareas"><PaginationContent><PaginationItem><PaginationPrevious href="#" text="Anterior" aria-label="Página anterior" aria-disabled={current === 1} tabIndex={current === 1 ? -1 : 0} onClick={e => { e.preventDefault(); setPage(Math.max(1, current - 1)) }} /></PaginationItem>{Array.from({ length: pages }, (_, i) => i + 1).filter(n => n === 1 || n === pages || Math.abs(n - current) <= 1).map(n => <PaginationItem key={n}><PaginationLink href="#" isActive={n === current} aria-label={`Página ${n}`} onClick={e => { e.preventDefault(); setPage(n) }}>{n}</PaginationLink></PaginationItem>)}<PaginationItem><PaginationNext href="#" text="Siguiente" aria-label="Página siguiente" aria-disabled={current === pages} tabIndex={current === pages ? -1 : 0} onClick={e => { e.preventDefault(); setPage(Math.min(pages, current + 1)) }} /></PaginationItem></PaginationContent></Pagination></div></div>
}
