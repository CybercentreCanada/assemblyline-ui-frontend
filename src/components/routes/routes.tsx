import React from "react";
import { Switch, Route } from "react-router-dom";

import Dashboard from "../routes/dashboard";
import Logout from "../routes/logout";
import NotFoundPage from "../routes/404_dl";
import Submit from "../routes/submit";
import Submissions from "../routes/submission";


const Routes = () => {
    return <Switch>
        <Route exact path="/" component={Submit} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/submit" component={Submit} />
        <Route path="/submissions" component={Submissions} />
        <Route exact path="/logout" component={Logout} />
        <Route component={NotFoundPage}/>
    </Switch>
}

export default Routes;
