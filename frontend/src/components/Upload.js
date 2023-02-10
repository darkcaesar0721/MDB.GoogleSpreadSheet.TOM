import {Breadcrumb, Button, Col, Divider, message, Radio, Row, Select, Spin, Table} from "antd";
import MDBPath from "./MDBPath";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {getCampaigns, getGroups} from "../redux/actions";
import axios from "axios";
import {APP_API_URL} from "../constants";
import qs from "qs";
import {EyeOutlined} from "@ant-design/icons";

const Upload = (props) => {
    const [options, setOptions] = useState([]);
    const [way, setWay] = useState('upload');
    const [group, setGroup] = useState('');
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
    const [defaultGroup, setDefaultGroup] = useState('');

    useEffect(function() {
        props.getCampaigns();
        props.getGroups();
    }, []);

    useEffect(function() {
        if (props.groups.data.length > 0) {
            let _options = [];
            props.groups.data.forEach((g, i) => {
                if (i == 0 && !defaultGroup) {
                    setDefaultGroup(g.name);
                    setGroup(g.name);
                }
                _options.push({
                    value: g.key,
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
                    campaigns.forEach((c, i) => {
                        if (c.key === record.query) {
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
                }
            ]
            _columns.push({
                title: 'Action',
                key: 'operation',
                fixed: 'right',
                width: 60,
                render: (_, record) => {
                    let groupIndex = -1;
                    props.groups.data.forEach((g, i) => {
                        if (g.name == group) groupIndex = i;
                    });
                    let campaignIndex = -1;
                    props.groups.data[groupIndex].campaigns.forEach((c, i) => {
                        if (c.key == record.query) campaignIndex = i;
                    });

                    const previewUrl = "/#/preview/" + groupIndex + '/' + campaignIndex;
                    return (
                        <>
                            <Button icon={<EyeOutlined /> } href={previewUrl} style={{marginRight: 1}}/>
                        </>
                    )
                }
            })

            setColumns(_columns);
        }
    }, [props.groups, campaigns]);

    useEffect(function() {
        let _campaigns = [];
        props.groups.data.forEach((g, i) => {
            if (g.name == group) {
                g.campaigns.forEach(g_c => {
                   props.campaigns.data.forEach(c => {
                       if (g_c.key == c.key) {
                           _campaigns.push(c);
                       }
                   })
                });
            }
        })
        setCampaigns(_campaigns);
    }, [props.groups, group]);

    const handleGroupChange = function(value) {
        setGroup(value);
    }

    const handleWayChange = function(e) {
        setWay(e.target.value);
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    const handleUpload = function() {
        if (validation()) {
            setLoading(true);
            setTip("Wait for uploading....");
            axios.post(APP_API_URL + '/total.php', qs.stringify({
                action: 'upload_data',
                group: group,
            })).then(function(resp) {
                setLoading(false);
                props.getCampaigns();
                props.getGroups();
                messageApi.success('upload success');
            })
        }
    }

    const validation = function() {
        if (!group) {
            messageApi.warning('Please select group.');
            return false;
        }

        return true;
    }

    return (
        <Spin spinning={loading} tip={tip} delay={500}>
            {contextHolder}
            <Row>
                <Col span={20} offset={1}>
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <a className="selected" href="/#/">Upload Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a href="/#/campaigns">Manage Campaign Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a href="/#/groups">Manage Campaign Action Group Page</a>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
            </Row>
            <MDBPath/>
            <Divider>MDB QUERY UPLOAD</Divider>
            <Row>
                <Col span={3} offset={8} style={{textAlign: 'right', lineHeight: '2rem', marginRight: '1rem'}}>
                    <span>Select Group:</span>
                </Col>
                <Col span={6}>
                    <Select
                        size="large"
                        defaultValue=""
                        onChange={handleGroupChange}
                        style={{ width: 200 }}
                        options={options}
                        value={group}
                    />
                </Col>
                {/*<Col span={3} style={{textAlign: 'right', lineHeight: '2rem', marginRight: '1rem'}}>*/}
                {/*    <span>Select Way:</span>*/}
                {/*</Col>*/}
                {/*<Col span={6}>*/}
                {/*    <Radio.Group onChange={handleWayChange} defaultValue="all" value={way}>*/}
                {/*        <Radio value="upload">Upload without preview</Radio>*/}
                {/*        <Radio value="preview">After preview, upload data</Radio>*/}
                {/*    </Radio.Group>*/}
                {/*</Col>*/}
            </Row>
            <Row style={{marginTop: '1rem'}}>
                {
                    way === 'upload' ?
                        <Col span={1} offset={11} style={{paddingLeft: '0.7rem'}}>
                            <Button type="primary" onClick={handleUpload}>
                                Upload
                            </Button>
                        </Col> : ''
                }
                {
                    way === 'preview' ?
                        <Col span={5} offset={10}>
                            <Button type="primary">
                                Get Data
                            </Button>
                            <Button type="primary" style={{marginLeft: '2rem'}} disabled={true} onClick={handleUpload}>
                                Upload
                            </Button>
                        </Col> : ''
                }
            </Row>
            <Divider>LAST UPLOAD RESULT</Divider>
            <Row style={{marginTop: 10}}>
                <Table
                    bordered={true}
                    size="small"
                    columns={columns}
                    dataSource={campaigns}
                    scroll={{
                        x: 1500,
                        y: 300,
                    }}
                    pagination={tableParams.pagination}
                    onChange={handleTableChange}
                />
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
)(Upload);