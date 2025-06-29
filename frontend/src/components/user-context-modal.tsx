'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface UserContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    workDescription?: string;
    shortTermFocus?: string[];
    longTermGoals?: string[];
    otherContext?: string[];
  };
  isLoading?: boolean;
  onSave: (data: UserContextData) => void;
}

interface UserContextData {
  workDescription: string;
  shortTermFocus: string[];
  longTermGoals: string[];
  otherContext: string[];
}

export function UserContextModal({ isOpen, onClose, initialData, isLoading = false, onSave }: UserContextModalProps) {
  const [workDescription, setWorkDescription] = useState(initialData?.workDescription || '');
  const [shortTermFocus, setShortTermFocus] = useState(initialData?.shortTermFocus?.join('\n') || '');
  const [longTermGoals, setLongTermGoals] = useState(initialData?.longTermGoals?.join('\n') || '');
  const [otherContext, setOtherContext] = useState(initialData?.otherContext?.join('\n') || '');

  if (!isOpen) return null;

  const handleSave = () => {
    const data: UserContextData = {
      workDescription,
      shortTermFocus: shortTermFocus.split('\n').filter(item => item.trim()),
      longTermGoals: longTermGoals.split('\n').filter(item => item.trim()),
      otherContext: otherContext.split('\n').filter(item => item.trim())
    };
    onSave(data);
    onClose();
  };

  const getContextLevel = (text: string) => {
    const length = text.trim().length;
    if (length === 0) return 'poco contexto';
    if (length < 50) return 'poco contexto';
    if (length < 150) return 'contexto medio';
    return 'mucho contexto';
  };

  const getContextColor = (text: string) => {
    const level = getContextLevel(text);
    if (level === 'poco contexto') return 'text-red-500';
    if (level === 'contexto medio') return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-[#1A1A1C] rounded-xl border border-white/8 max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Contexto de Usuario</h2>
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                <span className="text-green-500">●</span>
                Cuanto más contexto proporciones, más podrán ayudarte nuestros Agentes de IA.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-[#4ECDC4]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2 text-gray-400">Cargando contexto...</span>
            </div>
          )}

          <div className={`space-y-6 ${isLoading ? 'opacity-50' : ''}`}>
            {/* Work Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-white">Descripción del Trabajo</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded bg-red-500/20 ${getContextColor(workDescription)}`}>
                  {getContextLevel(workDescription)}
                </span>
              </div>
              <textarea
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="- Soy un creador de contenido de IA y desarrollador de software"
                className="w-full h-24 px-4 py-3 bg-[#242426] border border-white/8 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-500">{workDescription.length} / 500</span>
              </div>
            </div>

            {/* Short Term Focus */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-white">Enfoque a Corto Plazo</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded bg-red-500/20 ${getContextColor(shortTermFocus)}`}>
                  {getContextLevel(shortTermFocus)}
                </span>
              </div>
              <textarea
                value={shortTermFocus}
                onChange={(e) => setShortTermFocus(e.target.value)}
                placeholder="- Hacer crecer mi comunidad de IA&#10;- Construir un SaaS de IA o Agente como Servicio"
                className="w-full h-32 px-4 py-3 bg-[#242426] border border-white/8 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-500">{shortTermFocus.length} / 500</span>
              </div>
            </div>

            {/* Long Term Goals */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <h3 className="text-lg font-medium text-white">Objetivos a Largo Plazo</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded bg-red-500/20 ${getContextColor(longTermGoals)}`}>
                  {getContextLevel(longTermGoals)}
                </span>
              </div>
              <textarea
                value={longTermGoals}
                onChange={(e) => setLongTermGoals(e.target.value)}
                placeholder="- Ser la comunidad de desarrolladores de IA hispanos más grande"
                className="w-full h-24 px-4 py-3 bg-[#242426] border border-white/8 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-500">{longTermGoals.length} / 500</span>
              </div>
            </div>

            {/* Other Context */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <h3 className="text-lg font-medium text-white">Otro Contexto</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded bg-red-500/20 ${getContextColor(otherContext)}`}>
                  {getContextLevel(otherContext)}
                </span>
              </div>
              <textarea
                value={otherContext}
                onChange={(e) => setOtherContext(e.target.value)}
                placeholder="- Vivo en España&#10;- Me encanta la IA&#10;- Tengo una comunidad de desarrolladores de IA en YouTube"
                className="w-full h-32 px-4 py-3 bg-[#242426] border border-white/8 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-500">{otherContext.length} / 500</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}