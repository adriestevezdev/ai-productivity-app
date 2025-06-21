# Arquitectura del Layout

## 1. Estructura General

### 1.1 Layout Principal de Tres Columnas
La aplicación utiliza un diseño de tres columnas que maximiza el espacio de pantalla y organiza el contenido de manera lógica:

```
┌─────────────┬──────────────────────┬─────────────────┐
│  Sidebar    │    Main Content      │   Side Panel    │
│  (260px)    │    (Flexible)        │   (380px)       │
│             │                      │                 │
│  Navigation │    Primary Work      │   Context/      │
│  & Tools    │    Area              │   Tasks         │
│             │                      │                 │
└─────────────┴──────────────────────┴─────────────────┘
```

### 1.2 Dimensiones y Proporciones
- **Sidebar izquierdo**: 260px fijo
- **Área central**: Flexible (min: 600px)
- **Panel derecho**: 380px fijo (colapsable)
- **Altura total**: 100vh
- **Breakpoints responsivos**: 
  - Desktop: > 1280px (layout completo)
  - Tablet: 768px - 1280px (panel derecho oculto)
  - Mobile: < 768px (solo contenido principal)

## 2. Componentes del Layout

### 2.1 Sidebar Izquierdo (Navegación Principal)

#### Estructura
```
┌─────────────────┐
│ Logo/Brand      │ 64px altura
├─────────────────┤
│ Search Bar      │ 48px altura
├─────────────────┤
│ Primary Nav     │ 
│ - Today         │
│ - Personal      │ Items de 40px
│ - Team          │ altura c/u
├─────────────────┤
│ Secondary Nav   │
│ - Projects      │
│ - Archives      │
├─────────────────┤
│ Bottom Actions  │
│ - Settings      │
│ - Profile       │
└─────────────────┘
```

#### Características
- **Fondo**: Color más oscuro que el resto (#0A0A0B)
- **Bordes**: Borde derecho sutil para separación
- **Items de navegación**: 
  - Padding: 12px 16px
  - Hover: Fondo con opacidad 0.05
  - Active: Fondo con opacidad 0.1 + indicador lateral
- **Iconos**: 20px, alineados con 8px de espacio antes del texto
- **Colapsable**: En mobile se convierte en menú hamburguesa

### 2.2 Área Central (Contenido Principal)

#### Estructura Inicial (Estado Vacío)
```
┌──────────────────────────┐
│      Header Bar          │ 64px
├──────────────────────────┤
│                          │
│      Logo Central        │
│      ┌────────┐          │
│      │   /\   │          │ Centro 
│      │  /  \  │          │ vertical
│      │ /    \ │          │
│      └────────┘          │
│                          │
│   "What can I help?"     │
│                          │
│   ┌─────────────────┐    │
│   │ Action Button 1 │    │
│   └─────────────────┘    │
│   ┌─────────────────┐    │
│   │ Action Button 2 │    │
│   └─────────────────┘    │
│                          │
└──────────────────────────┘
```
#### Características del Área Central
- **Header Bar**: 
  - Altura: 64px
  - Contenido: Breadcrumbs, acciones contextuales, búsqueda
  - Borde inferior sutil
- **Área de Contenido**:
  - Padding: 48px en desktop, 24px en tablet, 16px en mobile
  - Scroll vertical independiente
  - Fondo: Ligeramente más claro que sidebar (#1A1A1C)

#### Estados del Contenido
1. **Estado Vacío**: Logo central con mensaje de bienvenida
2. **Estado Activo**: Contenido dinámico según contexto
3. **Estado de Carga**: Skeleton screens
4. **Estado de Error**: Mensaje centrado con acción de recuperación

### 2.3 Panel Derecho (Contexto/Tareas)

#### Estructura
```
┌─────────────────────┐
│ Panel Header        │ 56px
│ "productiv.ai"         │
├─────────────────────┤
│ Tab Navigation      │ 48px
│ [Tasks] [Notes]     │
├─────────────────────┤
│ Content Area        │
│                     │
│ • Task Item 1       │ Scrollable
│   Subtask info      │
│                     │
│ • Task Item 2       │
│   Subtask info      │
│                     │
└─────────────────────┘
```
#### Características del Panel Derecho
- **Header**: 
  - Título del contexto actual
  - Botón de colapsar/expandir
  - Acciones rápidas (más opciones, filtros)
- **Navegación por tabs**:
  - Tabs activos con indicador inferior
  - Transición suave entre contenidos
- **Área de contenido**:
  - Padding: 24px
  - Items con separadores sutiles
  - Scroll independiente

## 3. Comportamiento Responsivo

### 3.1 Desktop (> 1280px)
- Layout completo de 3 columnas
- Todos los paneles visibles
- Navegación expandida con texto

### 3.2 Tablet (768px - 1280px)
- Panel derecho oculto por defecto
- Botón flotante para mostrar panel como overlay
- Sidebar puede colapsar a solo iconos

### 3.3 Mobile (< 768px)
- Solo área central visible
- Sidebar como menú deslizable desde izquierda
- Panel derecho como modal de pantalla completa
- Header simplificado con menú hamburguesa

## 4. Zonas de Interacción

### 4.1 Zonas Primarias
- **Área central**: Zona principal de trabajo
- **Barra de búsqueda**: Acceso rápido global
- **Navegación principal**: Cambio de contexto
### 4.2 Zonas Secundarias
- **Panel de tareas**: Información contextual
- **Acciones flotantes**: CTAs contextuales
- **Breadcrumbs**: Navegación jerárquica

### 4.3 Zonas Terciarias
- **Footer**: Información de estado
- **Tooltips**: Ayuda contextual
- **Modales**: Acciones complejas

## 5. Flujos de Navegación

### 5.1 Navegación Horizontal
- Entre secciones principales via sidebar
- Entre tabs en paneles
- Entre pasos en wizards

### 5.2 Navegación Vertical
- Scroll dentro de cada área
- Navegación jerárquica en listas
- Expansión/colapso de secciones

### 5.3 Navegación Modal
- Overlays para acciones rápidas
- Diálogos para confirmaciones
- Pantallas completas para flujos complejos

## 6. Principios de Organización

- **Proximidad**: Elementos relacionados agrupados visualmente
- **Alineación**: Grid consistente en todos los elementos
- **Repetición**: Patrones consistentes en toda la app
- **Contraste**: Jerarquía clara mediante tamaño y color
- **Espacio negativo**: Respiración entre elementos
- **Flujo visual**: De izquierda a derecha, arriba a abajo