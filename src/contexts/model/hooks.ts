import { useContext } from 'react';
import { ModelContext, ModelContextType } from './context';

export function useModel(): ModelContextType {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}
