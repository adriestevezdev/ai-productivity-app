# Sistema de Diseño

## 1. Principios de Diseño

### 1.1 Filosofía Central
- **Claridad sobre complejidad**: Cada elemento debe tener un propósito claro
- **Espacio como elemento de diseño**: Uso generoso del espacio negativo
- **Jerarquía visual intuitiva**: Guiar el ojo del usuario naturalmente
- **Consistencia sistemática**: Patrones repetibles y predecibles

### 1.2 Personalidad de Marca
- **Profesional**: Transmite confianza y competencia
- **Innovadora**: Refleja tecnología de vanguardia
- **Accesible**: Amigable sin sacrificar sofisticación
- **Eficiente**: Diseño que facilita la productividad

## 2. Paleta de Colores

### 2.1 Colores Primarios
#### Esquema Oscuro (Dark Theme)
- **Fondo Principal**: #0A0A0B - Negro profundo
- **Fondo Secundario**: #1A1A1C - Gris oscuro
- **Fondo Terciario**: #242426 - Gris medio
- **Acento Principal**: #FF6B6B - Rojo coral vibrante
- **Acento Secundario**: #4ECDC4 - Turquesa
- **Texto Principal**: #FFFFFF - Blanco puro
- **Texto Secundario**: #A0A0A0 - Gris claro
- **Bordes**: #2A2A2C - Gris sutil

### 2.2 Estados y Feedback
- **Éxito**: #4ADE80 - Verde esmeralda
- **Advertencia**: #FCD34D - Amarillo ámbar
- **Error**: #F87171 - Rojo suave
- **Información**: #60A5FA - Azul cielo

### 2.3 Gradientes
- **Gradiente Principal**: Linear de #FF6B6B a #4ECDC4
- **Gradiente Sutil**: Radial de transparente a rgba(255,255,255,0.05)
- **Gradiente de Fondo**: De #0A0A0B a #1A1A1C

## 3. Tipografía
### 3.1 Familia Tipográfica
- **Principal**: Inter o sistema similar (Sans-serif moderna)
- **Monoespaciada**: JetBrains Mono o Fira Code (para código)
- **Display**: Opcional para títulos grandes

### 3.2 Escala Tipográfica
- **Display**: 48px / 56px line-height
- **H1**: 36px / 44px line-height
- **H2**: 28px / 36px line-height
- **H3**: 24px / 32px line-height
- **H4**: 20px / 28px line-height
- **Body Large**: 18px / 28px line-height
- **Body**: 16px / 24px line-height
- **Body Small**: 14px / 20px line-height
- **Caption**: 12px / 16px line-height

### 3.3 Pesos Tipográficos
- **Regular**: 400 - Texto base
- **Medium**: 500 - Énfasis sutil
- **Semibold**: 600 - Títulos y CTAs
- **Bold**: 700 - Énfasis fuerte

## 4. Espaciado y Grid
### 4.1 Sistema de Espaciado (Base 8)
- **2xs**: 4px
- **xs**: 8px
- **sm**: 12px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px
- **4xl**: 96px

### 4.2 Grid System
- **Columnas**: 12 columnas flexibles
- **Gutter**: 24px (desktop), 16px (tablet), 12px (mobile)
- **Márgenes**: 48px (desktop), 24px (tablet), 16px (mobile)
- **Ancho máximo contenedor**: 1440px

## 5. Componentes Base

### 5.1 Botones
#### Variantes
- **Primario**: Fondo sólido con color de acento
- **Secundario**: Borde con fondo transparente
- **Terciario**: Solo texto sin borde
- **Ghost**: Fondo sutil al hover
#### Estados
- **Default**: Estado base
- **Hover**: Brillo aumentado 10%
- **Active**: Escala 0.98
- **Disabled**: Opacidad 0.5
- **Focus**: Ring de 2px con color de acento

### 5.2 Tarjetas (Cards)
- **Radio de borde**: 12px
- **Padding**: 24px
- **Sombra**: 0 1px 3px rgba(0,0,0,0.1)
- **Fondo**: Ligeramente más claro que el fondo base
- **Borde**: 1px sólido sutil

### 5.3 Inputs
- **Altura**: 40px (default), 48px (large), 32px (small)
- **Radio de borde**: 8px
- **Padding horizontal**: 16px
- **Borde**: 1px sólido, cambia en focus
- **Fondo**: Transparente con hover sutil

## 6. Iconografía

### 6.1 Estilo de Iconos
- **Tipo**: Line icons (iconos de línea)
- **Grosor**: 1.5px a 2px
- **Tamaños**: 16px, 20px, 24px, 32px
- **Estilo**: Minimalista y geométrico
### 6.2 Uso de Iconos
- **Navegación**: Siempre con texto en desktop
- **Acciones**: Pueden ser solo icono con tooltip
- **Estados**: Cambio sutil de color en interacción

## 7. Efectos y Animaciones

### 7.1 Transiciones
- **Duración estándar**: 200ms
- **Duración rápida**: 150ms
- **Duración lenta**: 300ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)

### 7.2 Tipos de Animación
- **Fade**: Opacidad para aparición/desaparición
- **Slide**: Desplazamiento suave para paneles
- **Scale**: Escala sutil para feedback
- **Rotate**: Para iconos de carga o actualización

### 7.3 Micro-interacciones
- **Hover en botones**: Elevación sutil
- **Click feedback**: Reducción de escala momentánea
- **Loading states**: Skeleton screens o spinners sutiles
- **Tooltips**: Aparición con delay de 500ms

## 8. Principios de Accesibilidad

### 8.1 Contraste
- **Texto normal**: Mínimo 4.5:1
- **Texto grande**: Mínimo 3:1
- **Elementos interactivos**: Mínimo 3:1

### 8.2 Navegación
- **Teclado**: Todos los elementos navegables
- **Focus visible**: Indicadores claros
- **Skip links**: Para saltar navegación
- **ARIA labels**: Descriptivos y precisos