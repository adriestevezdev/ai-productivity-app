'use client';

import { useState } from 'react';
import { ProjectAnalysis, ProjectGenerationResponse } from '@/types/conversation';
import { Goal } from '@/types/task';

interface ConversationAnalysisProps {
  conversationId: number;
  onAnalyze: () => Promise<ProjectAnalysis>;
  onGenerateProject: (analysis: ProjectAnalysis) => Promise<ProjectGenerationResponse>;
  onClose: () => void;
  onProjectCreated?: (goalId: number) => void;
}

export function ConversationAnalysis({ 
  conversationId, 
  onAnalyze, 
  onGenerateProject, 
  onClose,
  onProjectCreated 
}: ConversationAnalysisProps) {
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      const result = await onAnalyze();
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze conversation');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateProject = async () => {
    if (!analysis) return;

    try {
      setIsGenerating(true);
      setError(null);
      const result = await onGenerateProject(analysis);
      
      if (result.goal_id) {
        onProjectCreated?.(result.goal_id);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate project');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0A0A0B] border border-white/10 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              Project Analysis
            </h2>
            <button
              onClick={onClose}
              className="text-[#A0A0A0] hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!analysis ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#242426] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#4ECDC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-white mb-2">
                Analyze Conversation for Project
              </h3>
              <p className="text-[#A0A0A0] mb-6 max-w-2xl mx-auto">
                I'll analyze your conversation to extract project information and suggest a structured plan with tasks.
              </p>
              
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-[#4ECDC4] text-black rounded-lg hover:bg-[#45B7B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isAnalyzing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Analyzing...
                  </>
                ) : (
                  'Analyze Conversation'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Confidence Score */}
              <div className="bg-[#242426] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Analysis Confidence</span>
                  <span className="text-sm text-[#A0A0A0]">
                    {Math.round(analysis.confidence_score * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#1A1A1B] rounded-full h-2">
                  <div 
                    className="bg-[#4ECDC4] h-2 rounded-full transition-all"
                    style={{ width: `${analysis.confidence_score * 100}%` }}
                  />
                </div>
              </div>

              {/* Project Overview */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Project Overview</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-1">Title</label>
                    <div className="bg-[#242426] rounded-lg p-3">
                      <p className="text-white">{analysis.suggested_title}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-1">Description</label>
                    <div className="bg-[#242426] rounded-lg p-3">
                      <p className="text-white">{analysis.suggested_description}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-1">Estimated Timeline</label>
                    <div className="bg-[#242426] rounded-lg p-3">
                      <p className="text-white">{analysis.estimated_timeline}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Milestones */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Key Milestones</h3>
                <div className="space-y-2">
                  {analysis.key_milestones.map((milestone, index) => (
                    <div key={index} className="bg-[#242426] rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[#4ECDC4] font-medium">{index + 1}.</span>
                        <span className="text-white">{milestone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Tasks */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">
                  Suggested Tasks ({analysis.suggested_tasks.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {analysis.suggested_tasks.map((task, index) => (
                    <div key={index} className="bg-[#242426] rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{task.title}</h4>
                          {task.description && (
                            <p className="text-[#A0A0A0] text-sm mt-1">{task.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-xs text-[#A0A0A0]">
                            {task.estimated_duration}min
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-[#A0A0A0] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateProject}
                  disabled={isGenerating || analysis.confidence_score < 0.3}
                  className="px-6 py-2 bg-[#4ECDC4] text-black rounded-lg hover:bg-[#45B7B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Creating Project...
                    </>
                  ) : (
                    'Create Project & Tasks'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}