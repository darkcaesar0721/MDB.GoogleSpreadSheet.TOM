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

export const DASHBOARD = '/';

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={DASHBOARD}>
                    <Route index path="/mdb" element={<MDBPath />} />
                    <Route index path="/campaigns" element={<Campaigns />} />
                    <Route index path="/campaigns/add" element={<CampaignAdd />} />
                    <Route index path="/campaigns/:index" element={<CampaignEdit />} />
                    <Route index path="/groups/add" element={<GroupAdd />} />
                    <Route index path="/groups/add/:index" element={<GroupAddSetting />} />
                    <Route index path="/groups/edit/:index" element={<GroupEdit />} />
                    <Route index path="/groups/edit/:groupIndex/:campaignIndex" element={<GroupEditSetting />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}