import {Breadcrumb, Button, Col, Form, InputNumber, message, Radio, Row, Spin, Table} from "antd";
import MDBPath from "./MDBPath";
import {connect} from "react-redux";
import {getCampaigns, getGroups} from "../redux/actions";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import {APP_API_URL} from "../constants";
import qs from "qs";

const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 20,
    },
};

const randomLayout = {
    labelCol: {
        span: 13,
    },
    wrapperCol: {
        span: 3,
    },
};

const UploadPreview = (props) => {
    const [form] = Form.useForm();
    const [staticCount, setStaticCount] = useState(1);
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [tip, setTip] = useState('');
    const {groupIndex, groupCampaignIndex, campaignIndex} = useParams();

    const navigate = useNavigate();

    useEffect(function() {
        props.getCampaigns();
        props.getGroups();
    }, []);

    useEffect(function() {
        if (props.groups.data.length > 0 && props.campaigns.data.length > 0) {
            let selectedCampaign = {};
            form.setFieldsValue(props.groups.data[groupIndex].campaigns[groupCampaignIndex]);
            setStaticCount(props.groups.data[groupIndex].campaigns[groupCampaignIndex].staticCount);
        }
    }, [props.groups.data, props.campaigns.data]);

    const handleUpload = function() {
        setLoading(true);
        setTip("Wait for uploading....");
        axios.post(APP_API_URL + 'total.php', qs.stringify({
            action: 'upload_one',
            groupIndex: groupIndex,
            groupCampaignIndex: groupCampaignIndex,
            campaignIndex: campaignIndex,
        })).then(function(resp) {
            setLoading(false);
            props.getCampaigns();
            props.getGroups();
            messageApi.success('upload success');
            setTimeout(function() {
                navigate('/preview/' + groupIndex + '/' + groupCampaignIndex + '/' + campaignIndex);
            }, [700]);
        })
    }

    return (
        <Spin spinning={loading} tip={tip} delay={500}>
            {contextHolder}
            <Row>
                <Col span={20} offset={1}>
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <a className="selected" href="#/">Upload Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a href="#/campaigns">Manage Campaign Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a href="#/groups">Manage Campaign Action Group Page</a>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
            </Row>
            <MDBPath/>
            <Row>
                <Col span={20} offset={2} style={{marginTop: 20}}>
                    {
                        props.groups.data.length > 0 && props.campaigns.data.length > 0 ?
                            <Form
                                {...layout}
                                name="add_group_form"
                                className="group-setting-form"
                                form={form}
                            >
                                <Form.Item
                                    name={['group']}
                                    label="Group Name"
                                >
                                    <span>{props.groups.data[groupIndex].name}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['query']}
                                    label="Query"
                                >
                                    <span>{props.campaigns.data[campaignIndex].query}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['way']}
                                    label="Select Way"
                                >
                                    <Radio.Group disabled={true} defaultValue="all">
                                        <Radio value="all">All Select</Radio>
                                        <Radio value="static">Static Select</Radio>
                                        <Radio value="random">Random Select</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                {
                                    props.groups.data[groupIndex].campaigns[groupCampaignIndex].way === 'static' ?
                                        <Form.Item
                                            name={['staticCount']}
                                            label="Static Count"
                                        >
                                            <Col span={3}>
                                                <InputNumber disabled={true} placeholder="Static Count" value={staticCount} onChange={(e) => {setStaticCount(e.target.value)}}/>
                                            </Col>
                                        </Form.Item> : ''
                                }
                                {
                                    props.groups.data[groupIndex].campaigns[groupCampaignIndex].way === 'random' ?
                                        <Col span={24}>
                                            <Form.Item
                                                {...randomLayout}
                                                name={['randomStart']}
                                                label="Random Count"
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(30% - 5px)',
                                                }}
                                            >
                                                <InputNumber disabled={true} placeholder="Start"/>
                                            </Form.Item>
                                            <Form.Item
                                                name={['random']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(5% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <span>~</span>
                                            </Form.Item>
                                            <Form.Item
                                                name={['randomEnd']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(30% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <InputNumber disabled={true} placeholder="End"/>
                                            </Form.Item>
                                        </Col> : ''
                                }
                            </Form> : ''
                    }
                </Col>
            </Row>
            <Row>
                <Col span={4} offset={10} style={{paddingLeft: '1.5rem'}}>
                    <Button type="primary" onClick={handleUpload} style={{marginRight: '0.5rem'}}>
                        Upload
                    </Button>
                    <Button type="dashed" href="#/">
                        Cancel
                    </Button>
                </Col>
            </Row>
        </Spin>
    )
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns, groups: state.groups };
};

export default connect(
    mapStateToProps,
    { getCampaigns, getGroups }
)(UploadPreview);