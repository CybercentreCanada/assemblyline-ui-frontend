import type { Metric, ReportHandler } from 'web-vitals';

export const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Wrap the handler to validate metric objects before reporting
    const safeHandler: ReportHandler = (metric: Metric) => {
      try {
        // Validate metric has required properties and a valid start time
        if (
          !metric ||
          typeof metric !== 'object' ||
          !metric.name ||
          typeof metric?.['startTime'] !== 'number' ||
          typeof metric.value !== 'number'
        ) {
          return;
        }
        onPerfEntry(metric as never);
      } catch (e) {
        console.error(`Error reporting ${metric?.name || 'unknown'} metric:`, e);
      }
    };

    try {
      import('web-vitals')
        .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          try {
            getCLS(safeHandler);
          } catch (e) {
            console.error('Error initializing CLS:', e);
          }
          try {
            getFID(safeHandler);
          } catch (e) {
            console.error('Error initializing FID:', e);
          }
          try {
            getFCP(safeHandler);
          } catch (e) {
            console.error('Error initializing FCP:', e);
          }
          try {
            getLCP(safeHandler);
          } catch (e) {
            console.error('Error initializing LCP:', e);
          }
          try {
            getTTFB(safeHandler);
          } catch (e) {
            console.error('Error initializing TTFB:', e);
          }
        })
        .catch(e => {
          console.error('Error importing web-vitals:', e);
        });
    } catch (e) {
      console.error('Error setting up web vitals:', e);
    }
  }
};
