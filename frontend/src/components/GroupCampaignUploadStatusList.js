import {Button, Col, Row, Switch, Table} from "antd";
import React, {useEffect, useState} from "react";
import {LoadingOutlined, CheckCircleTwoTone, Loading3QuartersOutlined} from "@ant-design/icons";
import moment from "moment";

const GroupCampaignUploadStatusList = (props) => {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
        },
    });

    const columns = [
        {
            title: 'no',
            key: 'no',
            dataIndex: 'no',
            width: 30,
        },
        {
            title: 'Status',
            key: 'status',
            width: 90,
            render: (_, r) => {
                let element = '';
                if (props.isPaused === true && r.index === props.uploadIndex) {
                    element = <Loading3QuartersOutlined />;
                } else if (props.isPaused === true && r.index > props.uploadIndex) {
                    element = '';
                } else {
                    switch (r.status) {
                        case 'loading':
                            element = <LoadingOutlined />;
                            break;
                        case 'complete':
                            element = <CheckCircleTwoTone twoToneColor="#52c41a" />;
                            break;
                        case '':
                            element = '';
                            break;
                    }
                }
                return (
                    <>
                        {element}
                    </>
                )
            }
        },
        {
            title: 'Query Name',
            dataIndex: 'query',
            key: 'query',
        },
        {
            title: 'WhatsApp',
            key: 'whatsapp',
            render: (_, r) => {
                return (
                    <Switch
                        size="small"
                        checked={r.isWhatsApp === "true" || r.isWhatsApp === true}
                        disabled={true}
                    />
                )
            }
        },
        {
            title: 'Qty Available',
            key: 'query',
            render: (_, r) => {
                return (
                    <>
                        {
                            props.isPaused === true && props.uploadIndex <= r.index ?
                                <span></span> : <span>{r.last_qty}</span>
                        }
                    </>
                )
            }
        },
        {
            title: 'Qty Uploaded',
            key: 'query',
            render: (_, r) => {
                return (
                    <>
                        {
                            props.isPaused === true && props.uploadIndex <= r.index ?
                                <span></span> : <span>{r.less_qty}</span>
                        }
                    </>
                )
            }
        },
        {
            title: 'Last Phone',
            key: 'last_phone',
            render: (_, r) => {
                return (
                    <>
                        {
                            props.isPaused === true && props.uploadIndex <= r.index ?
                                <span></span> : <span>{r.last_phone}</span>
                        }
                    </>
                )
            }
        },
        {
            title: 'SystemCreateDate',
            key: 'SystemCreateDate',
            render: (_, r) => {
                return (
                    <>
                        {
                            props.isPaused === true && props.uploadIndex <= r.index ?
                                <span></span> : <span>{r.SystemCreateDate === "" || r.SystemCreateDate === undefined ? "" : moment(r.SystemCreateDate).format('M/D/Y, hh:mm A')}</span>
                        }
                    </>
                )
            }
        },
    ]

    useEffect(function() {
    }, []);

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    return (
        <>
            <Row>
                <Col span={2}>
                    <Button type="primary" disabled={!props.isClose} onClick={(e) => {props.setOpen(false)}}>Close Window</Button>
                </Col>
                <Col span={15} offset={5}>
                    <Button type="primary" disabled={props.isPaused} onClick={props.onPause}>Pause</Button>
                    <Button type="primary" disabled={props.isResumed} onClick={props.onResume} style={{marginLeft: '0.4rem'}}>Resume</Button>
                    <Button type="primary" disabled={props.isCanceled} onClick={props.onCancel} style={{marginLeft: '0.4rem'}}>Cancel</Button>
                </Col>
            </Row>
            <Row style={{marginTop: '0.4rem'}}>
                <Col span={24}>
                    <Table
                        bordered={true}
                        size="small"
                        columns={columns}
                        dataSource={props.uploadStatusList}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                        className="antd-custom-table upload-status-list"
                    />
                </Col>
            </Row>

        </>
    )
}

export default GroupCampaignUploadStatusList;