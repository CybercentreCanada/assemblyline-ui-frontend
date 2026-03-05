import Page1Route from 'pages/Page1';
import Page2Route from 'pages/Page2';
import SubmissionsRoute from 'pages/Submissions';
import SubmitRoute from 'pages/Submit';

//**************************************************************
// App Routes
//**************************************************************
export const APP_ROUTES = [SubmitRoute, Page1Route, Page2Route, SubmissionsRoute] as const;

export type AppRoute = (typeof APP_ROUTES)[number];
