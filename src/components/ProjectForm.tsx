"use client"
import { EntityForm } from "@/components/dashboard-forms"
import type { DashboardData, Project } from "@/lib/dashboard"

export function ProjectForm({ data, project, busy, onSave, onCancel }: { data: DashboardData; project?: Project; busy: boolean; onSave: (p: Project) => Promise<void>; onCancel: () => void }) {
  return <EntityForm kind="project" data={data} record={project} busy={busy} onSave={record => onSave(record as Project)} onCancel={onCancel} />
}
