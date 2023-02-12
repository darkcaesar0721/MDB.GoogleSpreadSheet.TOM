import {Button, Col, Divider, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {UploadOutlined} from "@ant-design/icons";

const GroupCampaignList = (props) => {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [columns, setColumns] = useState([]);

    useEffect(function() {
        if (props.campaigns.length > 0) {
            setTableParams({
                ...tableParams,
                pagination: {
                    ...tableParams.pagination,
                    total: props.campaigns.length,
                },
            });

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
                    dataIndex: 'query',
                    key: 'query',
                },
                {
                    title: 'Schedule',
                    dataIndex: 'schedule',
                    key: 'schedule',
                },
                {
                    title: 'Way',
                    dataIndex: 'way',
                    key: 'way',
                },
                {
                    title: 'Count',
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
                        }

                        return (
                            <>
                                <span>{count}</span>
                            </>
                        )
                    }
                },
                {
                    title: 'Less Qty',
                    dataIndex: 'less_qty',
                    key: 'less_qty'
                },
                {
                    title: 'Last Qty',
                    dataIndex: 'last_qty',
                    key: 'last_qty'
                },
                {
                    title: 'Last Phone',
                    dataIndex: 'last_phone',
                    key: 'last_phone'
                },
                {
                    title: 'SystemCreateDate',
                    dataIndex: 'SystemCreateDate',
                    key: 'SystemCreateDate',
                },
                {
                    title: 'Upload',
                    key: 'operation',
                    width: 60,
                    render: (_, record) => {
                        const uploadUrl = "#/upload/" + props.groupIndex + '/' + record.groupCampaignIndex + '/' + record.campaignIndex;
                        return (
                            <>
                                <Button icon={<UploadOutlined /> } href={uploadUrl} style={{marginRight: 1}}/>
                            </>
                        )
                    }
                }
            ];
            setColumns(_columns);
        }
    }, [props.campaigns]);

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    return (
        <>

            <Row style={{marginTop: 10}}>
                <Col span={22} offset={1}>
                    <Divider style={{fontSize: '0.7rem'}}>GROUP CAMPAIGN LIST</Divider>
                    <Table
                        bordered={true}
                        size="small"
                        columns={columns}
                        dataSource={props.campaigns}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                    />
                </Col>
            </Row>
        </>
    )
}

export default GroupCampaignList;