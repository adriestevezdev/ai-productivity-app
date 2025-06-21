# Patrones de Interacción

## 1. Principios de Interacción

### 1.1 Feedback Inmediato
- Toda acción debe tener respuesta visual en < 100ms
- Estados de carga para operaciones > 300ms
- Confirmación visual para acciones completadas

### 1.2 Predictibilidad
- Comportamientos consistentes en toda la aplicación
- Mismas acciones producen mismos resultados
- Patrones familiares de la industria

### 1.3 Reversibilidad
- Acciones deshacer disponibles cuando sea posible
- Confirmaciones para acciones destructivas
- Estados anteriores recuperables

## 2. Patrones de Navegación

### 2.1 Click Patterns
- **Single Click**: Navegación y selección
- **Double Click**: Apertura/edición rápida
- **Right Click**: Menú contextual
- **Long Press** (mobile): Opciones adicionales

### 2.2 Navegación por Teclado
```
Tab         → Siguiente elemento
Shift+Tab   → Elemento anterior
Enter       → Activar elemento
Escape      → Cancelar/cerrar
Arrows      → Navegación direccional
Space       → Seleccionar/toggle
```

### 2.3 Atajos de Teclado Globales
```
Cmd/Ctrl + K    → Búsqueda rápida
Cmd/Ctrl + /    → Panel de comandos
Cmd/Ctrl + S    → Guardar
Cmd/Ctrl + N    → Nuevo elemento
Cmd/Ctrl + ,    → Preferencias
```

## 3. Patrones de Selección

### 3.1 Selección Individual
- Click para seleccionar
- Click en otro lugar para deseleccionar
- Highlight visual inmediato

### 3.2 Selección Múltiple
- **Cmd/Ctrl + Click**: Agregar/quitar de selección
- **Shift + Click**: Selección de rango
- **Drag Selection**: Área de selección rectangular
- **Select All**: Cmd/Ctrl + A

### 3.3 Estados de Selección
```
Normal    → Sin borde ni fondo
Hover     → Fondo sutil + cursor pointer
Selected  → Borde de acento + fondo tenue
Focus     → Ring de focus visible
```

## 4. Drag & Drop

### 4.1 Indicadores Visuales
- **Draggable**: Cursor grab en hover
- **Dragging**: Cursor grabbing + opacidad 0.8
- **Drop Zone**: Borde punteado + fondo sutil
- **Invalid Drop**: Cursor not-allowed

### 4.2 Comportamiento
```
1. Mouse down → Detectar inicio
2. Drag 5px → Activar modo drag
3. Elemento sigue cursor
4. Drop zones se activan
5. Release → Completar o cancelar
```

## 5. Formularios e Inputs

### 5.1 Validación
- **En tiempo real**: Para formato (email, URL)
- **On blur**: Para campos requeridos
- **On submit**: Validación completa
- **Mensajes**: Específicos y accionables

### 5.2 Auto-completado
```
┌─────────────────────────┐
│ Type to search...       │
├─────────────────────────┤
│ > Suggestion 1          │
│   Suggestion 2          │
│   Suggestion 3          │
└─────────────────────────┘
```
- Aparece después de 2 caracteres
- Navegable con flechas
- Enter para seleccionar
- Esc para cerrar

### 5.3 Guardado Automático
- Indicador visual de estado
- Debounce de 1-2 segundos
- Confirmación sutil al guardar
- Recuperación ante fallos

## 6. Gestos Táctiles (Mobile/Tablet)

### 6.1 Gestos Básicos
- **Tap**: Equivalente a click
- **Double Tap**: Zoom o acción rápida
- **Pinch**: Zoom in/out
- **Swipe Horizontal**: Navegación entre vistas
- **Swipe Vertical**: Scroll
- **Pull to Refresh**: Actualizar contenido

### 6.2 Gestos Avanzados
- **Swipe to Delete**: Con confirmación visual
- **Long Press**: Menú contextual
- **3D Touch** (si disponible): Preview rápido

## 7. Micro-interacciones

### 7.1 Hover Effects
```
Default → Hover (200ms ease)
- Botones: Elevación + brillo
- Links: Underline sutil
- Cards: Sombra + translate Y
- Icons: Rotación sutil
```

### 7.2 Click Feedback
- Scale down momentáneo (0.98)
- Ripple effect desde punto de click
- Color flash para confirmación

### 7.3 Transiciones de Estado
```
Empty → Loading → Success/Error
- Fade in/out suave
- Skeleton → Contenido real
- Progress indicators precisos
```

## 8. Patrones de Error

### 8.1 Prevención
- Validación en tiempo real
- Tooltips de ayuda
- Límites claros en inputs
- Estados deshabilitados explicados

### 8.2 Recuperación
- Mensajes claros y específicos
- Acciones sugeridas
- Opción de reintentar
- Preservar trabajo del usuario