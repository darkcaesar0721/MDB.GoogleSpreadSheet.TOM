import {
    CHANGE_CAMPAIGN_VIEW_STATE,
    INIT_CAMPAIGN_DATA,
    SET_SELECTED_CAMPAIGN
} from "../actionTypes";

const initialState = {
    viewState: 'list', //enum(list, add, update, delete)
    data: [],
    selectedCampaign: {}
};

function campaigns(state = initialState, action) {
    switch (action.type) {
        case CHANGE_CAMPAIGN_VIEW_STATE: {
            return Object.assign({...state}, {viewState: action.viewState});
        }
        case INIT_CAMPAIGN_DATA: {
            return Object.assign({...state}, {data: action.data});
        }
        case SET_SELECTED_CAMPAIGN: {
            return Object.assign({...state}, {selectedCampaign: action.campaign});
        }
        default: {
            return state;
        }
    }
}

export default campaigns;
