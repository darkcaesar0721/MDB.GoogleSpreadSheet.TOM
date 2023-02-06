import axios from "axios";
import qs from "qs";
import { SET_MDB_PATH } from "./actionTypes";
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