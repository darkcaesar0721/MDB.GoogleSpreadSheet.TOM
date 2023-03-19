import {Button, Checkbox, Col, Divider, message, Modal, Popconfirm, Radio, Row, Switch, Table} from "antd";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Input} from "antd/lib";
import GroupCampaignUploadStatusList from "./GroupCampaignUploadStatusList";
import axios from "axios";
import {APP_API_URL} from "../constants";
import moment from "moment/moment";
import StyledCheckBox from "../shared/StyledCheckBox";
import { DraggableModal, DraggableModalProvider } from '@cubetiq/antd-modal'
import '@cubetiq/antd-modal/dist/index.css'

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
    const [uploadIndex, setUploadIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isResumed, setIsResumed] = useState(true);
    const [isClose, setIsClose] = useState(false);
    const [currentController, setCurrentController] = useState('');

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
                title: 'WhatsApp',
                key: 'whatsapp',
                width: 70,
                render: (_, r) => {
                    return (
                        <Switch
                            size="small"
                            disabled={!(props.whatsapp.isWhatsApp === undefined || props.whatsapp.isWhatsApp === true || props.whatsapp.isWhatsApp === 'true')}
                            checked={(props.whatsapp.isWhatsApp === undefined || props.whatsapp.isWhatsApp === true || props.whatsapp.isWhatsApp === 'true') && (r.isWhatsApp === "true" || r.isWhatsApp === true)}
                            onChange={(e) => handleIsWhatsAppChange(e, r)}
                        />
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

    const handleIsWhatsAppChange = function(v, r) {
        props.updateGroupCampaign(props.groupIndex, r.groupCampaignIndex, {isWhatsApp: v})
    }

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

    const initUploadStatusList = () => {
        let campaignKeys = selectedCampaignKeys;
        if (!campaignKeys) campaignKeys = [];

        setUploadStatusList((oldState) => {
            let newState = [];
            props.group.campaigns.forEach(c => {
                campaignKeys.forEach(key => {
                    if (c.key == key) {
                        const campaign = props.globalCampaigns[c.index];

                        newState.push({
                            no: newState.length + 1,
                            index: newState.length,
                            key: key,
                            query: campaign.query,
                            campaignIndex: c.index,
                            way: c.way,
                            amount: customUploadAmount(c),
                            isWhatsApp: c.isWhatsApp,
                            status: newState.length == 0 ? 'loading' : 'normal'
                        });
                    }
                });
            });
            return newState;
        });
    }

    const updateUploadStatus = function(index, data) {
        setUploadStatusList((oldState) => {
            let newState = [...oldState];
            return newState.map((u, i) => {
                if (i === index) {
                    if (data === undefined) {
                        u.status = 'error';
                    } else {
                        u.status = 'complete'; u.last_phone = data.last_phone; u.SystemCreateDate = data.SystemCreateDate;
                        u.last_qty = data.last_qty; u.less_qty = data.less_qty;
                    }
                }
                if (index + 1 !== newState.length && index + 1 === i) {
                    u.status = 'loading';
                }
                return u;
            })
        })
    }

    const handleUploadOne = function(key, index) {
        props.campaigns.forEach(c => {
            if (c.key == key) {
                setUploadIndex(index);

                const controller = new AbortController();
                setCurrentController(controller);

                const params = 'groupIndex=' + props.groupIndex + '&groupCampaignIndex=' + c.groupCampaignIndex + '&campaignIndex=' + c.campaignIndex + '&manually=' + false;
                axios.get(APP_API_URL + 'api.php?class=Upload&fn=upload_one_by_one&' + params, {
                    signal: controller.signal,
                }).then((resp) => {
                    if (typeof resp.data === "string") {
                        updateUploadStatus(index);
                        props.getCampaigns();

                        props.getUpload(function(uploadConfig) {
                            if (uploadConfig.pause_index != index) {
                                if (selectedCampaignKeys.length == (index + 1)) {
                                    setIsClose(true);
                                    setTimeout(function() {
                                        messageApi.success('Upload success');
                                    }, 1000);
                                } else {
                                    handleUploadOne(selectedCampaignKeys[index + 1], index + 1);
                                }
                            } else {
                                props.updateUpload({resume_index: index, pause_index: -1});
                            }
                        })
                    } else {
                        updateUploadStatus(index, resp.data.campaign);
                        props.getCampaigns();

                        if (resp.data.config.pause_index != index) {
                            if (selectedCampaignKeys.length == (index + 1)) {
                                setIsClose(true);
                                setTimeout(function() {
                                    messageApi.success('Upload success');
                                }, 1000);
                            } else {
                                handleUploadOne(selectedCampaignKeys[index + 1], index + 1);
                            }
                        } else {
                            props.updateUpload({resume_index: index, pause_index: -1});
                        }
                    }
                }).catch((resp) => {
                    updateUploadStatus(index);
                    props.getCampaigns();

                    props.getUpload(function(uploadConfig) {
                        if (uploadConfig.pause_index != index) {
                            if (selectedCampaignKeys.length == (index + 1)) {
                                setIsClose(true);
                                setTimeout(function() {
                                    messageApi.success('Upload Done');
                                }, 1000);
                            } else {
                                handleUploadOne(selectedCampaignKeys[index + 1], index + 1);
                            }
                        } else {
                            props.updateUpload({resume_index: index, pause_index: -1});
                        }
                    })
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

        setIsPaused(false);
        setIsResumed(true);

        if (props.whatsapp.isWhatsApp === undefined || props.whatsapp.isWhatsApp === true || props.whatsapp.isWhatsApp === 'true') {
            props.setLoading(true);
            props.setTip('Checking WhatsApp Setting');
            axios.post(APP_API_URL + 'api.php?class=WhatsApp&fn=set_groups').then((resp) => {
                props.setLoading(false);
                if (typeof resp.data === "string") {
                    messageApi.error("Please confirm whatsapp setting");
                    return;
                } else if (resp.data.error) {
                    messageApi.error(resp.data.error);
                    return;
                }

                initUploadStatusList();
                handleUploadOne(selectedCampaignKeys[0], 0);
                setIsClose(false);
                setOpen(true);
            });
        } else {
            initUploadStatusList();
            handleUploadOne(selectedCampaignKeys[0], 0);
            setIsClose(false);
            setOpen(true);
        }
    }

    const pause = function() {
        setIsPaused(true);
        setIsResumed(false);

        props.updateUpload({pause_index: uploadIndex, resume_index: -1});
    }

    const resume = function() {
        setIsPaused(false);
        setIsResumed(true);

        props.getUpload(function(config) {
            if (config.resume_index !== undefined && parseInt(config.resume_index) !== -1) {
                if (selectedCampaignKeys.length === (parseInt(config.resume_index) + 1)) {
                    setTimeout(function () {
                        setIsClose(true);
                        messageApi.success('Upload success');
                    }, 1000)
                } else {
                    handleUploadOne(selectedCampaignKeys[parseInt(config.resume_index) + 1], parseInt(config.resume_index) + 1);
                }
            }
            props.updateUpload({resume_index: -1, pause_index: -1});
        })
    }

    const cancel = function() {
        props.updateUpload({resume_index: -1, pause_index: -1});

        props.getCampaigns();

        currentController.abort();
        setOpen(false);
    }

    return (
        <>
            {contextHolder}
            <Row>
                <Col span={24}>
                    <Row>
                        <Col span={2} offset={10}>
                            <Popconfirm
                                title="Upload data"
                                description="Are you sure to upload the row of this campaign?"
                                onConfirm={handleUploadClick}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button type="primary" style={{top: '-4.5rem'}}>
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
                        style={{marginTop: '-1.5rem'}}
                    />
                </Col>
            </Row>

            <DraggableModalProvider>
                <DraggableModal
                    title="UPLOAD STATUS LIST"
                    open={open}
                    header={null}
                    footer={null}
                    closable={false}
                >
                    <GroupCampaignUploadStatusList
                        onPause={pause}
                        isPaused={isPaused}
                        onResume={resume}
                        isResumed={isResumed}
                        onCancel={cancel}
                        isClose={isClose}
                        setOpen={setOpen}
                        uploadStatusList={uploadStatusList}
                        uploadIndex={uploadIndex}
                    />
                </DraggableModal>
            </DraggableModalProvider>
        </>
    )
}

export default GroupCampaignUploadAll;