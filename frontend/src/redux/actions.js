import axios from "axios";
import qs from "qs";
import {
    INIT_CAMPAIGN_DATA,
    INIT_GROUP_DATA,
    INIT_TEMP_GROUP_DATA,
    INIT_UPLOAD_DATA,
    SET_MDB_DATA
} from "./actionTypes";
import { APP_API_URL } from "../constants";

export const getMDBPath = () => async (dispatch) => {
    const result = await axios.get(APP_API_URL + 'api.php?class=Mdb&fn=get_data');

    dispatch({
        type: SET_MDB_DATA,
        data: result.data
    });
}

export const setMDBPath = (rows) => async (dispatch) => {
    const result = await axios.post(APP_API_URL + 'api.php?class=Mdb&fn=set_data', qs.stringify({
        rows
    }));

    dispatch({
        type: SET_MDB_DATA,
        data: result.data
    });
}

export const getUpload = () => async (dispatch) => {
    const json = await axios.get(APP_API_URL + 'json.php?action=get_upload');

    dispatch({
        type: INIT_UPLOAD_DATA,
        data: json.data
    });
}

export const updateUpload = (upload) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + 'json.php', qs.stringify({
        action: 'update_upload',
        upload
    }));

    dispatch({
        type: INIT_UPLOAD_DATA,
        data: json.data
    });
}

export const getTempGroup = () => async (dispatch) => {
    const json = await axios.get(APP_API_URL + 'json.php?action=get_temp_group');

    dispatch({
        type: INIT_TEMP_GROUP_DATA,
        temp: json.data
    });
}

export const createGroup = () => async (dispatch) => {
    const json = await axios.post(APP_API_URL + 'json.php', qs.stringify({
        action: 'create_group'
    }));

    dispatch({
        type: INIT_GROUP_DATA,
        data: json.data
    });
}

export const updateGroup = (index) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + 'json.php', qs.stringify({
        action: 'update_group',
        index
    }));

    dispatch({
        type: INIT_GROUP_DATA,
        data: json.data
    });
}

export const deleteGroup = (group) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + 'json.php', qs.stringify({
        action: 'delete_group',
        group
    }));

    dispatch({
        type: INIT_GROUP_DATA,
        data: json.data
    });
}

export const setIsUpdatedGroup = (index, callback) => async (dispatch) => {
    await axios.post(APP_API_URL + 'json.php', qs.stringify({
        action: 'set_isupdated_group',
        index
    }));

    callback();
}

export const initTempGroup = (callback = function(){}) => async (dispatch) => {
    await axios.post(APP_API_URL + 'json.php', qs.stringify({
        action: 'init_temp_group'
    }));

    callback();
}

export const updateTempGroup = (temp) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + 'json.php', qs.stringify({
        action: 'update_temp_group',
        temp
    }));
    dispatch({
        type: INIT_TEMP_GROUP_DATA,
        temp: json.data
    });
}

export const getGroups = () => async (dispatch) => {
    const json = await axios.get(APP_API_URL + 'json.php?action=get_groups');

    dispatch({
        type: INIT_GROUP_DATA,
        data: json.data
    });
}

export const getCampaigns = () => async (dispatch) => {
    const json = await axios.get(APP_API_URL + 'json.php?action=get_campaigns');

    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: json.data
    });
}

export const createCampaign = (campaign, callback = function(){}) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + 'json.php', qs.stringify({
        action: 'create_campaign',
        campaign
    }));

    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: json.data
    });
    callback();
}

export const updateCampaign = (campaign) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + 'json.php', qs.stringify({
        action: 'update_campaign',
        campaign
    }));
    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: json.data
    });
}

export const deleteCampaign = (campaign) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + 'json.php', qs.stringify({
        action: 'delete_campaign',
        campaign
    }));

    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: json.data
    });
}

export const updateGroupCampaign = (groupIndex, groupCampaignIndex, groupCampaign) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + 'json.php', qs.stringify({
        action: 'update_group_campaign',
        groupIndex,
        groupCampaignIndex,
        groupCampaign,
    }));
    dispatch({
        type: INIT_GROUP_DATA,
        data: json.data
    });
}

export const updateCampaignFields = (action, index, fields, values) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + 'json.php', qs.stringify({
        action: action,
        index,
        fields,
        values
    }));
    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: json.data
    });
}

export const updateUploadFields = (fields, values) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + 'json.php', qs.stringify({
        action: 'update_upload_fields',
        fields,
        values,
    }));

    dispatch({
        type: INIT_UPLOAD_DATA,
        data: json.data
    });
}