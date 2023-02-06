import { SET_MDB_PATH } from "./actionTypes";

export const setMDBFullPath = fullPath => ({
    type: SET_MDB_PATH,
    payload: {
        fullPath
    }
});