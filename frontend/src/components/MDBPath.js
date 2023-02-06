import { Input, Col, Row } from 'antd';
import {useEffect, useState} from "react";
import {connect} from "react-redux";
import {getMDBPath, setMDBPath} from "../redux/actions";

function MDBPath(props) {
    const [path, setPath] = useState('');

    useEffect(function() {
        props.getMDBPath();
    }, []);

    useEffect(function() {
        setPath(props.mdb.fullPath);
    }, [props.mdb.fullPath]);

    const handleChange = function(e) {
        setPath(e.target.value);
        props.setMDBPath(e.target.value);
    }

    return (
        <Row style={{marginTop: '2rem'}}>
            <Col span={6} offset={9}>
                <Input addonBefore="MDB PATH" placeholder="C:\mdb_work\LeadDB_ThisSMALL.mdb" onChange={handleChange} value={path} />
            </Col>
        </Row>
    );
}

const mapStateToProps = state => {
    return { mdb: state.mdb };
};

export default connect(
    mapStateToProps,
    { getMDBPath, setMDBPath }
)(MDBPath);