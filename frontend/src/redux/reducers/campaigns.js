import {
    CHANGE_CAMPAIGN_VIEW_STATE,
    INIT_CAMPAIGN_DATA
} from "../actionTypes";

const initialState = {
    viewState: 'list', //enum(list, add, update, delete)
    data: []
};

function campaigns(state = initialState, action) {
    switch (action.type) {
        case CHANGE_CAMPAIGN_VIEW_STATE: {
            return Object.assign({...state}, {viewState: action.viewState});
        }
        case INIT_CAMPAIGN_DATA: {
            return Object.assign({...state}, {data: action.data});
        }
        default: {
            return state;
        }
    }
}

export default campaigns;
