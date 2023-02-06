import { SET_MDB_PATH } from "../actionTypes";

const initialState = {
    fullPath: ''
};

export default function(state = initialState, action) {
    switch (action.type) {
        case SET_MDB_PATH: {
            return action.payload.fullPath;
        }
        default: {
            return state;
        }
    }
};
