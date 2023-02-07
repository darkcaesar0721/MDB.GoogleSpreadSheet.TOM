import axios from "axios";
import qs from "qs";
import {CHANGE_CAMPAIGN_VIEW_STATE, INIT_CAMPAIGN_DATA, SET_MDB_PATH, SET_SELECTED_CAMPAIGN_INDEX} from "./actionTypes";
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

export const getCampaigns = () => async (dispatch) => {
    const json = await axios.get(APP_API_URL + '/json.php?action=get_campaigns');

    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: json.data
    });
}

export const createCampaign = (campaign) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + '/json.php', qs.stringify({
        action: 'create_campaign',
        campaign
    }));

    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: json.data
    });
}

export const updateCampaign = (campaign) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + '/json.php', qs.stringify({
        action: 'update_campaign',
        campaign
    }));
    console.log(json);
    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: json.data
    });
}

export const deleteCampaign = (campaign) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + '/json.php', qs.stringify({
        action: 'delete_campaign',
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

export const setSelectedCampaignIndex = (index) => (dispatch) => {
    dispatch({
        type: SET_SELECTED_CAMPAIGN_INDEX,
        selectedIndex: index
    });
}