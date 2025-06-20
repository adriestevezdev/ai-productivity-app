# 🎮 AI Productivity App - Documento de Diseño

## 📋 Índice
- [Visión General](#visión-general)
- [Arquitectura](#arquitectura)
- [Interfaz de Usuario](#interfaz-de-usuario)
- [Sistema de Gamificación](#sistema-de-gamificación)
- [Componentes Principales](#componentes-principales)
- [Flujo de Usuario](#flujo-de-usuario)
- [Estilo Visual](#estilo-visual)

## 🎯 Visión General

### Concepto
Una aplicación web de productividad que combina gestión de tareas con elementos de gamificación estilo RPG pixel art, donde los usuarios ganan experiencia (XP) y suben de nivel al completar tareas.

### Características Principales
- **Gestión de Tareas**: Sistema completo de creación, edición y seguimiento de tareas
- **Asistente IA**: Integración con IA para sugerencias inteligentes y automatización
- **Gamificación RPG**: Sistema de niveles, XP y logros
- **Interfaz Pixel Art**: Diseño nostálgico 8-bit con avatares personalizables

## 🏗️ Arquitectura del Diseño

### Principios de Diseño
- **Gamificación como Core**: Cada interacción debe sentirse como un juego
- **Simplicidad Visual**: Interfaz limpia con elementos pixel art que no distraigan
- **Feedback Instantáneo**: Animaciones y efectos que refuercen cada acción
- **Progresión Visible**: El usuario siempre debe ver su avance

## 🎨 Interfaz de Usuario

### Layout Principal

#### Sidebar Izquierdo
```
┌─────────────────────┐
│ 🎮 ProductivAI      │
├─────────────────────┤
│ 📅 Today            │
│ 👤 Personal    [+]  │
│   └─ New project    │
├─────────────────────┤
│ 👥 Team        [+]  │
├─────────────────────┤
│ 💬 Chats       [+]  │
│   └─ AI Assistant   │
└─────────────────────┘
```

#### Área Central - Vista Principal
```
┌──────────────────────────────────────────┐
│  ProductivAI              [+] [⚙️] [👤]  │
├──────────────────────────────────────────┤
│                                          │
│    ┌─────────────┐  ┌─────────────┐    │
│    │ Rival: 🧙‍♂️  │  │ You: 🦸‍♂️     │    │
│    │ ████████░░░ │  │ ██████████░ │    │
│    │ Level 8     │  │ Level 8     │    │
│    └─────────────┘  └─────────────┘    │
│                                          │
│    Today's Goals:                        │
│    ☐ Study Calculus          20 XP     │
│    ☑ Drink Water            +10 XP ✓   │
│    ☐ Gym 1hr               +30 XP     │
│    [+ Add Goal]                         │
│                                          │
│    Time Left Today:    08:23:15         │
│    Rival Gains XP In:  00:05:43         │
└──────────────────────────────────────────┘
```

### Componentes UI en Estilo Pixel Art

#### 1. Botones
```css
/* Botón estilo pixel art */
.pixel-button {
    background: #4A90E2;
    border: 2px solid #2E5A8E;
    box-shadow: 
        inset -2px -2px 0 #2E5A8E,
        inset 2px 2px 0 #6BA6F2;
    font-family: 'Pixel Font';
    padding: 8px 16px;
    cursor: pointer;
}

.pixel-button:hover {
    background: #6BA6F2;
}

.pixel-button:active {
    box-shadow: 
        inset 2px 2px 0 #2E5A8E,
        inset -2px -2px 0 #6BA6F2;
}
```

#### 2. Barras de Progreso XP
```css
/* Barra de XP pixelada */
.xp-bar {
    width: 200px;
    height: 20px;
    background: #2C2C2C;
    border: 2px solid #000;
    position: relative;
}

.xp-fill {
    height: 100%;
    background: linear-gradient(
        to right,
        #4CAF50 0%,
        #66BB6A 50%,
        #4CAF50 100%
    );
    transition: width 0.3s ease;
}

.xp-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Pixel Font';
    font-size: 10px;
    color: white;
    text-shadow: 1px 1px 0 black;
}
```

#### 3. Avatares Pixel Art
```
Sprites de personajes (32x32 pixels):
┌────────┐  ┌────────┐  ┌────────┐
│  ▄▄▄▄  │  │  ████  │  │  ░░░░  │
│ ▐█  █▌ │  │ ██░░██ │  │ ░█▀▀█░ │
│ ▐████▌ │  │ ██████ │  │ ░████░ │
│  ▀▀▀▀  │  │  ▀▀▀▀  │  │  ░░░░  │
└────────┘  └────────┘  └────────┘
 Warrior     Mage       Rogue
```

## 🎮 Sistema de Gamificación

### Mecánicas de Juego

#### 1. Sistema de Niveles
- **XP por Tarea**: 10-50 XP según dificultad
- **Niveles**: 1-100 con curva exponencial
- **Bonificaciones**: Rachas diarias, combos

#### 2. Sistema de Rivales
- **Rival AI**: Progresa automáticamente
- **Competencia**: Carreras de XP diarias
- **Recompensas**: Badges y títulos especiales

#### 3. Logros y Badges
```
🏆 First Task      - Completa tu primera tarea
⚡ Speed Runner     - Completa 10 tareas en 1 hora  
🔥 On Fire         - Racha de 7 días
💪 Unstoppable     - Alcanza nivel 50
```

### Fórmulas de Juego
```javascript
// Cálculo de XP necesario por nivel
const xpForLevel = (level) => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Bonus por racha
const streakBonus = (days) => {
    return Math.min(days * 5, 50); // Max 50% bonus
};

// XP del rival
const rivalXpGain = () => {
    const baseXP = 15;
    const variance = Math.random() * 10;
    return Math.floor(baseXP + variance);
};
```

## 🧩 Componentes Principales

### 1. TaskCard Component
```jsx
const TaskCard = ({ task }) => {
    return (
        <div className="pixel-card">
            <div className="task-header">
                <input type="checkbox" className="pixel-checkbox" />
                <span className="task-title">{task.title}</span>
                <span className="xp-badge">+{task.xp} XP</span>
            </div>
            <div className="task-actions">
                <button className="pixel-button mini">Edit</button>
                <button className="pixel-button mini danger">Delete</button>
            </div>
        </div>
    );
};
```

### 2. UserProfile Component
```jsx
const UserProfile = ({ user, rival }) => {
    return (
        <div className="profile-container">
            <div className="character-card rival">
                <img src={rival.sprite} className="pixel-avatar" />
                <h3>Rival: {rival.name}</h3>
                <XPBar current={rival.xp} max={rival.nextLevelXp} />
                <span className="level">Level {rival.level}</span>
            </div>
            
            <div className="character-card player">
                <img src={user.sprite} className="pixel-avatar" />
                <h3>You: {user.name}</h3>
                <XPBar current={user.xp} max={user.nextLevelXp} />
                <span className="level">Level {user.level}</span>
            </div>
        </div>
    );
};
```

### 3. AIAssistant Component
```jsx
const AIAssistant = () => {
    return (
        <div className="ai-assistant pixel-card">
            <div className="ai-header">
                <img src="/sprites/ai-wizard.png" className="ai-avatar" />
                <h3>AI Assistant</h3>
            </div>
            <div className="suggestions">
                <h4>What can I help with?</h4>
                <button className="suggestion-pill">
                    plan steps for a community growth
                </button>
                <button className="suggestion-pill">
                    brainstorm ai SaaS project ideas
                </button>
                <button className="suggestion-pill">
                    outline Agent as a Service roadmap
                </button>
            </div>
            <div className="ai-input">
                <input 
                    type="text" 
                    placeholder="Message AI Assistant..."
                    className="pixel-input"
                />
                <button className="pixel-button send">Send</button>
            </div>
        </div>
    );
};
```

## 🔄 Flujo de Usuario

### Onboarding
1. **Registro/Login** → Pantalla pixel art con animación
2. **Selección de Avatar** → Elegir clase (Warrior/Mage/Rogue)
3. **Tutorial Interactivo** → Crear primera tarea, ganar primeros XP
4. **Dashboard Principal** → Vista completa con rival AI

### Flujo de Tareas
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Create Task │ --> │ Set Priority │ --> │ Assign XP   │
└─────────────┘     └──────────────┘     └─────────────┘
                            |
                            v
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Level Up!   │ <-- │ Complete     │ <-- │ Work on Task│
└─────────────┘     └──────────────┘     └─────────────┘
```

### Interacción con IA
1. Usuario solicita ayuda
2. IA analiza contexto y tareas actuales
3. Genera sugerencias personalizadas
4. Usuario acepta/modifica sugerencias
5. Se crean tareas automáticamente con XP asignado

## 🎨 Estilo Visual

### Paleta de Colores
```css
:root {
    /* Colores principales */
    --pixel-bg: #F5E6D3;        /* Beige retro */
    --pixel-dark: #2C2C2C;      /* Gris oscuro */
    --pixel-blue: #4A90E2;      /* Azul principal */
    --pixel-green: #4CAF50;     /* Verde XP */
    --pixel-red: #E74C3C;       /* Rojo danger */
    
    /* Colores de acento */
    --pixel-yellow: #F39C12;    /* Amarillo logros */
    --pixel-purple: #9B59B6;    /* Púrpura especial */
    --pixel-cyan: #1ABC9C;      /* Cyan bonus */
}
```

### Tipografía
```css
@font-face {
    font-family: 'Pixel Font';
    src: url('/fonts/PressStart2P.ttf');
}

body {
    font-family: 'Pixel Font', monospace;
    font-size: 12px;
    line-height: 1.5;
    image-rendering: pixelated;
    -webkit-font-smoothing: none;
}
```

### Animaciones Pixel Art
```css
/* Animación de nivel up */
@keyframes levelUp {
    0% { transform: scale(1); }
    50% { transform: scale(1.5) rotate(10deg); }
    100% { transform: scale(1) rotate(0deg); }
}

/* Animación de moneda/XP */
@keyframes coinFloat {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-50px); opacity: 0; }
}

/* Animación de sprite caminando */
@keyframes spriteWalk {
    0% { background-position: 0 0; }
    100% { background-position: -128px 0; }
}
```

### Efectos Especiales
- **Partículas**: Al completar tareas
- **Screen shake**: Al subir de nivel
- **Efectos de sonido**: 8-bit chiptune
- **Transiciones**: Fade pixelado entre vistas

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile */
@media (max-width: 768px) {
    .sidebar { display: none; }
    .main-content { padding: 8px; }
    .pixel-card { margin: 4px 0; }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
    .sidebar { width: 200px; }
    .character-card { width: 45%; }
}

/* Desktop */
@media (min-width: 1025px) {
    .sidebar { width: 260px; }
    .main-content { max-width: 1200px; }
}
```

## 🚀 Próximos Pasos

1. **MVP Features**
   - Sistema básico de tareas
   - Perfiles de usuario con avatares
   - Sistema de XP y niveles
   - Rival AI básico

2. **Fase 2**
   - Integración completa con IA
   - Sistema de equipos
   - Marketplace de items/skins
   - Achievements avanzados

3. **Fase 3**
   - Mobile app
   - API pública
   - Integraciones (Calendar, Slack, etc.)
   - Modo multijugador real