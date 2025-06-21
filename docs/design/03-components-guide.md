# Guía de Componentes

## 1. Componentes de Navegación

### 1.1 Barra de Navegación Principal
```
Componente: MainSidebar
├── Logo Section
├── Search Bar  
├── Navigation Items
│   ├── Icon
│   ├── Label
│   └── Badge (opcional)
├── Divider
└── User Section
```

#### Especificaciones
- **Ancho**: 260px (expandido), 64px (colapsado)
- **Items**:
  - Altura: 40px
  - Padding: 12px 16px
  - Radio de borde: 8px
  - Transición: all 200ms ease
- **Estados**:
  - Default: Transparente
  - Hover: Background rgba(255,255,255,0.05)
  - Active: Background rgba(255,255,255,0.1) + borde lateral 3px
  - Disabled: Opacity 0.5

### 1.2 Breadcrumbs
```
Home > Projects > AI Assistant > Settings
```
- **Separador**: ">" o "/" con padding 8px
- **Color**: Gris para items no activos, blanco para activo
- **Interacción**: Todos clickeables excepto el actual

## 2. Componentes de Entrada

### 2.1 Campo de Búsqueda
```
┌─────────────────────────────────┐
│ 🔍 Search or type command...    │
└─────────────────────────────────┘
```
- **Altura**: 40px
- **Padding**: 12px 16px 12px 40px
- **Icono**: 20px, posición absoluta izquierda
- **Placeholder**: Color gris suave
- **Focus**: Borde con color de acento + sombra sutil

### 2.2 Input de Texto
```
┌─────────────────────────────────┐
│ Enter your text here            │
└─────────────────────────────────┘
```
#### Variantes
- **Default**: 40px altura
- **Large**: 48px altura  
- **Small**: 32px altura

#### Estados
- **Empty**: Placeholder visible
- **Filled**: Texto en color principal
- **Focus**: Borde acento + shadow
- **Error**: Borde rojo + mensaje
- **Disabled**: Opacity 0.5 + cursor not-allowed

### 2.3 Textarea
- **Min altura**: 80px (3 líneas)
- **Resize**: Vertical only
- **Max altura**: 200px
- **Scrollbar**: Estilizado minimal

## 3. Componentes de Acción

### 3.1 Botones

#### Botón Primario
```
┌──────────────────────┐
│   Perform Action     │
└──────────────────────┘
```
- **Fondo**: Color de acento sólido
- **Texto**: Blanco, peso 600
- **Padding**: 12px 24px
- **Radio**: 8px
- **Hover**: Brillo +10%
- **Active**: Scale(0.98)

#### Botón Secundario
```
┌──────────────────────┐
│   Secondary Action   │
└──────────────────────┘
```
- **Fondo**: Transparente
- **Borde**: 1px color de acento
- **Texto**: Color de acento
- **Hover**: Fondo con opacidad 0.1

#### Botón Ghost
```
    Cancel Action    
```
- **Sin borde ni fondo**
- **Texto**: Gris claro
- **Hover**: Texto blanco + underline

### 3.2 Botones de Icono
```
┌────┐ ┌────┐ ┌────┐
│ ⚙️ │ │ 📎 │ │ ⋮  │
└────┘ └────┘ └────┘
```
- **Tamaño**: 32px × 32px
- **Radio**: 8px o circular
- **Padding**: 6px
- **Icono**: 20px centrado

## 4. Componentes de Contenido

### 4.1 Tarjetas (Cards)
```
┌─────────────────────────────┐
│ Card Title                  │
├─────────────────────────────┤
│ Card content goes here.     │
│ Can contain multiple lines  │
│ and various elements.       │
├─────────────────────────────┤
│ [Action] [Secondary Action] │
└─────────────────────────────┘
```
- **Padding**: 24px
- **Radio**: 12px
- **Fondo**: #1A1A1C (ligeramente más claro)
- **Borde**: 1px solid rgba(255,255,255,0.08)
- **Sombra**: 0 2px 8px rgba(0,0,0,0.1)
- **Hover**: Transform translateY(-2px)

### 4.2 Lista de Tareas
```
┌─────────────────────────────────┐
│ ○ Tarea pendiente              │
│   Descripción adicional         │
├─────────────────────────────────┤
│ ● Tarea completada             │
│   ✓ overdue                    │
└─────────────────────────────────┘
```
- **Item altura**: Auto (min 48px)
- **Padding**: 16px
- **Separador**: 1px línea sutil
- **Checkbox**: 20px, custom styled
- **Estados**: Hover con fondo sutil

### 4.3 Badges y Tags
```
[NEW] [BETA] [PRO] [3]
```
- **Padding**: 4px 8px
- **Radio**: 4px (rectangular) o 9999px (pill)
- **Altura**: 20px
- **Font size**: 12px
- **Colores**: Según contexto (éxito, info, advertencia)

### 4.4 Avatar
```
┌────┐
│ AB │  o  [Imagen]
└────┘
```
- **Tamaños**: 32px (sm), 40px (md), 48px (lg), 64px (xl)
- **Radio**: 50% (circular) o 8px (cuadrado)
- **Fallback**: Iniciales con fondo de color
- **Borde**: 2px solid con color de fondo

## 5. Componentes de Feedback

### 5.1 Tooltips
```
         ┌─────────────────┐
         │ Helpful tooltip │
         └────────▼────────┘
           [Elemento]
```
- **Fondo**: Negro con 90% opacidad
- **Padding**: 8px 12px
- **Radio**: 6px
- **Delay**: 500ms para aparecer
- **Posición**: Auto-ajustable
- **Max width**: 240px

### 5.2 Notificaciones Toast
```
┌────────────────────────────┐
│ ✓ Acción completada        │ ✕
└────────────────────────────┘
```
- **Posición**: Top-right de la pantalla
- **Ancho**: 320px máximo
- **Animación**: Slide-in desde derecha
- **Duración**: 4s auto-dismiss
- **Stack**: Máximo 3 visibles

### 5.3 Loading States
#### Spinner
- **Tamaños**: 16px, 24px, 32px
- **Animación**: Rotate 360° en 1s
- **Color**: Color de acento

#### Skeleton Screen
```
█████████ ███████████
████ ████████ ██████████
```
- **Animación**: Shimmer de izq a derecha
- **Duración**: 1.5s por ciclo
- **Color**: Gradiente sutil

## 6. Componentes de Overlay

### 6.1 Modal
```
┌─────────────────────────┐
│ Modal Title         [✕] │
├─────────────────────────┤
│ Modal content here      │
│                         │
├─────────────────────────┤
│ [Cancel] [Confirm]      │
└─────────────────────────┘
```
- **Overlay**: Negro 50% opacidad
- **Ancho**: 480px (sm), 640px (md), 800px (lg)
- **Padding**: 32px
- **Animación**: Fade + scale desde 0.95