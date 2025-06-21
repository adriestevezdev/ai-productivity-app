# 🎨 AI Productivity App - Guía Visual Rápida

## Esquema de Color Principal
```
Dark Theme:
█████ #0A0A0B - Background Primary
█████ #1A1A1C - Background Secondary  
█████ #242426 - Background Tertiary
█████ #FF6B6B - Accent Primary (Coral Red)
█████ #4ECDC4 - Accent Secondary (Turquoise)
█████ #FFFFFF - Text Primary
█████ #A0A0A0 - Text Secondary
```

## Layout Visual
```
┌─────────────┬──────────────────────────┬──────────────────┐
│   SIDEBAR   │      MAIN CONTENT        │   SIDE PANEL     │
│   (260px)   │       (Flexible)         │     (380px)      │
│             │                          │                  │
│ ≡ Today     │    ╱╲                    │ ┌──────────────┐ │
│ ◉ Personal  │   ╱  ╲   Logo           │ │ All Tasks    │ │
│ ○ Team      │  ╱    ╲                 │ ├──────────────┤ │
│             │ ╱______╲                │ │ ○ Task 1     │ │
│ Projects +  │                          │ │ ○ Task 2     │ │
│             │ "What can I help with?" │ │ ○ Task 3     │ │
│             │                          │ └──────────────┘ │
│             │ [Action Button 1]        │                  │
│ ⚙ Settings  │ [Action Button 2]        │                  │
└─────────────┴──────────────────────────┴──────────────────┘
```

## Componentes Clave

### Botones
```
┌───────────────────┐  Primary (Filled)
│   Take Action     │  Background: #FF6B6B
└───────────────────┘  

┌───────────────────┐  Secondary (Outline)
│   Learn More      │  Border: #FF6B6B
└───────────────────┘  

    Cancel Action      Ghost (Text only)
    ─────────────      Hover: underline
```

### Cards
```
┌─────────────────────────┐
│ Card Title              │
│ ─────────────────────   │
│ Content goes here with  │
│ proper spacing and      │
│ hierarchy.              │
│                         │
│ [Action] [Secondary]    │
└─────────────────────────┘
Border-radius: 12px
Padding: 24px
Background: #1A1A1C
```

### Input States
```
┌─────────────────────┐
│ Placeholder text... │  Default
└─────────────────────┘

┌─────────────────────┐
│ User input text     │  Filled
└─────────────────────┘

┌─────────────────────┐
│ Focused input    |  │  Focus (accent border)
└─────────────────────┘
```

## Responsive Breakpoints
```
Desktop (>1280px)          Tablet (768-1280px)        Mobile (<768px)
┌───┬────────┬───┐        ┌───┬──────────┐           ┌─────────────┐
│ S │  Main  │ P │   →    │ S │   Main   │      →    │ ☰  Main     │
│ i │        │ a │        │ i │          │           │             │
│ d │        │ n │        │ d │ [Panel]  │           │   [Menu]    │
│ e │        │ e │        │ e │ overlay  │           │   [Panel]   │
└───┴────────┴───┘        └───┴──────────┘           └─────────────┘
```

## Características Distintivas

### 1. Minimalismo Oscuro
- Fondo negro profundo para reducir fatiga visual
- Acentos de color vibrantes pero usados con moderación
- Espaciado generoso para claridad

### 2. Geometría y Modernidad
- Logo geométrico triangular como punto focal
- Bordes redondeados consistentes (8-12px)
- Líneas limpias y formas simples

### 3. Jerarquía Clara
```
Título Principal ━━━━━━━━━━━━━━ (36px, Bold)
Subtítulo       ━━━━━━━━━━ (24px, Semibold)
Body Text       ━━━━━ (16px, Regular)
Caption         ━━ (12px, Regular)
```

### 4. Interacciones Sutiles
- Hover: Elevación + brillo sutil
- Active: Scale(0.98) feedback
- Transiciones: 200ms ease
- Loading: Skeleton screens elegantes

### 5. Espaciado Consistente (Base 8)
```
4px  (2xs) ▪
8px  (xs)  ▪▪
12px (sm)  ▪▪▪
16px (md)  ▪▪▪▪
24px (lg)  ▪▪▪▪▪▪
32px (xl)  ▪▪▪▪▪▪▪▪
48px (2xl) ▪▪▪▪▪▪▪▪▪▪▪▪
```

---

📌 **Nota**: Esta guía visual complementa la documentación detallada. 
Para especificaciones completas, consulta los documentos individuales en `/docs/design/`