import {Button, Checkbox, Col, Divider, message, Modal, Popconfirm, Radio, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Input} from "antd/lib";
import GroupCampaignUploadStatusList from "./GroupCampaignUploadStatusList";
import axios from "axios";
import {APP_API_URL} from "../constants";
import qs from "qs";
import moment from "moment/moment";
import StyledCheckBox from "../shared/StyledCheckBox";

let current_date = new Date()
let pstDate = current_date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles"
});
const wday = moment(pstDate).format('dddd');

const GroupCampaignUploadAll = (props) => {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
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

    useEffect(function() {
        let _uploadStatusList = [];
        uploadStatusList.forEach(s => {
            let _uploadStatus = s;
            _uploadStatus.last_phone = s.status  == 'complete' ? props.globalCampaigns[s.campaignIndex].last_phone : '';
            _uploadStatus.SystemCreateDate = s.status  == 'complete' ? props.globalCampaigns[s.campaignIndex].SystemCreateDate : '';
            _uploadStatus.last_qty = s.status  == 'complete' ? props.globalCampaigns[s.campaignIndex].last_qty : '';
            _uploadStatus.less_qty = s.status  == 'complete' ? props.globalCampaigns[s.campaignIndex].less_qty : '';
            _uploadStatusList.push(_uploadStatus);
        })
        setUploadStatusList(_uploadStatusList);
    }, [props.globalCampaigns]);

    useEffect(function() {
        props.updateUpload({'selectedCampaignKeys': selectedCampaignKeys.length > 0 ? selectedCampaignKeys : ''});
    }, [selectedCampaignKeys]);

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
                        if (c.key == record.key) {
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
                title: 'Weekday',
                key: 'weekday',
                width: 160,
                render: (_, r) => {
                    let weekday = [];

                    const _weekday = (r.weekday === undefined ? {} : r.weekday);
                    Object.keys(_weekday).forEach((k) => {
                        if (_weekday[k] === 'true' || _weekday[k] === true) weekday.push(k);
                    });

                    return (
                        <Checkbox.Group style={{width: '100%'}} value={weekday}>
                            <Row>
                                <Col flex={1}>
                                    <StyledCheckBox onChange={(v) => {handleWeekdayChange(v, r)}} value="Sunday">S</StyledCheckBox>
                                </Col>
                                <Col flex={1}>
                                    <StyledCheckBox onChange={(v) => {handleWeekdayChange(v, r)}} value="Monday">M</StyledCheckBox>
                                </Col>
                                <Col flex={1}>
                                    <StyledCheckBox onChange={(v) => {handleWeekdayChange(v, r)}} value="Tuesday">T</StyledCheckBox>
                                </Col>
                                <Col flex={1}>
                                    <StyledCheckBox onChange={(v) => {handleWeekdayChange(v, r)}} value="Wednesday">W</StyledCheckBox>
                                </Col>
                                <Col flex={1}>
                                    <StyledCheckBox onChange={(v) => {handleWeekdayChange(v, r)}} value="Thursday">Th</StyledCheckBox>
                                </Col>
                                <Col flex={1}>
                                    <StyledCheckBox onChange={(v) => {handleWeekdayChange(v, r)}} value="Friday">F</StyledCheckBox>
                                </Col>
                                <Col flex={1}>
                                    <StyledCheckBox onChange={(v) => {handleWeekdayChange(v, r)}} value="Saturday">S</StyledCheckBox>
                                </Col>
                            </Row>
                        </Checkbox.Group>
                    )
                }
            },
            {
                title: 'N G Y P',
                key: 'color',
                width: 90,
                render: (_, r) => {
                    const color = r.color === undefined || r.color === "" ? "none" : r.color;
                    return (
                        <Radio.Group onChange={(e) => {handleColorChange(e, r)}} defaultValue="none" value={color}>
                            <Radio.Button value="none">N</Radio.Button>
                            <Radio.Button value="green">G</Radio.Button>
                            <Radio.Button value="yellow">Y</Radio.Button>
                            <Radio.Button value="pink">P</Radio.Button>
                        </Radio.Group>
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
                    return (
                        <>
                            <span>{customUploadAmount(record)}</span>
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
                title: 'LastUploadDate',
                dataIndex: 'lastUploadDateTime',
                key: 'lastUploadDateTime',
                width: 130,
                render: (_, r) => {
                    return (
                        <span>{r.lastUploadDateTime === "" || r.lastUploadDateTime === undefined ? "" : moment(r.lastUploadDateTime).format('M/D/Y, hh:mm A')}</span>
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
                            if (key == r.key) {
                                selectedIndex = i;
                            }
                        })
                    }

                    return (
                        <Input style={{color: r.isGetLastPhone  ? 'red' : 'black'}} onBlur={() => {handlePhoneSave(r)}} value={r.last_phone} onChange={(e) => {handlePhoneChange(e, r)}}/>
                    )
                }
            },
            {
                title: 'SystemCreateDate',
                dataIndex: 'SystemCreateDate',
                key: 'SystemCreateDate',
                width: 130,
                render: (_, r) => {
                    return (
                        <span style={{color: r.isGetLastPhone  ? 'red' : 'black'}}>{r.SystemCreateDate === "" || r.SystemCreateDate === undefined ? "" : moment(r.SystemCreateDate).format('M/D/Y, hh:mm A')}</span>
                    )
                }
            },
            {
                title: 'Last Phone',
                key: 'get_phone',
                width: 90,
                render: (_, r) => {
                    return (
                        <Button type="primary" onClick={(e) => {props.getLastPhone(r)}}>Last Phone</Button>
                    )
                }
            }
        ];
        setColumns(_columns);
    }

    useEffect(function() {
        setSelectedCampaignKeys((oldState) => {
            let newState = [];
            props.group.campaigns.forEach(c => {
                if (c.weekday[wday] === 'true' || c.weekday[wday] === true) newState.push(c.key);
            });
            return newState;
        })
    }, [props.group]);

    const handleWeekdayChange = function(e, r) {
        const weekday = {};
        weekday[e.target.value] = e.target.checked;
        props.updateGroupCampaignWeekday(props.groupIndex, r.groupCampaignIndex, weekday);
    }

    const handleColorChange = function(e, r) {
        props.updateGroupCampaign(props.groupIndex, r.groupCampaignIndex, {color: e.target.value});
    }

    const customUploadAmount = function(r) {
        let count = 'all';

        switch (r.way) {
            case 'all':
                count = 'all';
                break;
            case 'static':
                count = r.staticCount;
                break;
            case 'random':
                count = r.randomStart + ' ~ ' + r.randomEnd;
                break;
            case 'random_first':
                count = r.randomFirst + ': (' + r.randomStart + ' ~ ' + r.randomEnd + ')';
                break;
            case 'date':
                let old = (r.dayOld == "0" || r.dayOld == "") ? 'today' : r.dayOld + ' day old ';
                count = old + (r.isTime == "true" ? '  ' + r.time + r.meridiem : '');
                break;
        }
        return count;
    }

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
                    uploadStatus.index = index;
                    uploadStatus.key = key;
                    uploadStatus.query = campaign.query;
                    uploadStatus.campaignIndex = c.index;
                    uploadStatus.way = c.way;
                    uploadStatus.amount = customUploadAmount(c);
                    uploadStatus.status = index == 0 ? 'loading' : 'normal';
                    _uploadStatusList.push(uploadStatus);
                    index++;
                }
            });
        });
        setUploadStatusList(_uploadStatusList);
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
            return (c.index == r.index ? r : c);
        }));
    }

    const handleCommentSave = (r) => {
        if (r.comment === undefined) r.comment = "";
        props.updateGroupCampaign(props.groupIndex, r.groupCampaignIndex, {comment: r.comment});
    }

    const handlePhoneChange = (e, r) => {
        r.last_phone = e.target.value;
        setCampaigns([...props.campaigns].map(c => {
            return (c.index == r.index ? r : c);
        }));
    };

    const handlePhoneSave = (r) => {
        props.updateCampaign(r.file_name, {last_phone: r.last_phone});
    }

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        getCheckboxProps: r => ({
            disabled: true
        })
    };

    const changeUploadStatus = function(index, key) {
        setUploadStatusList(uploadStatusList.map((u, i) => {
            if (u.key == key) return Object.assign(u, {status: 'complete'});
            else if (index == i) return Object.assign(u, {status: 'loading'});
            else return u;
        }))
    }

    const handleUploadOne = function(key, index, groups) {
        props.campaigns.forEach(c => {
            if (c.key == key) {
                axios.post(APP_API_URL + 'api.php?class=Upload&fn=upload_one_by_one', qs.stringify({
                    groupIndex: props.groupIndex,
                    groupCampaignIndex: c.groupCampaignIndex,
                    campaignIndex: c.campaignIndex,
                    manually: false,
                    groups: groups,
                })).then((resp) => {
                    props.getCampaigns();
                    changeUploadStatus(index + 1, key);

                    if (selectedCampaignKeys.length == (index + 1)) {
                        setTimeout(function() {
                            messageApi.success('Upload success');
                            setOpen(false);
                        }, 1000)
                    } else {
                        handleUploadOne(selectedCampaignKeys[index + 1], index + 1, groups);
                    }
                });
            }
        })
    }

    const handleUploadClick = function() {
        if (selectedCampaignKeys == undefined || selectedCampaignKeys.length == 0) {
            messageApi.warning('Please select campaign list.');
            return;
        }
        if (props.schedule.path == "") {
            messageApi.warning('Please input schedule sheet url.');
            return;
        }
        if (props.whatsapp.instance_id == "") {
            messageApi.warning("Please input whatsapp instance id");
            return false;
        }
        if (props.whatsapp.token == "") {
            messageApi.warning("Please input whatsapp token");
            return false;
        }

        axios.post(APP_API_URL + 'api.php?class=WhatsApp&fn=get_groups').then((resp) => {
            if (typeof resp.data === "string") {
                messageApi.error("Please confirm whatsapp setting");
                return;
            } else if (resp.data.error) {
                messageApi.error(resp.data.error);
                return;
            }

            initUploadStatusList();
            handleUploadOne(selectedCampaignKeys[0], 0, resp.data);
            setOpen(true);
        });
    }

    return (
        <>
            {contextHolder}
            <Row style={{marginTop: 10}}>
                <Col span={24}>
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
                        className="antd-custom-table campaign-table antd-checked-custom-table"
                        rowClassName={(record, index) => ((record.color === undefined || record.color == "" || record.color === "none") ? "" : "campaign_" + record.color) }
                    />
                </Col>
            </Row>
            <Modal
                title="UPLOAD STATUS LIST"
                centered
                open={open}
                width={1200}
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