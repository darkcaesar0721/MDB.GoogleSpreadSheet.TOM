import {
    CHANGE_CAMPAIGN_VIEW_STATE,
    INIT_CAMPAIGN_DATA,
    SET_SELECTED_CAMPAIGN_INDEX
} from "../actionTypes";

const initialState = {
    viewState: 'list', //enum(list, add, update, delete)
    data: [],
    selectedIndex: -1,
};

function campaigns(state = initialState, action) {
    switch (action.type) {
        case CHANGE_CAMPAIGN_VIEW_STATE: {
            return Object.assign({...state}, {viewState: action.viewState});
        }
        case INIT_CAMPAIGN_DATA: {
            return Object.assign({...state}, {data: action.data});
        }
        case SET_SELECTED_CAMPAIGN_INDEX: {
            return Object.assign({...state}, {selectedIndex: action.selectedIndex});
        }
        default: {
            return state;
        }
    }
}

export default campaigns;
