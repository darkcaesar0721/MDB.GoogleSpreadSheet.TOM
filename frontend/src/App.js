import './App.css';
import Campaign from './components/Campaign';
import MDBPath from './components/MDBPath';
import {useState} from "react";
import {ConfigProvider} from "antd";
import {AppRouter} from "./AppRouter";

function App() {
    return (
        <>
            <ConfigProvider>
                <AppRouter />
            </ConfigProvider>
            {/*<MDBPath/>*/}
            {/*<Campaign/>*/}
        </>
    );
}
export default App;
