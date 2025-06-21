# AI Productivity App

Aplicación web de productividad potenciada por IA con un diseño moderno, minimalista y centrado en la experiencia del usuario.

## 🎯 Visión del Proyecto

Crear una aplicación de productividad que combine:
- **Inteligencia Artificial** para asistencia inteligente
- **Diseño Minimalista** que reduce la fricción cognitiva
- **Interfaz Oscura** para reducir fatiga visual
- **Arquitectura Modular** para escalabilidad

## 📐 Diseño y Arquitectura

La documentación completa de diseño se encuentra en `/docs/design/`:

### Documentos Principales
- **[Sistema de Diseño](./docs/design/01-design-system.md)**: Colores, tipografía, componentes base
- **[Arquitectura del Layout](./docs/design/02-layout-architecture.md)**: Estructura de 3 columnas adaptativa
- **[Guía de Componentes](./docs/design/03-components-guide.md)**: Biblioteca de componentes UI
- **[Patrones de Interacción](./docs/design/04-interaction-patterns.md)**: UX patterns y micro-interacciones
- **[Jerarquía Visual](./docs/design/05-visual-hierarchy.md)**: Organización visual del contenido
- **[Diseño Responsivo](./docs/design/06-responsive-design.md)**: Adaptación multi-dispositivo
- **[Resumen Visual](./docs/design/visual-summary.md)**: Guía rápida visual

## 🎨 Identidad Visual

### Paleta Principal
- **Fondo**: #0A0A0B (Negro profundo)
- **Acento Primario**: #FF6B6B (Coral vibrante)
- **Acento Secundario**: #4ECDC4 (Turquesa)
- **Texto**: #FFFFFF (Blanco) / #A0A0A0 (Gris)

### Tipografía
- **Principal**: Inter o similar sans-serif moderna
- **Monoespaciada**: JetBrains Mono para código
- **Escala**: Sistema modular de 12px a 48px

## 🏗️ Estructura del Proyecto

```
ai-productivity-app/
├── docs/
│   ├── README.md              # Índice de documentación
│   └── design/                # Documentación de diseño
│       ├── 01-design-system.md
│       ├── 02-layout-architecture.md
│       ├── 03-components-guide.md
│       ├── 04-interaction-patterns.md
│       ├── 05-visual-hierarchy.md
│       ├── 06-responsive-design.md
│       └── visual-summary.md
├── src/                       # [Código fuente - por implementar]
├── assets/                    # [Recursos visuales - por implementar]
└── README.md                  # Este archivo
```

## 🚀 Características Principales del Diseño

### Layout de 3 Columnas
1. **Sidebar (260px)**: Navegación principal y herramientas
2. **Área Central (Flexible)**: Espacio de trabajo principal  
3. **Panel Lateral (380px)**: Contexto y tareas

### Diseño Responsivo
- **Desktop** (>1280px): Layout completo
- **Tablet** (768-1280px): Panel lateral como overlay
- **Mobile** (<768px): Navegación tipo drawer

### Componentes Clave
- Sistema de botones con 4 variantes
- Cards con elevación sutil
- Inputs con estados claros
- Navegación jerárquica
- Feedback visual inmediato

## 💡 Principios de Diseño

1. **Claridad sobre Complejidad**: Cada elemento tiene un propósito claro
2. **Espacio como Elemento**: Uso generoso del espacio negativo
3. **Consistencia Sistemática**: Patrones repetibles en toda la app
4. **Accesibilidad Primero**: WCAG AA compliant como mínimo
5. **Performance Optimizada**: Experiencia fluida en todos los dispositivos

## 🎯 Objetivos de UX

- **Reducir Fricción**: Flujos de trabajo optimizados
- **Feedback Inmediato**: Respuesta visual < 100ms
- **Aprendizaje Progresivo**: Complejidad revelada gradualmente
- **Contexto Preservado**: Estado y posición siempre claros

## 🔄 Estado del Proyecto

### ✅ Completado
- Documentación completa de diseño
- Sistema de diseño definido
- Arquitectura de layout especificada
- Guía de componentes detallada
- Patrones de interacción documentados
- Estrategia responsiva establecida

### 🚧 Próximos Pasos
- [ ] Implementación del sistema de diseño
- [ ] Desarrollo de componentes base
- [ ] Creación de prototipos interactivos
- [ ] Testing de usabilidad
- [ ] Optimización de performance

## 📚 Referencias

Para más detalles sobre cualquier aspecto del diseño, consulta la documentación específica en `/docs/design/`.

---

**Última actualización**: Junio 2025  
**Versión**: 1.0.0 (Documentación de Diseño)