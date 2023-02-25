import {Table} from "antd";
import React, {useEffect, useState} from "react";
import {LoadingOutlined, CheckCircleTwoTone} from "@ant-design/icons";
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
                return (
                    <>
                        {
                            r.status === 'loading' ?
                                <LoadingOutlined /> : ''
                        }
                        {
                            r.status === 'complete' ?
                                <CheckCircleTwoTone twoToneColor="#52c41a" /> : ''
                        }
                        {
                            r.status === 'normal' ?
                                <span></span> : ''
                        }
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
            title: 'Qty Available',
            dataIndex: 'last_qty',
            key: 'query',
        },
        {
            title: 'Qty Uploaded',
            dataIndex: 'less_qty',
            key: 'query',
        },
        {
            title: 'Last Phone',
            dataIndex: 'last_phone',
            key: 'last_phone',
        },
        {
            title: 'SystemCreateDate',
            dataIndex: 'SystemCreateDate',
            key: 'SystemCreateDate',
            render: (_, r) => {
                return (
                    <span>{r.SystemCreateDate === "" || r.SystemCreateDate === undefined ? "" : moment(r.SystemCreateDate).format('M/D/Y, hh:mm A')}</span>
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
            <Table
                bordered={true}
                size="small"
                columns={columns}
                dataSource={props.uploadStatusList}
                pagination={tableParams.pagination}
                onChange={handleTableChange}
                className="antd-custom-table upload-status-list"
            />
        </>
    )
}

export default GroupCampaignUploadStatusList;