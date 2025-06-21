# Diseño Responsivo

## 1. Filosofía Mobile-First

### 1.1 Principios Core
- **Contenido primero**: Priorizar información esencial
- **Touch-friendly**: Targets mínimos de 44px
- **Performance**: Optimización para conexiones lentas
- **Progresivo**: Mejoras según capacidad del dispositivo

### 1.2 Breakpoints Principales
```
Mobile      → 320px - 767px
Tablet      → 768px - 1279px  
Desktop     → 1280px - 1919px
Wide        → 1920px+
```

## 2. Layout Responsivo

### 2.1 Transformación del Grid
```
Desktop (3 columnas)        Tablet (2 columnas)       Mobile (1 columna)
┌────┬────────┬────┐       ┌────┬────────────┐       ┌────────────┐
│ Nav│ Main   │Side│  →    │ Nav│ Main       │  →    │ ☰ Main     │
│    │        │    │       │    │            │       │            │
└────┴────────┴────┘       └────┴────────────┘       └────────────┘
                           [Panel como overlay]       [Todo oculto]
```

### 2.2 Comportamiento de Componentes
#### Navigation
- **Desktop**: Sidebar fijo expandido
- **Tablet**: Sidebar colapsable a iconos
- **Mobile**: Menú hamburguesa + drawer

#### Content Area
- **Desktop**: Multi-columna con sidebars
- **Tablet**: Columna principal + panel opcional
- **Mobile**: Stack vertical, contenido full-width

#### Actions
- **Desktop**: Botones con texto completo
- **Tablet**: Botones con texto o solo icono
- **Mobile**: FAB (Floating Action Button) o bottom bar

## 3. Adaptaciones Tipográficas

### 3.1 Escalado Responsivo
```
           Desktop  →  Tablet  →  Mobile
Display:   48px    →  40px    →  32px
H1:        36px    →  32px    →  28px
H2:        28px    →  24px    →  22px
H3:        24px    →  20px    →  18px
Body:      16px    →  16px    →  16px
Small:     14px    →  14px    →  12px
```

### 3.2 Line Height Adaptativo
- **Desktop**: 1.5 - 1.6 (más aireado)
- **Mobile**: 1.4 - 1.5 (más compacto)

## 4. Componentes Adaptativos

### 4.1 Tablas Responsivas
```
Desktop: Tabla tradicional
┌────┬────┬────┬────┐
│ Col│ Col│ Col│ Col│
├────┼────┼────┼────┤
│ Dat│ Dat│ Dat│ Dat│
└────┴────┴────┴────┘

Mobile: Cards apiladas
┌──────────────┐
│ Label: Data  │
│ Label: Data  │
└──────────────┘
```

### 4.2 Formularios Adaptativos
#### Desktop
```
[Nombre] [Apellido]    (2 columnas)
[Email             ]
[Mensaje           ]
         [Cancelar] [Enviar]
```

#### Mobile
```
[Nombre           ]    (1 columna)
[Apellido         ]    
[Email            ]
[Mensaje          ]
[Cancelar] [Enviar]   (Full width)
```

### 4.3 Modales Responsivos
- **Desktop**: Centrado, ancho fijo (480-800px)
- **Tablet**: 90% del ancho, márgenes
- **Mobile**: Fullscreen o bottom sheet

## 5. Navegación Mobile

### 5.1 Patrones de Navegación
#### Tab Bar (Bottom)
```
┌─────────────────────┐
│     Contenido       │
│                     │
├─────────────────────┤
│ 🏠  🔍  ➕  🔔  👤 │
└─────────────────────┘
```

#### Hamburger Menu
```
┌─────────────────────┐
│ ☰  App Title    ⋮  │
├─────────────────────┤
│     Contenido       │
└─────────────────────┘
```

### 5.2 Gestos Mobile
- **Swipe lateral**: Cambiar entre vistas
- **Pull to refresh**: Actualizar contenido  
- **Swipe down**: Cerrar modales
- **Pinch**: Zoom en contenido

## 6. Optimizaciones de Performance

### 6.1 Imágenes Responsivas
```
Desktop: hero-image@2x.jpg (2880px)
Tablet:  hero-image@1.5x.jpg (1536px)
Mobile:  hero-image@1x.jpg (750px)
```

### 6.2 Lazy Loading
- Imágenes fuera del viewport
- Componentes pesados
- Contenido secundario

### 6.3 Critical CSS
- Inline CSS crítico
- Defer CSS no crítico
- Priorizar above-the-fold

## 7. Touch Targets

### 7.1 Tamaños Mínimos
- **Botones**: 44x44px mínimo
- **Links**: 44px altura, padding vertical
- **Inputs**: 48px altura en mobile
- **Espaciado**: 8px mínimo entre targets

### 7.2 Zonas de Alcance
```
┌─────────────┐
│   Difícil   │  ← Evitar acciones
├─────────────┤     críticas aquí
│   Normal    │
├─────────────┤
│    Fácil    │  ← Zona óptima
│             │     para CTAs
└─────────────┘
```

## 8. Mejores Prácticas

### 8.1 Contenido
- Priorizar información esencial
- Revelar progresivamente
- Evitar scroll horizontal
- Textos cortos y concisos

### 8.2 Interacción
- Feedback táctil claro
- Estados hover → estados active
- Evitar hover-only features
- Confirmaciones para acciones destructivas

### 8.3 Testing
- Test en dispositivos reales
- Múltiples orientaciones
- Diferentes densidades de pixel
- Condiciones de red variables

## 9. Checklist Responsivo

- [ ] Breakpoints definidos y testeados
- [ ] Imágenes optimizadas por dispositivo
- [ ] Touch targets de tamaño adecuado
- [ ] Navegación adaptada a cada formato
- [ ] Tipografía legible en todos los tamaños
- [ ] Performance optimizada para mobile
- [ ] Gestos touch implementados
- [ ] Contenido priorizado correctamente
- [ ] Sin scroll horizontal involuntario
- [ ] Formularios optimizados para touch