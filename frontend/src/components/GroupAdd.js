import {Button, Col, Divider, Input, message, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {
    getCampaigns, getGroups, getTempGroup, updateCampaign, updateTempGroup,createGroup,
} from "../redux/actions";
import MDBPath from "./MDBPath";
import { SettingOutlined } from '@ant-design/icons';
import {useNavigate} from "react-router-dom";
import MenuList from "./MenuList";

function GroupAdd(props) {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [columns, setColumns] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaignKeys, setSelectedCampaignKeys] = useState([]);
    const [name, setName] = useState('');
    const [messageApi, contextHolder] = message.useMessage();

    const navigate = useNavigate();

    useEffect(function() {
        props.getCampaigns();
        props.getTempGroup();
        props.getGroups();
    }, []);

    useEffect(function() {
        let _campaigns = props.campaigns.data;
        _campaigns = _campaigns.sort((a, b) => {
            if (parseInt(a.group.order) < parseInt(b.group.order)) return -1;

            return 0;
        });
        setCampaigns(_campaigns);

        setTableParams({
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                total: _campaigns.length,
            },
        });

        const order_column = {
            title: 'order',
            key: 'order',
            fixed: 'left',
            width: 60,
            render: (_, record) => {
                let number = -1;
                _campaigns.forEach((c, i) => {
                    if (c['query'] === record['query']) {
                        number = i + 1;
                        return;
                    }
                });

                let order = 0;
                if (record.group.order) {
                    order = record.group.order;
                } else {
                    order = number;
                }

                let selectedIndex = -1;
                if (selectedCampaignKeys) {
                    selectedCampaignKeys.forEach((key, i) => {
                        if (key === record.key) {
                            selectedIndex = i;
                            return;
                        }
                    })
                }

                return (
                    <Input disabled={selectedIndex === -1 ? true: false} value={order} onChange={(e) => {handleOrderChange(e, record)}}/>
                )
            }
        }

        let no_column = {
            title: 'no',
            key: 'no',
            fixed: 'left',
            width: 30,
            render: (_, record) => {
                let number = 0;
                _campaigns.forEach((c, i) => {
                    if (c['query'] === record['query']) {
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

        setColumns([order_column, no_column,
            {
                title: 'Query Name',
                dataIndex: 'query',
                key: 'query',
                width: 350,
            },
            {
                title: 'Sheet Name',
                dataIndex: 'schedule',
                key: 'schedule',
                width: 150
            },
            {
                title: 'Sheet URL Count',
                key: 'url_count',
                width: 120,
                render: (_, r) => {
                    return (
                        <span>{r.urls.length}</span>
                    )
                }
            },
            {
                title: 'Qty Available',
                dataIndex: 'last_qty',
                key: 'last_qty'
            },
            {
                title: 'Qty Uploaded',
                dataIndex: 'less_qty',
                key: 'less_qty'
            },
            {
                title: 'Last Phone',
                dataIndex: 'last_phone',
                key: 'last_phone',
                width: 130
            },
            {
                title: 'SystemCreateDate',
                dataIndex: 'SystemCreateDate',
                key: 'SystemCreateDate',
            },
            {
                title: 'Setting',
                key: 'operation',
                width: 60,
                render: (_, record) => {
                    let selectedIndex = -1;
                    if (selectedCampaignKeys) {
                        selectedCampaignKeys.forEach((key, i) => {
                            if (key === record.key) {
                                selectedIndex = i;
                            }
                        })
                    }

                    const settingUrl = "#/groups/add/" + record.index;
                    return (
                        <>
                            <Button disabled={selectedIndex === -1 ? true: false} icon={<SettingOutlined /> } href={settingUrl} style={{marginRight: 1}}/>
                        </>
                    )
                }
            },
        ]);

    }, [props.campaigns, selectedCampaignKeys]);

    useEffect(function() {
        setName(props.temp.name);
        setSelectedCampaignKeys(props.temp.selectedCampaignKeys);
    }, [props.temp]);

    const handleOrderChange = function(e, r) {
        r.group.order = e.target.value;

        let _campaigns = campaigns;
        _campaigns = _campaigns.map(c => (c.key === r.key ? r : c));
        _campaigns = _campaigns.sort((a, b) => {
            if (parseInt(a.group.order) < parseInt(b.group.order)) return -1;

            return 0;
        });

        let _selectedCampaignKeys = [];
        _campaigns.forEach(c => {
            selectedCampaignKeys.forEach(k => {
                if (c.key === k) _selectedCampaignKeys.push(k);
            });
        });
        setSelectedCampaignKeys(_selectedCampaignKeys);

        let temp = props.temp;
        temp.selectedCampaignKeys = _selectedCampaignKeys;
        props.updateTempGroup(temp);

        props.updateCampaign(r);
    }

    const handleSubmit = function() {
        if (validation()) {
            props.createGroup();
            messageApi.success('create success');
            setTimeout(function() {
                navigate('/groups');
            }, 1000);
        }
    }

    const validation = function() {
        if (!props.temp.name) {
            messageApi.warning("Please input group name.");
            return false;
        }
        if (!props.temp.selectedCampaignKeys || props.temp.selectedCampaignKeys.length === 0) {
            messageApi.warning("Please select campaigns.");
            return false;
        }

        if (props.groups.filter(g => g.key === props.temp.name).length > 0) {
            messageApi.warning("Already exist group name. Please input other name");
            return false;
        }

        return true;
    }

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            let _selectedCampaignKeys = [];
            campaigns.forEach(c => {
                selectedRowKeys.forEach(k => {
                    if (c.key === k) _selectedCampaignKeys.push(k);
                });
            });
            setSelectedCampaignKeys(_selectedCampaignKeys);

            let temp = props.temp;
            temp.selectedCampaignKeys = _selectedCampaignKeys;
            props.updateTempGroup(temp);
        }
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        let temp = props.temp;
        temp.name = e.target.value;
        props.updateTempGroup(temp);
    }

    return (
        <>
            {contextHolder}
            <MenuList
                currentPage="group"
            />
            <MDBPath/>
            <Divider>CAMPAIGN ACTION GROUP ADD FORM</Divider>
            <Row style={{marginBottom: 5}}>
                <Col span={2} offset={7}>
                    <span style={{lineHeight: 2}}>Group Name:</span>
                </Col>
                <Col span={7}>
                    <Input placeholder="8AM ACTION" value={name} onChange={handleNameChange}/>
                </Col>
            </Row>
            <Table
                bordered={true}
                size="small"
                rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: selectedCampaignKeys,
                    ...rowSelection,
                }}
                columns={columns}
                dataSource={campaigns}
                pagination={tableParams.pagination}
                onChange={handleTableChange}
            />
            <Row>
                <Col offset={20} span={4}>
                    <Button type="primary" onClick={handleSubmit} style={{marginBottom: 5, marginRight: 5}}>
                        Create Group
                    </Button>
                    <Button type="dashed" href="#/groups">
                        Cancel
                    </Button>
                </Col>
            </Row>
        </>
    );
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns, temp: state.groups.temp, groups: state.groups.data };
};

export default connect(
    mapStateToProps,
    { getCampaigns, updateCampaign, getTempGroup, updateTempGroup, createGroup, getGroups }
)(GroupAdd);
