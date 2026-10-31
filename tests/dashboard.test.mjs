import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import ts from "typescript"

const source = readFileSync(new URL("../src/lib/dashboard.ts", import.meta.url), "utf8")
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { initialData, saveProject, saveMember, deleteRecord, projectProgress, dateValue, dateLabel } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`)

test("crear un proyecto reasigna miembros y evita responsables de otro proyecto", () => {
  const p = { id: "new", name: "Nuevo", description: "", category: "web", priority: "Alta", memberIds: ["u1"] }
  const result = saveProject(initialData, p)
  assert.equal(result.projects.length, 4)
  assert.equal(result.members.find(m => m.userId === "u1").projectId, "new")
  assert.ok(!result.projects.find(p => p.id === "p1").memberIds.includes("u1"))
  assert.equal(result.tasks.find(t => t.id === "t1").userId, "")
  assert.equal(initialData.members[0].projectId, "p1", "no muta los datos originales")
})
test("editar equipo sincroniza proyecto y desasigna tareas incompatibles", () => {
  const result = saveMember(initialData, { ...initialData.members[0], projectId: "p2", name: "María editada" })
  assert.equal(result.members.length, 5)
  assert.ok(result.projects.find(p => p.id === "p2").memberIds.includes("u1"))
  assert.equal(result.tasks.find(t => t.id === "t1").userId, "")
})
test("eliminar un proyecto elimina sus tareas y conserva miembros sin proyecto", () => {
  const result = deleteRecord(initialData, "project", "p1")
  assert.ok(!result.projects.some(p => p.id === "p1"))
  assert.ok(!result.tasks.some(t => t.projectId === "p1"))
  assert.equal(result.members.length, 5)
  assert.equal(result.members.find(m => m.userId === "u1").projectId, "")
})
test("eliminar un miembro conserva tareas y limpia referencias", () => {
  const result = deleteRecord(initialData, "member", "u1")
  assert.equal(result.members.length, 4)
  assert.equal(result.tasks.length, initialData.tasks.length)
  assert.equal(result.tasks.find(t => t.id === "t1").userId, "")
  assert.ok(!result.projects.some(p => p.memberIds.includes("u1")))
})
test("el progreso responde al estado de tareas, su eliminación y proyectos vacíos", () => {
  assert.equal(projectProgress(initialData, "p3"), 50)
  const result = deleteRecord(initialData, "task", "t3")
  assert.equal(projectProgress(result, "p3"), 0)
  assert.equal(projectProgress(initialData, "empty"), 0)
  const completed = { ...initialData, tasks: initialData.tasks.map(t => ({ ...t, status: "Completado" })) }
  assert.equal(projectProgress(completed, "p1"), 100)
})
test("las fechas conservan el día del calendario sin conversión a UTC", () => {
  assert.equal(dateValue(new Date(2000, 0, 2)), "2000-01-02")
  assert.match(dateLabel("2000-01-02"), /2/)
})
