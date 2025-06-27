import { useState, useEffect } from 'react';
import { ProFeature, FREE_TIER_LIMITS } from '@/lib/features';

interface FeatureUsage {
  feature: ProFeature;
  count: number;
  date: string;
}

export function useFeatureUsage(feature: ProFeature) {
  const [usage, setUsage] = useState<number>(0);
  const [canUse, setCanUse] = useState<boolean>(true);
  
  useEffect(() => {
    // Load usage from localStorage
    const loadUsage = () => {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `feature_usage_${feature}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const data: FeatureUsage = JSON.parse(stored);
        
        // Reset if it's a new day
        if (data.date !== today) {
          localStorage.setItem(storageKey, JSON.stringify({
            feature,
            count: 0,
            date: today
          }));
          setUsage(0);
        } else {
          setUsage(data.count);
        }
      } else {
        // Initialize
        localStorage.setItem(storageKey, JSON.stringify({
          feature,
          count: 0,
          date: today
        }));
        setUsage(0);
      }
    };
    
    loadUsage();
  }, [feature]);
  
  useEffect(() => {
    // Check if can use based on limits
    const checkLimit = () => {
      switch (feature) {
        case ProFeature.AI_TASK_CREATION:
          setCanUse(usage < FREE_TIER_LIMITS.MAX_AI_TASKS_PER_DAY);
          break;
        case ProFeature.AI_INSIGHTS:
          // Weekly limit - would need more complex logic
          setCanUse(true); // Simplified for now
          break;
        default:
          setCanUse(true);
      }
    };
    
    checkLimit();
  }, [usage, feature]);
  
  const incrementUsage = () => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `feature_usage_${feature}`;
    const newCount = usage + 1;
    
    localStorage.setItem(storageKey, JSON.stringify({
      feature,
      count: newCount,
      date: today
    }));
    
    setUsage(newCount);
  };
  
  const getRemainingUses = () => {
    switch (feature) {
      case ProFeature.AI_TASK_CREATION:
        return Math.max(0, FREE_TIER_LIMITS.MAX_AI_TASKS_PER_DAY - usage);
      default:
        return 0;
    }
  };
  
  return {
    usage,
    canUse,
    incrementUsage,
    remainingUses: getRemainingUses()
  };
}