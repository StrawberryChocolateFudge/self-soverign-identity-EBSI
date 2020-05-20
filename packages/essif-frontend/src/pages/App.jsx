import React from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import { Layout } from "../components/Layout/Layout";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { Page } from "../components/Page/Page";
import PrivateRoute from "../components/PrivateRoute/PrivateRoute";
import Auth from "../components/Auth/Auth";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop";
import RequestVC from "./RequestVC/RequestVC";
import Homepage from "./Homepage/Homepage";
import NoMatch from "./NoMatch/NoMatch";
import Login from "./Login/Login";
import Logout from "./Logout/Logout";
import { BASENAME } from "../env";

// ECL styles
import "@ecl/ec-preset-website/dist/styles/ecl-ec-preset-website.css";

function App() {
  return (
    <Layout>
      <Auth>
        <BrowserRouter basename={BASENAME}>
          <ScrollToTop />
          <Header />
          <Page>
            <Switch>
              <Route exact path="/" component={Homepage} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/logout" component={Logout} />
              <PrivateRoute exact path="/request-vc" component={RequestVC} />
              <Route path="*">
                <NoMatch />
              </Route>
            </Switch>
          </Page>
          <Footer />
        </BrowserRouter>
      </Auth>
    </Layout>
  );
}

export default App;
