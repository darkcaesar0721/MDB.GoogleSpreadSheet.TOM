import { combineReducers } from "redux";
import mdb from "./mdb";
import schedule from "./schedule";
import campaigns from "./campaigns";
import groups from "./groups";
import backup from "./backup";
import upload from "./upload";
export default combineReducers({ mdb, schedule, campaigns, groups, backup, upload});
