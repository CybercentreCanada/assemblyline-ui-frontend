import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { App } from 'app/app';
import 'app/core.i18n';
import 'fontsource-roboto';
import { createRoot } from 'react-dom/client';
import './index.css';

createRoot(document.getElementById('root')).render(<App />);
