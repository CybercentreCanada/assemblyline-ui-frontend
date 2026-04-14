export type AppAccessibilityStates = {
  textSize: 'default' | 'sm' | 'md' | 'lg'; // override the css for the text size of the application
  textSpacing: 'default' | 'light' | 'moderate' | 'heavy'; // override the css for the text size of the application
  lineHeight: 'default' | '1.5x' | '1.75x' | '2x'; // override the css for the line height of the application
  cursor: 'default' | 'readingMask' | 'readingGuide'; // override the css for the cursor of the application
  textAlign: 'default' | 'alignLeft' | 'alignRight' | 'alignCenter' | 'justified'; // override the css for the text align of the application
  animation: 'play' | 'pause'; // override the css for animations
  tooltipLeaveDelay: 'default' | 'short' | 'moderate' | 'long'; // override deault default leaveDelay for MUI tooltips

  nextTextSize?: () => void;
  nextTextSpacing?: () => void;
  nextLineHeight?: () => void;
  nextCursor?: () => void;
  nextTextAlign?: () => void;
  toggleAnimation?: () => void;
  nextTooltipLeaveDelay?: () => void;
  resetToDefault?: () => void;
  getTextSize?: () => 14 | 16 | 18 | 20;
  getTextAlign?: () => 'center' | 'inherit' | 'justify' | 'left' | 'right';
  getLineHeight?: () => 'normal' | '1.5' | '1.75' | '2';
  getTextSpacing?: () => '1px' | '2px' | '4px' | '8px';
  getTooltipLeaveDelay?: () => 0 | 200 | 500 | 1000;
};
