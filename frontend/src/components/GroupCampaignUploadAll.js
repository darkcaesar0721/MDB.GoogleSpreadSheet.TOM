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
    const [campaigns, setCampaigns] = useState([]);

    useEffect(function() {
        setColumnInfo();
    }, [selectedCampaignKeys]);

    useEffect(function() {
        if (props.campaigns.length > 0) {
            setCampaigns(props.campaigns);

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
        let _columns = [
            {
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
            },
            {
                title: 'yellow',
                key: 'active',
                width: 50,
                render: (_, r) => {
                    return (
                        <Checkbox checked={(r.isLast == true || r.isLast == "true")} onChange={(e) => {handleIsLastCheck(e, r)}}/>
                    )
                }
            },
            {
                title: 'Comment',
                key: 'comment',
                width: 160,
                render: (_, r) => {
                    return (
                        <Input value={r.comment} onBlur={() => {handleCommentSave(r)}} onChange={(e) => {handleCommentChange(e, r)}}/>
                    )
                }
            },
            {
                title: 'Query Name',
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
                width: 40,
            },
            {
                title: 'Send Amount',
                key: 'count',
                width: 90,
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
                            let old = record.dayOld == 1 ? 'today' : record.dayOld + ' day old ';
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
                key: 'last_qty',
                width: 25,
            },
            {
                title: 'Qty Uploaded',
                dataIndex: 'less_qty',
                key: 'less_qty',
                width: 25
            },
            {
                title: 'Edit Phone',
                key: 'edit_phone',
                width: 30,
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
                width: 110,
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
                        <Input onBlur={() => {handlePhoneSave(r)}} style={{color: '#000000'}} disabled={!(r.isEditPhone == "true" && selectedIndex !== -1)} value={r.last_phone} onChange={(e) => {handlePhoneChange(e, r)}}/>
                    )
                }
            },
            {
                title: 'Get Phone',
                key: 'get_phone',
                width: 80,
                render: (_, r) => {
                    return (
                        <Button type="primary" onClick={(e) => {props.getLastPhone(r)}}>Get Phone</Button>
                    )
                }
            },
            {
                title: 'SystemCreateDate',
                dataIndex: 'SystemCreateDate',
                key: 'SystemCreateDate',
                width: 100,
            }
        ];
        setColumns(_columns);
    }

    useEffect(function() {
        if (props.uploadInfo.selectedCampaignKeys === undefined) setSelectedCampaignKeys([]);
        else setSelectedCampaignKeys(props.uploadInfo.selectedCampaignKeys);
    }, [props.uploadInfo]);

    const handlePhoneEditCheck = (e, r) => {
        props.updateGroupCampaign(props.groupIndex, r.groupCampaignIndex, {isEditPhone: e.target.checked});
    }

    const handleIsLastCheck = (e, r) => {
        let campaign = props.globalCampaigns[r.index];
        const isLast = (campaign.isLast == true || campaign.isLast == "true") ? false : true;
        props.updateCampaign(r.file_name, {isLast: isLast});
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    const handleCommentChange = (e, r) => {
        r.comment = e.target.value;
        setCampaigns([...props.campaigns].map(c => {
            return (c.index === r.index ? r : c);
        }));
    }

    const handleCommentSave = (r) => {
        props.updateGroupCampaign(props.groupIndex, r.groupCampaignIndex, {comment: r.comment});
    }

    const handlePhoneChange = (e, r) => {
        r.last_phone = e.target.value;
        setCampaigns([...props.campaigns].map(c => {
            return (c.index === r.index ? r : c);
        }));
    };

    const handlePhoneSave = (r) => {
        props.updateCampaign(r.file_name, {last_phone: r.last_phone});
    }

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedCampaignKeys(selectedRowKeys);

            if (selectedRowKeys.length == 0) selectedRowKeys = '';
            props.updateUpload({'selectedCampaignKeys': selectedRowKeys});
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
                        dataSource={campaigns}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                        rowSelection={{
                            type: 'checkbox',
                            selectedRowKeys: selectedCampaignKeys,
                            ...rowSelection,
                        }}
                        rowClassName={(record, index) => ((record.isLast == true || record.isLast == "true") ? "campaign_active" : "") }
                    />
                </Col>
            </Row>
        </>
    )
}

export default GroupCampaignUploadAll;