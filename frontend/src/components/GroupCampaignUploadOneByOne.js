import {Button, Checkbox, Col, Divider, Popconfirm, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {UploadOutlined} from "@ant-design/icons";
import {Link} from "react-router-dom";
import {Input} from "antd/lib";

const GroupCampaignUploadOneByOne = (props) => {
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
                        return (
                            <Checkbox checked={r.isEditPhone == "true" ? true: false} onChange={(e) => {handlePhoneEditCheck(e, r)}}/>
                        )
                    }
                },
                {
                    title: 'Last Phone',
                    key: 'last_phone',
                    width: 130,
                    render: (_, r) => {
                        return (
                            <Input style={{color: '#000000'}} disabled={!(r.isEditPhone == "true")} value={r.last_phone} onChange={(e) => {handlePhoneChange(e, r)}}/>
                        )
                    }
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
                        return (
                            <>
                                <Popconfirm
                                    title="Upload data"
                                    description="Are you sure to upload the row of this campaign?"
                                    onConfirm={(e) => {handleUpload(record)}}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button icon={<UploadOutlined /> } style={{marginRight: 1}}/>
                                </Popconfirm>
                            </>
                        )
                    }
                }
            ];
            setColumns(_columns);
        }
    }, [props.campaigns]);

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

    const handleUpload = (r) => {
        props.upload({
            action: 'upload_one',
            groupIndex: props.groupIndex,
            groupCampaignIndex: r.groupCampaignIndex,
            campaignIndex: r.campaignIndex
        });
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
                        dataSource={props.campaigns}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                        rowClassName={(record, index) => (record.isLast ? "campaign_active" : "") }
                    />
                </Col>
            </Row>
        </>
    )
}

export default GroupCampaignUploadOneByOne;