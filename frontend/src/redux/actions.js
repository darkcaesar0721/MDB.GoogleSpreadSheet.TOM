import axios from "axios";
import qs from "qs";
import {CHANGE_CAMPAIGN_VIEW_STATE, INIT_CAMPAIGN_DATA, SET_MDB_PATH} from "./actionTypes";
import { APP_API_URL } from "../constants";

export const getMDBPath = () => async (dispatch) => {
    const json = await axios.get(APP_API_URL + '/json.php?action=read_mdb_path');

    dispatch({
        type: SET_MDB_PATH,
        fullPath: json.data
    });
}

export const setMDBPath = (path) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + '/json.php', qs.stringify({
        action: 'write_mdb_path',
        path
    }));

    dispatch({
        type: SET_MDB_PATH,
        fullPath: path
    });
}

export const createCampaign = (campaign) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + '/json.php', qs.stringify({
        action: 'create_Campaign',
        campaign
    }));

    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: json.data
    });
}

export const updateCampaign = (campaign) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + '/json.php', qs.stringify({
        action: 'update_Campaign',
        campaign
    }));

    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: json.data
    });
}

export const deleteCampaign = (campaign) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + '/json.php', qs.stringify({
        action: 'delete_Campaign',
        campaign
    }));

    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: json.data
    });
}

export const changeCampaignViewState = (viewState) => (dispatch) => {
    dispatch({
        type: CHANGE_CAMPAIGN_VIEW_STATE,
        viewState: viewState
    });
}