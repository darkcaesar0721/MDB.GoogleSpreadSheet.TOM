import {Button, Checkbox, Col, Divider, message, Modal, Popconfirm, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Input} from "antd/lib";
import GroupCampaignUploadStatusList from "./GroupCampaignUploadStatusList";
import axios from "axios";
import {APP_API_URL} from "../constants";
import qs from "qs";
import {UploadOutlined} from "@ant-design/icons";

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
    const [open, setOpen] = useState(false);
    const [uploadStatusList, setUploadStatusList] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(function() {
        initUploadStatusList();
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
                        case 'random_first':
                            count = record.randomFirst + ': (' + record.randomStart + ' ~ ' + record.randomEnd + ')';
                            break;
                        case 'date':
                            let old = (record.dayOld == "0" || record.dayOld == "") ? 'today' : record.dayOld + ' day old ';
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

    const initUploadStatusList = () => {
        let campaignKeys = selectedCampaignKeys;
        if (!campaignKeys) campaignKeys = [];

        let index = 0;
        let _uploadStatusList = [];
        props.group.campaigns.forEach(c => {
            campaignKeys.forEach(key => {
                if (c.key == key) {
                    const campaign = props.globalCampaigns[c.index];

                    let uploadStatus = {};
                    uploadStatus.no = index + 1;
                    uploadStatus.status = index === 0 ? 'loading' : 'normal';
                    uploadStatus.query = campaign.query;
                    uploadStatus.last_qty = campaign.last_qty;
                    uploadStatus.less_qty = campaign.less_qty;
                    uploadStatus.key = key;
                    uploadStatus.index = index;
                    _uploadStatusList.push(uploadStatus);
                    index++;
                }
            });
        });
        setUploadStatusList(_uploadStatusList);
    }

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

    const changeUploadStatus = function(index, key) {
        setUploadStatusList(uploadStatusList.map((u, i) => {
            if (u.key === key) return Object.assign(u, {status: 'complete'});
            else if (index === i) return Object.assign(u, {status: 'loading'});
            else return u;
        }))
    }

    const handleUploadOne = function(key, index) {
        props.campaigns.forEach(c => {
            if (c.key === key) {
                axios.post(APP_API_URL + 'api.php?class=Upload&fn=upload_one_by_one', qs.stringify({
                    groupIndex: props.groupIndex,
                    groupCampaignIndex: c.groupCampaignIndex,
                    campaignIndex: c.campaignIndex,
                    manually: false
                })).then((resp) => {
                    props.getCampaigns();
                    changeUploadStatus(index + 1, key);

                    if (selectedCampaignKeys.length == (index + 1)) {
                        setTimeout(function() {
                            messageApi.success('Upload success');
                            setOpen(false);
                        }, 1000)
                    } else {
                        handleUploadOne(selectedCampaignKeys[index + 1], index + 1);
                    }
                });
            }
        })
    }

    const handleUploadClick = function() {
        if (selectedCampaignKeys === undefined || selectedCampaignKeys.length === 0) {
            messageApi.warning('Please select campaign list.');
            return;
        }

        initUploadStatusList();
        handleUploadOne(selectedCampaignKeys[0], 0);
        setOpen(true);
    }

    return (
        <>
            {contextHolder}
            <Row style={{marginTop: 10}}>
                <Col span={22} offset={1}>
                    <Divider style={{fontSize: '0.8rem'}}>GROUP CAMPAIGN LIST</Divider>
                    <Row style={{marginBottom: '0.5rem'}}>
                        <Col span={1} offset={11} style={{paddingLeft: '1rem'}}>
                            <Popconfirm
                                title="Upload data"
                                description="Are you sure to upload the row of this campaign?"
                                onConfirm={handleUploadClick}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button type="primary">
                                    Upload
                                </Button>
                            </Popconfirm>
                        </Col>
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
            <Modal
                title="UPLOAD STATUS LIST"
                centered
                open={open}
                width={500}
                header={null}
                footer={null}
            >
                <GroupCampaignUploadStatusList
                    uploadStatusList={uploadStatusList}
                />
            </Modal>
        </>
    )
}

export default GroupCampaignUploadAll;