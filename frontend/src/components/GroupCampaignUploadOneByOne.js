import {Button, Checkbox, Col, Divider, Modal, Popconfirm, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {UploadOutlined, MediumOutlined, EyeOutlined} from "@ant-design/icons";
import {Link} from "react-router-dom";
import {Input} from "antd/lib";
import CampaignUploadManually from "./CampaignUploadManually";

const GroupCampaignUploadOneByOne = (props) => {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [columns, setColumns] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [open, setOpen] = useState(false);
    const [groupIndex, setGroupIndex] = useState('');
    const [groupCampaignIndex, setGroupCampaignIndex] = useState('');
    const [campaignIndex, setCampaignIndex] = useState('');

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
                    title: 'Yellow',
                    key: 'yellow',
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
                    width: 130,
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
                    title: 'Last Phone',
                    key: 'last_phone',
                    width: 110,
                    render: (_, r) => {
                        return (
                            <Input style={{color: r.isGetLastPhone  ? 'red' : 'black'}} onBlur={() => {handlePhoneSave(r)}} value={r.last_phone} onChange={(e) => {handlePhoneChange(e, r)}}/>
                        )
                    }
                },
                {
                    title: 'SystemCreateDate',
                    dataIndex: 'SystemCreateDate',
                    key: 'SystemCreateDate',
                    width: 100,
                    render: (_, r) => {
                        return (
                            <span style={{color: r.isGetLastPhone  ? 'red' : 'black'}}>{r.SystemCreateDate}</span>
                        )
                    }
                },
                {
                    title: 'Upload',
                    key: 'operation',
                    width: 80,
                    render: (_, record) => {
                        return (
                            <>
                                {
                                    (record.isManually != "true" && record.isManually != true) ?
                                        <Popconfirm
                                            title="Upload data"
                                            description="Are you sure to upload the row of this campaign?"
                                            onConfirm={(e) => {handleUpload(record, false)}}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button icon={<UploadOutlined /> } style={{marginRight: 1}}/>
                                        </Popconfirm> : ''
                                }
                                <Popconfirm
                                    title="Manually Upload data"
                                    description="Are you gonna get data to upload the row of this campaign?"
                                    onConfirm={(e) => {handleUpload(record, true)}}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button disabled={(record.isManually == "true" || record.isManually == true)} icon={<MediumOutlined /> } style={{marginRight: 1}}/>
                                </Popconfirm>
                                {
                                    (record.isManually == "true" || record.isManually == true) ? <Button onClick={(e) => {handleShowResult(record)}} icon={<EyeOutlined /> } style={{marginRight: 1}}/> : ''
                                }
                            </>
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
                }
            ];
            setColumns(_columns);
        }
    }, [props.campaigns]);

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

    const handleIsLastCheck = (e, r) => {
        let campaign = props.globalCampaigns[r.index];
        props.updateCampaign(r.file_name, {isLast: (campaign.isLast == true || campaign.isLast == "true") ? false : true});
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    const handleUpload = (r, manually) => {
        setGroupIndex(props.groupIndex);
        setGroupCampaignIndex(r.groupCampaignIndex);
        setCampaignIndex(r.campaignIndex);

        let callback = function(){};
        if (manually) {
            callback = function() {
                setOpen(true);
            };
        }

        props.upload({
            groupIndex: props.groupIndex,
            groupCampaignIndex: r.groupCampaignIndex,
            campaignIndex: r.campaignIndex,
            manually: manually,
        }, callback);
    }

    const handleShowResult = function(r) {
        setGroupIndex(props.groupIndex);
        setGroupCampaignIndex(r.groupCampaignIndex);
        setCampaignIndex(r.campaignIndex);

        setOpen(true);
    }

    return (
        <>
            <Row style={{marginTop: 10}}>
                <Col span={22} offset={1}>
                    <Divider style={{fontSize: '0.8rem'}}>GROUP CAMPAIGN LIST</Divider>
                    <Table
                        bordered={true}
                        size="small"
                        columns={columns}
                        dataSource={campaigns}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                        rowClassName={(record, index) => ((record.isLast == true || record.isLast == "true") ? "campaign_active" : "") }
                    />
                </Col>
            </Row>
            <Modal
                title="UPLOAD PREVIEW"
                centered
                open={open}
                width={1200}
                header={null}
                footer={null}
                onCancel={(e) => {setOpen(false)}}
                className="upload-preview"
            >
                {
                    props.globalGroups.length > 0 && props.globalCampaigns.length> 0 ?
                        <CampaignUploadManually
                            groupIndex={groupIndex}
                            groupCampaignIndex={groupCampaignIndex}
                            campaignIndex={campaignIndex}
                            groups={props.globalGroups}
                            campaigns={props.globalCampaigns}
                            setOpen={setOpen}
                            updateCampaign={props.updateCampaign}
                            uploadAfterPreview={props.uploadAfterPreview}
                        /> : ''
                }

            </Modal>
        </>
    )
}

export default GroupCampaignUploadOneByOne;