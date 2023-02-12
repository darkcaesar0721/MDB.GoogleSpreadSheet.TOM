import {Breadcrumb, Button, Col, Divider, message, Radio, Row, Select, Spin, Table} from "antd";
import MDBPath from "./MDBPath";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {getCampaigns, getGroups, getUpload, updateUpload} from "../redux/actions";
import axios from "axios";
import {APP_API_URL} from "../constants";
import qs from "qs";
import {EyeOutlined} from "@ant-design/icons";
import GroupCampaignList from "./GroupCampaignList";
import MenuList from "./MenuList";

const Upload = (props) => {
    const [options, setOptions] = useState([]);
    const [way, setWay] = useState('all');
    const [group, setGroup] = useState(0);
    const [loading, setLoading] = useState(false);
    const [tip, setTip] = useState('');
    const [messageApi, contextHolder] = message.useMessage();
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [columns, setColumns] = useState([]);
    const [campaigns, setCampaigns] = useState([]);

    useEffect(function() {
        props.getUpload();
        props.getCampaigns();
        props.getGroups();
    }, []);

    useEffect(function() {
        setGroup(parseInt(props.upload.group));
        setWay(props.upload.way);
    }, [props.upload]);

    useEffect(function() {
        let _options = [];
        props.groups.data.forEach((g, i) => {
            _options.push({
                value: i,
                label: g.name,
            })
        });
        setOptions(_options);
    }, [props.groups.data, props.campaigns.data]);

    useEffect(function() {
        let _campaigns = [];
        if (props.groups.data.length > 0 && props.campaigns.data.length > 0) {
            props.groups.data[group].campaigns.forEach((c, i) => {
                let campaign = props.campaigns.data[c.index];
                campaign.groupCampaignIndex = i;
                campaign.campaignIndex = c.index;
                campaign.way = c.way;
                campaign.randomStart = c.randomStart;
                campaign.randomEnd = c.randomEnd;
                campaign.staticCount = c.staticCount;
                campaign.isLast = c.isLast;
                _campaigns.push(campaign);
            });
        }
        setCampaigns(_campaigns);
    }, [props.groups.data, props.campaigns.data, group]);

    useEffect(function() {
        if (props.groups.data.length > 0) {
            let _options = [];
            props.groups.data.forEach((g, i) => {
                _options.push({
                    value: i,
                    label: g.name,
                })
            });
            setOptions(_options);

            setTableParams({
                ...tableParams,
                pagination: {
                    ...tableParams.pagination,
                    total: campaigns.length,
                },
            });

            let no_column = {
                title: 'no',
                key: 'no',
                width: 30,
                fixed: 'left',
                render: (_, record) => {

                    let number = 0;
                    props.campaigns.data.forEach((c, i) => {
                        if (c.key === record.key) {
                            number = i + 1;
                            return;
                        }
                    })

                    return (
                        <>
                            <span>{number}</span>
                        </>
                    )
                }
            }
            let _columns = [no_column,
                {
                    title: 'Query',
                    dataIndex: 'query',
                    key: 'query',
                    fixed: 'left',
                    width: 300,
                },
                {
                    title: 'Sheet URL',
                    dataIndex: 'url',
                    key: 'url',
                    fixed: 'left',
                    width: 500,
                },
                {
                    title: 'Schedule',
                    dataIndex: 'schedule',
                    key: 'schedule',
                    width: 80
                },
                {
                    title: 'Less Qty',
                    dataIndex: 'less_qty',
                    key: 'less_qty',
                    width: 80
                },
                {
                    title: 'Last Qty',
                    dataIndex: 'last_qty',
                    key: 'last_qty',
                    width: 80
                },
                {
                    title: 'Last Phone',
                    dataIndex: 'last_phone',
                    key: 'last_phone',
                    width: 100
                },
                {
                    title: 'SystemCreateDate',
                    dataIndex: 'SystemCreateDate',
                    key: 'SystemCreateDate',
                },
                {
                    title: 'Preview',
                    key: 'operation',
                    fixed: 'right',
                    width: 60,
                    render: (_, record) => {
                        if (props.groups.data[record.lastGroupIndex]) {
                            let campaignIndex = -1;
                            let groupCampaignIndex = -1;

                            props.groups.data[record.lastGroupIndex].campaigns.forEach((c, i) => {
                                if (c.key == record.key) {
                                    groupCampaignIndex = i;
                                    campaignIndex = c.index;
                                }
                            });
                            const previewUrl = "#/preview/" + record.lastGroupIndex + '/' + groupCampaignIndex + '/' + campaignIndex;
                            return (
                                <>
                                    <Button icon={<EyeOutlined /> } href={previewUrl} style={{marginRight: 1}}/>
                                </>
                            )
                        } else {
                            return (
                                <>
                                    <Button disabled={true} icon={<EyeOutlined /> } style={{marginRight: 1}}/>
                                </>
                            )
                        }
                    }
                }
            ]

            setColumns(_columns);
        }
    }, [props.groups, campaigns]);

    const handleGroupChange = function(value) {
        setGroup(value);
        props.updateUpload({group: value, way: way});
    }

    const handleWayChange = function(e) {
        setWay(e.target.value);
        props.updateUpload({group: group, way: e.target.value});
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    const handleUpload = function() {
        // if (validation()) {
        setLoading(true);
        setTip("Wait for uploading....");
        axios.post(APP_API_URL + 'total.php', qs.stringify({
            action: 'upload_all',
            groupIndex: group,
        })).then(function(resp) {
            setLoading(false);
            props.getCampaigns();
            props.getGroups();
            messageApi.success('upload success');
        })
        // }
    }

    const validation = function() {
        if (group) {
            messageApi.warning('Please select group.');
            return false;
        }

        return true;
    }

    return (
        <Spin spinning={loading} tip={tip} delay={500}>
            {contextHolder}
            <MenuList
                currentPage="upload"
            />
            <MDBPath/>
            <Divider>MDB QUERY UPLOAD</Divider>
            <Row>
                <Col span={3} offset={4} style={{textAlign: 'right', lineHeight: '2rem', marginRight: '1rem'}}>
                    <span>Select Group:</span>
                </Col>
                <Col span={3}>
                    <Select
                        size="large"
                        defaultValue=""
                        onChange={handleGroupChange}
                        style={{ width: 200 }}
                        options={options}
                        value={group}
                    />
                </Col>
                <Col span={3} style={{textAlign: 'right', lineHeight: '2rem', marginRight: '1rem'}}>
                    <span>Select Way:</span>
                </Col>
                <Col span={4}>
                    <Radio.Group onChange={handleWayChange} defaultValue="all" value={way}>
                        <Radio value="all">Upload all campaigns</Radio>
                        <Radio value="one">Upload one by one</Radio>
                    </Radio.Group>
                </Col>
            </Row>
            <Row style={{marginTop: '1rem'}}>
                {
                    way === 'all' ?
                        <Col span={1} offset={11} style={{paddingLeft: '1rem'}}>
                            <Button type="primary" onClick={handleUpload}>
                                Upload
                            </Button>
                        </Col> : ''
                }
            </Row>
            {
                way === 'one' ?
                    <GroupCampaignList
                        campaigns={campaigns}
                        groupIndex={group}
                    /> : ''
            }
            <Row style={{marginTop: 10}}>
                <Col span={22} offset={1}>
                    <Divider style={{fontSize: '0.7rem'}}>LAST CAMPAIGNS INFO</Divider>
                    <Table
                        bordered={true}
                        size="small"
                        columns={columns}
                        dataSource={props.campaigns.data}
                        scroll={{
                            x: 1500,
                            y: 300,
                        }}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                    />
                </Col>
            </Row>
        </Spin>
    )
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns, groups: state.groups, upload: state.upload };
};

export default connect(
    mapStateToProps,
    { getCampaigns, getGroups, getUpload, updateUpload }
)(Upload);