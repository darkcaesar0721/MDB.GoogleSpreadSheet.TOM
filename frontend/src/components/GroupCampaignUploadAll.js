import {Button, Checkbox, Col, Divider, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Input} from "antd/lib";

const GroupCampaignUploadAll = (props) => {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [columns, setColumns] = useState([]);
    const [selectedCampaignKeys, setSelectedCampaignKeys] = useState([]);

    useEffect(function() {
        setColumnInfo();
    }, [selectedCampaignKeys]);

    useEffect(function() {
        if (props.campaigns.length > 0) {
            setTableParams({
                ...tableParams,
                pagination: {
                    ...tableParams.pagination,
                    total: props.campaigns.length,
                },
            });
            setColumnInfo();
        }
    }, [props.campaigns]);

    const setColumnInfo = () => {
        let no_column = {
            title: 'no',
            key: 'no',
            width: 30,
            fixed: 'left',
            render: (_, record) => {

                let number = 0;
                props.campaigns.forEach((c, i) => {
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
                key: 'query',
                render: (_, record) => {
                    const link = '/groups/' + props.groupIndex + '/' + record.groupCampaignIndex + '/' + record.campaignIndex;
                    return (
                        <>
                            <Link to={link}>{record.query}</Link>
                        </>
                    )
                }
            },
            {
                title: 'Sheet Name',
                dataIndex: 'schedule',
                key: 'schedule',
            },
            {
                title: 'Send Type',
                dataIndex: 'way',
                key: 'way',
            },
            {
                title: 'Send Amount',
                key: 'count',
                render: (_, record) => {
                    let count = 'all';

                    switch (record.way) {
                        case 'all':
                            count = 'all';
                            break;
                        case 'static':
                            count = record.staticCount;
                            break;
                        case 'random':
                            count = record.randomStart + ' ~ ' + record.randomEnd;
                            break;
                        case 'date':
                            let old = record.dayOld == 1 ? 'today' : record.dayOld + 'old';
                            count = old + (record.isTime == "true" ? '  ' + record.time + record.meridiem : '');
                            break;
                    }

                    return (
                        <>
                            <span>{count}</span>
                        </>
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
                title: 'Edit Phone',
                key: 'edit_phone',
                width: 100,
                render: (_, r) => {
                    let selectedIndex = -1;
                    if (selectedCampaignKeys) {
                        selectedCampaignKeys.forEach((key, i) => {
                            if (key === r.key) {
                                selectedIndex = i;
                            }
                        })
                    }

                    return (
                        <Checkbox disabled={selectedIndex === -1 ? true: false} checked={r.isEditPhone == "true" ? true: false} onChange={(e) => {handlePhoneEditCheck(e, r)}}/>
                    )
                }
            },
            {
                title: 'Last Phone',
                key: 'last_phone',
                width: 130,
                render: (_, r) => {
                    let selectedIndex = -1;
                    if (selectedCampaignKeys) {
                        selectedCampaignKeys.forEach((key, i) => {
                            if (key === r.key) {
                                selectedIndex = i;
                            }
                        })
                    }

                    return (
                        <Input style={{color: '#000000'}} disabled={!(r.isEditPhone == "true" && selectedIndex !== -1)} value={r.last_phone} onChange={(e) => {handlePhoneChange(e, r)}}/>
                    )
                }
            },
            {
                title: 'SystemCreateDate',
                dataIndex: 'SystemCreateDate',
                key: 'SystemCreateDate',
            }
        ];
        setColumns(_columns);
    }

    useEffect(function() {
        if (props.uploadInfo.selectedCampaignKeys === undefined) setSelectedCampaignKeys([]);
        else setSelectedCampaignKeys(props.uploadInfo.selectedCampaignKeys);
    }, [props.uploadInfo]);

    const handlePhoneChange = (e, r) => {
        let campaign = props.gobalCampaigns[r.index];
        campaign.last_phone = e.target.value;
        props.updateCampaign(campaign);
    };

    const handlePhoneEditCheck = (e, r) => {
        let groupCampaign = props.group.campaigns[r.groupCampaignIndex];
        groupCampaign.isEditPhone = e.target.checked;
        props.updateGroupCampaign(props.groupIndex, r.groupCampaignIndex, groupCampaign);
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedCampaignKeys(selectedRowKeys);

            let uploadInfo = props.uploadInfo;
            uploadInfo.selectedCampaignKeys = selectedRowKeys;
            props.updateUpload(uploadInfo);
        }
    };

    return (
        <>
            <Row style={{marginTop: 10}}>
                <Col span={22} offset={1}>
                    <Divider style={{fontSize: '0.8rem'}}>GROUP CAMPAIGN LIST</Divider>
                    <Row style={{marginBottom: '0.5rem'}}>
                        <Col span={1} offset={11} style={{paddingLeft: '1rem'}}>
                            <Button type="primary" onClick={props.upload}>
                                Upload
                            </Button>
                        </Col> : ''
                    </Row>
                    <Table
                        bordered={true}
                        size="small"
                        columns={columns}
                        dataSource={props.campaigns}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                        rowSelection={{
                            type: 'checkbox',
                            selectedRowKeys: selectedCampaignKeys,
                            ...rowSelection,
                        }}
                    />
                </Col>
            </Row>
        </>
    )
}

export default GroupCampaignUploadAll;