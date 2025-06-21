# Jerarquía Visual

## 1. Principios de Jerarquía

### 1.1 Niveles de Importancia
La jerarquía visual guía al usuario a través del contenido en orden de importancia:

1. **Nivel Primario**: Acción principal o información crítica
2. **Nivel Secundario**: Opciones alternativas o información de soporte
3. **Nivel Terciario**: Metadatos o información adicional
4. **Nivel Cuaternario**: Elementos decorativos o de ambiente

### 1.2 Herramientas de Jerarquía
- **Tamaño**: Elementos más grandes = más importantes
- **Color**: Colores vibrantes para destacar
- **Contraste**: Mayor contraste = mayor atención
- **Espacio**: Más espacio alrededor = más importancia
- **Posición**: Centro y arriba = más visible
- **Movimiento**: Elementos animados captan atención

## 2. Jerarquía Tipográfica

### 2.1 Escala y Proporción
```
Display (48px) ━━━━━━━━━━━━━━━━━
H1 (36px)      ━━━━━━━━━━━━━
H2 (28px)      ━━━━━━━━━
H3 (24px)      ━━━━━━
H4 (20px)      ━━━━
Body (16px)    ━━━
Small (14px)   ━━
Caption (12px) ━
```

### 2.2 Peso y Estilo
- **Bold (700)**: Títulos principales
- **Semibold (600)**: Subtítulos y CTAs
- **Medium (500)**: Énfasis sutil
- **Regular (400)**: Texto base
- **Light (300)**: Uso limitado, solo displays grandes

### 2.3 Color y Contraste
```
Primario    → Blanco (#FFFFFF) - Títulos
Secundario  → Gris claro (#E0E0E0) - Body text
Terciario   → Gris medio (#A0A0A0) - Captions
Desactivado → Gris oscuro (#606060) - Disabled
```

## 3. Jerarquía de Color

### 3.1 Uso Estratégico del Color
```
┌─────────────────────────────┐
│ ● Acento   → Acción principal│ 10%
│ ○ Neutros  → Contenido base │ 60%
│ ◐ Soporte  → UI elements    │ 30%
└─────────────────────────────┘
```

### 3.2 Regla 60-30-10
- **60%**: Color dominante (fondos oscuros)
- **30%**: Color secundario (elementos UI)
- **10%**: Color de acento (CTAs, highlights)

## 4. Jerarquía Espacial

### 4.1 Agrupación Visual
```
┌─────────────────┐  Grupo relacionado
│ Título          │  
│ Subtítulo       │  8px spacing
│ Contenido       │
└─────────────────┘
                     24px spacing
┌─────────────────┐  Grupo separado
│ Otro contenido  │
└─────────────────┘
```

### 4.2 Densidad de Información
- **Alta densidad**: Dashboards, tablas de datos
- **Media densidad**: Formularios, listas
- **Baja densidad**: Landing pages, onboarding

## 5. Jerarquía de Componentes

### 5.1 Tamaños de Botones
```
Primary CTA     → Large (48px height)
Secondary CTA   → Medium (40px height)  
Tertiary action → Small (32px height)
```

### 5.2 Cards y Contenedores
```
┌─────────────────────┐  Nivel 1
│ ┌─────────────────┐ │  
│ │   Nivel 2       │ │  Elevación
│ │ ┌─────────────┐ │ │  mediante
│ │ │  Nivel 3    │ │ │  sombras
│ │ └─────────────┘ │ │  y fondos
│ └─────────────────┘ │
└─────────────────────┘
```

## 6. Flujo Visual

### 6.1 Patrón F
Los usuarios escanean en patrón F:
1. Horizontal superior
2. Horizontal media
3. Vertical izquierda

### 6.2 Patrón Z
Para contenido menos denso:
1. Izquierda superior → Derecha superior
2. Diagonal al centro
3. Izquierda inferior → Derecha inferior

## 7. Técnicas de Énfasis

### 7.1 Contraste
- **Alto contraste**: Elementos críticos
- **Medio contraste**: Contenido regular
- **Bajo contraste**: Información secundaria

### 7.2 Aislamiento
```
                    ┌─────────┐
Mucho espacio  →    │ Destacado│    ← Mucho espacio
                    └─────────┘
```

### 7.3 Repetición y Ruptura
- Elementos repetidos crean ritmo
- Romper el patrón llama la atención
- Uso estratégico de la inconsistencia

## 8. Aplicación Práctica

### 8.1 Página de Inicio
1. **Logo central**: Máxima prominencia
2. **Mensaje principal**: Segundo nivel
3. **CTAs**: Tercer nivel con color de acento
4. **Navegación**: Presente pero sutil

### 8.2 Dashboard
1. **Métricas clave**: Tamaño grande, posición superior
2. **Gráficos**: Visualización prominente
3. **Tablas**: Información densa pero organizada
4. **Acciones**: Flotantes o fijas para acceso rápido

### 8.3 Formularios
1. **Título**: Claro y prominente
2. **Campos**: Agrupados lógicamente
3. **Labels**: Visibles pero no dominantes
4. **Botón submit**: Destacado al final

## 9. Reglas de Oro

1. **Un solo punto focal** por vista
2. **Máximo 3 niveles** de jerarquía visibles
3. **Consistencia** en patrones similares
4. **Espacio negativo** es tu amigo
5. **Test del entrecerrar**: Los elementos importantes deben ser visibles