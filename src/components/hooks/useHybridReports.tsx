import { HybridReportsContext, HybridReportsContextProps } from 'components/providers/ReportProvider';
import { useContext } from 'react';

export default function useHybridReports(): HybridReportsContextProps {
  return useContext(HybridReportsContext) as HybridReportsContextProps;
}
