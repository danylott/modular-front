import 'antd/dist/antd.css';
import './App.css';

import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import ApplicationsPage from './components/ApplicationsPage';
import BarcodePage from './components/BarcodePage';
import CheckToken from './components/CheckToken';
import ClassesPage from './components/ClassesPage';
import ComputersPage from './components/ComputersPage';
import ClassPage from './components/ClassPage';
import CreateApplicationPage from './components/CreateApplicationPage';
import CreateClassPage from './components/CreateClassPage';
import CreatePasswordPage from './components/CreatePasswordPage';
import CreateUserpage from './components/CreateUserPage';
import DemoPage from './components/DemoPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ImagePage from './components/ImagePage';
import ImagesPage from './components/ImagesPage';
import LabelMarkupPage from './components/LabelMarkupPage';
import LoginPage from './components/LoginPage';
import ModelPage from './components/ModelPage';
import SideBar from './components/SideBar';
import TrainPage from './components/TrainPage';
import UsersPage from './components/UsersPage';
import ImprovedClassPage from "./components/ImprovedClassPage";

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Route exact path="/([0-9a-fA-f-]+)" component={SideBar} />
        <Route exact path="/([0-9a-fA-f-]+)" component={CheckToken} />
        <Switch>
          <Route path="/barcode" component={BarcodePage} />
          <Route path="/demo" component={DemoPage} />
          <Route path="/class" component={ClassPage} />
          <Route path="/image" component={ImagePage} />
          <Route path="/train" component={TrainPage} />
          <Route path="/models" component={ModelPage} />
          <Route path="/users" component={UsersPage} />
          <Route path="/create-user" component={CreateUserpage} />
          <Route path="/classes" component={ClassesPage} />
          <Route path="/computers" component={ComputersPage} />
          <Route path="/create-class" component={CreateClassPage} />
          <Route path="/improved-class" component={ImprovedClassPage} />
          <Route path="/label-markup" component={LabelMarkupPage} />
          <Route path="/choose-image" component={ImagesPage} />
          <Route path="/create-application" component={CreateApplicationPage} />
          <Route path="/applications" component={ApplicationsPage} />
          <Route path="/create-password/forgot" component={ForgotPasswordPage} />
          <Route path="/create-password/:registration_uuid" component={CreatePasswordPage} />
          <Route path="/" component={LoginPage} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}
