import { combineReducers } from "redux";
import mdb from "./mdb";
import campaigns from "./campaigns";
import groups from "./groups";
import upload from "./upload";
export default combineReducers({ mdb, campaigns, groups, upload });
