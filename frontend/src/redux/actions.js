import axios from "axios";
import qs from "qs";
import {
    INIT_CAMPAIGN_DATA,
    INIT_GROUP_DATA,
    INIT_TEMP_GROUP_DATA,
    INIT_UPLOAD_DATA,
    INIT_MDB_DATA, INIT_BACKUP_DATA
} from "./actionTypes";
import { APP_API_URL } from "../constants";

export const getMDBPath = () => async (dispatch) => {
    const result = await axios.get(APP_API_URL + 'api.php?class=Mdb&fn=get_data');

    dispatch({
        type: INIT_MDB_DATA,
        data: result.data
    });
}

export const setMDBPath = (rows) => async (dispatch) => {
    const result = await axios.post(APP_API_URL + 'api.php?class=Mdb&fn=set_data', qs.stringify({
        rows
    }));

    dispatch({
        type: INIT_MDB_DATA,
        data: result.data
    });
}

export const getCampaigns = () => async (dispatch) => {
    const result = await axios.get(APP_API_URL + 'api.php?class=Campaign&fn=get_data');

    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: result.data
    });
}

export const createCampaign = (data, callback = function() {}) => async (dispatch) => {
    const result = await axios.post(APP_API_URL + 'api.php?class=Campaign&fn=create', qs.stringify({
        data
    }));

    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: result.data
    });
    callback();
}

export const updateCampaign = (file_name, campaign = {}, group = {}, callback = function() {}) => async (dispatch) => {
    const json = await axios.post(APP_API_URL + 'api.php?class=Campaign&fn=update', qs.stringify({
        file_name,
        campaign,
        group,
    }));

    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: json.data
    });
    callback();
}

export const getGroups = () => async (dispatch) => {
    const result = await axios.get(APP_API_URL + 'api.php?class=Group&fn=get_data');

    dispatch({
        type: INIT_GROUP_DATA,
        data: result.data
    });
}

export const initEditGroup = () => async (dispatch) => {
    await axios.post(APP_API_URL + 'api.php?class=Group&fn=init_edit_group');
}

export const getTempGroup = () => async (dispatch) => {
    const result = await axios.get(APP_API_URL + 'api.php?class=TempGroup&fn=get_data');

    dispatch({
        type: INIT_TEMP_GROUP_DATA,
        data: result.data
    });
}

export const updateTempGroup = (rows) => async (dispatch) => {
    const result = await axios.post(APP_API_URL + 'api.php?class=TempGroup&fn=update', qs.stringify({
        rows
    }));

    dispatch({
        type: INIT_TEMP_GROUP_DATA,
        data: result.data
    });
}

export const createGroup = (callback = function() {}) => async (dispatch) => {
    const result = await axios.post(APP_API_URL + 'api.php?class=Group&fn=create');

    dispatch({
        type: INIT_GROUP_DATA,
        data: result.data
    });

    callback();
}

export const setGroupEditData = (index, callback = function() {}) => async (dispatch) => {
    await axios.post(APP_API_URL + 'api.php?class=Group&fn=set_edit_group', qs.stringify({
        index
    }));

    callback();
}

export const updateGroup = (index, callback = function() {}) => async (dispatch) => {
    const result = await axios.post(APP_API_URL + 'api.php?class=Group&fn=update', qs.stringify({
        index
    }));

    dispatch({
        type: INIT_GROUP_DATA,
        data: result.data
    });

    callback();
}

export const getUpload = () => async (dispatch) => {
    const result = await axios.get(APP_API_URL + 'api.php?class=UploadConfig&fn=get_data');

    dispatch({
        type: INIT_UPLOAD_DATA,
        data: result.data
    });
}

export const updateUpload = (rows, callback = function() {}) => async (dispatch) => {
    const result = await axios.post(APP_API_URL + 'api.php?class=UploadConfig&fn=update', qs.stringify({
        rows
    }));

    dispatch({
        type: INIT_UPLOAD_DATA,
        data: result.data
    });

    callback();
}

export const updateGroupCampaign = (groupIndex, groupCampaignIndex, rows, callback = function() {}) => async (dispatch) => {
    const result = await axios.post(APP_API_URL + 'api.php?class=Group&fn=update_group_campaign', qs.stringify({
        groupIndex,
        groupCampaignIndex,
        rows
    }));
    dispatch({
        type: INIT_GROUP_DATA,
        data: result.data
    });
    callback();
}

export const getBackup = (callback = function() {}) => async (dispatch) => {
    const result = await axios.post(APP_API_URL + 'api.php?class=Backup&fn=get_data');
    dispatch({
        type: INIT_BACKUP_DATA,
        data: result.data
    });
    callback();
}

export const updateBackup = (rows, callback = function() {}) => async (dispatch) => {
    const result = await axios.post(APP_API_URL + 'api.php?class=Backup&fn=set_data', qs.stringify({
        rows
    }));

    dispatch({
        type: INIT_BACKUP_DATA,
        data: result.data
    });
    callback();
}

export const getLastPhone = (campaignIndex, callback) => async (dispatch) => {
    const result = await axios.post(APP_API_URL + 'api.php?class=Upload&fn=get_last_phone', qs.stringify({
        campaignIndex
    }));

    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: result.data
    });
    callback();
}

export const uploadAfterPreview = (groupIndex, groupCampaignIndex, campaignIndex, callback) => async (dispatch) => {
    const result = await axios.post(APP_API_URL + 'api.php?class=Upload&fn=upload_after_preview', qs.stringify({
        groupIndex,
        groupCampaignIndex,
        campaignIndex
    }));
    console.log(result);
    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: result.data
    });
    callback();
}