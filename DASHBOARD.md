# Dashboard del laboratorio

Ejecutar `npm run dev` y abrir `/dashboard` en el puerto que muestre Next.js.

Los datos viven en memoria: se mantienen entre pestañas y se reinician al recargar. Las peticiones se simulan con 700 ms de espera y Spinner. No hay backend ni envío de correos.

## Funciones

- Proyectos: creación, edición, detalles, miembros y eliminación con confirmación. El progreso se calcula con sus tareas.
- Equipo: creación, consulta, edición y eliminación con todos los campos de la tarea. El ID se genera automáticamente. Los correos deben ser únicos.
- Tareas: creación, consulta, edición, eliminación y paginación. Solo se asignan a miembros activos del proyecto; se permite conservar un responsable inactivo al editar una tarea existente.
- Configuración: nombre del espacio, correo, tres temas, cantidad de tareas por página y dos opciones de notificación simuladas.
- Resumen: proyectos, tareas completadas, porcentaje de avance, miembros activos, progreso por proyecto y actividad de la sesión.

Un miembro pertenece a un proyecto. Reasignarlo actualiza ambas vistas de la relación y deja sus tareas del proyecto anterior sin responsable. Eliminar un proyecto elimina sus tareas y libera sus miembros. Eliminar un miembro conserva sus tareas sin responsable.

## Verificación manual

1. Crear un proyecto con nombre vacío: debe mostrarse Alert sin cerrar el formulario. Crear uno válido seleccionando miembros y abrir sus detalles.
2. Crear un miembro, revisar todos sus campos, editarlo y probar correo inválido o duplicado. Cambiarlo de proyecto y revisar la lista de miembros de ambos proyectos.
3. Crear una tarea con Calendar, asignarla a un miembro del proyecto y marcarla completada. Revisar que cambien el progreso y las métricas.
4. Navegar entre páginas de tareas. Eliminar la última tarea de una página: debe mostrarse una página válida. Eliminar todos los registros: deben aparecer estados vacíos.
5. Eliminar miembro y proyecto revisando los avisos y las referencias posteriores.
6. Guardar un tema y tres tareas por página en Configuración. Revisar el tema y la paginación. Los interruptores deben conservar su estado al cambiar de pestaña.
7. Recargar: los datos iniciales deben restaurarse. Probar los formularios con teclado y en pantalla móvil.

Pruebas de relaciones y métricas: `node --test tests/dashboard.test.mjs`.
