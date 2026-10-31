# Dashboard de proyectos — Laboratorio 11

Aplicación Next.js con TypeScript, Tailwind CSS y componentes shadcn/ui.

## Ejecutar

```sh
npm install
npm run dev
```

Abrir `/dashboard` en el puerto indicado en la terminal.

## Funcionalidades

- Proyectos con miembros, detalles, edición y eliminación.
- CRUD de equipo y tareas con validaciones mediante Alert.
- Calendar para nacimiento y fecha límite.
- Spinner durante las peticiones simuladas.
- Pagination para tareas, configurable desde Configuración.
- Tres temas de color y preferencias simuladas.
- Métricas calculadas con los datos de la sesión.

Los datos se guardan en memoria y se reinician al recargar. No requiere backend.

## Comprobaciones

```sh
npm test
npm run lint
npm run build
```

Consultar [DASHBOARD.md](./DASHBOARD.md) para las reglas de relaciones y la guía de pruebas manuales.
