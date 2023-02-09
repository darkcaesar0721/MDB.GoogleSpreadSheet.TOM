import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MDBPath from "./components/MDBPath";
import Campaigns from "./components/Campaigns";
import CampaignAdd from "./components/CampaignAdd";
import CampaignEdit from "./components/CampaignEdit";
import GroupAdd from "./components/GroupAdd";
import GroupAddSetting from "./components/GroupAddSetting";
import GroupEdit from "./components/GroupEdit";
import GroupEditSetting from "./components/GroupEditSetting";
import Groups from "./components/Groups";

export const DASHBOARD = '/';

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={DASHBOARD}>
                    <Route path="/mdb" element={<MDBPath />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/campaigns/add" element={<CampaignAdd />} />
                    <Route path="/campaigns/:index" element={<CampaignEdit />} />
                    <Route path="/groups" element={<Groups />} />
                    <Route path="/groups/add" element={<GroupAdd />} />
                    <Route path="/groups/add/:index" element={<GroupAddSetting />} />
                    <Route path="/groups/:index" element={<GroupEdit />} />
                    <Route path="/groups/:groupIndex/:campaignIndex" element={<GroupEditSetting />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}