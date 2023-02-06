import { SET_MDB_PATH } from "../actionTypes";

const initialState = {
    fullPath: ''
};

function mdb(state = initialState, action) {
    switch (action.type) {
        case SET_MDB_PATH: {
            return {
                fullPath: action.fullPath
            };
        }
        default: {
            return state;
        }
    }
}

export default mdb;
