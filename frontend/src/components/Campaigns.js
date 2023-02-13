import {Button, Col, Divider, Popconfirm, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {
    deleteCampaign, getCampaigns,
} from "../redux/actions";
import MDBPath from "./MDBPath";
import {PlusCircleOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons';
import MenuList from "./MenuList";

function Campaigns(props) {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [columns, setColumns] = useState([]);

    useEffect(function() {
        props.getCampaigns();
    }, []);

    useEffect(function() {
        let campaigns = props.campaigns.data;

        setTableParams({
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                total: campaigns.length,
            },
        });

        let no_column = {
            title: 'no',
            key: 'no',
            width: 30,
            fixed: 'left',
            render: (_, record) => {
                let number = 0;
                campaigns.forEach((c, i) => {
                    if (c['query'] === record['query']) {
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

        setColumns([no_column,
            {
                title: 'Query Name',
                dataIndex: 'query',
                key: 'query',
                width: 400,
            },
            {
                title: 'Sheet Name',
                dataIndex: 'schedule',
                key: 'schedule',
                width: 250
            },
            {
                title: 'Sheet URL Count',
                key: 'url_count',
                render: (_, r) => {
                    return (
                        <span>{r.urls.length}</span>
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
                title: 'Action',
                key: 'operation',
                width: 60,
                render: (_, record) => {
                    let index = -1;
                    campaigns.forEach((c, i) => {
                        if (c.query === record.query) {
                            index = i;
                        }
                    });

                    const editUrl = "#/campaigns/" + index;
                    const previewUrl = "#/preview/" + index;
                    return (
                        <>
                            <Button icon={<EditOutlined /> } href={editUrl} style={{marginRight: 1}}/>
                            {/*<Button icon={<EyeOutlined /> } href={previewUrl} style={{marginRight: 1}}/>*/}
                            {/*<Popconfirm*/}
                            {/*    title="Delete the campaign"*/}
                            {/*    description="Are you sure to delete this campaign?"*/}
                            {/*    onConfirm={(e) => {handleRemoveClick(record)}}*/}
                            {/*    okText="Yes"*/}
                            {/*    cancelText="No"*/}
                            {/*>*/}
                            {/*    <Button danger icon={<DeleteOutlined /> }/>*/}
                            {/*</Popconfirm>*/}
                        </>
                    )
                }
            },
        ]);

    }, [props.campaigns]);

    const handleRemoveClick = function(campaign) {
        props.deleteCampaign(campaign);
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    return (
        <>
            <MenuList
                currentPage="campaign"
            />
            <MDBPath/>
            <Divider>MDB QUERY CAMPAIGN LIST</Divider>
            <Row>
                <Col span={2} offset={21}>
                    <Button type="primary" icon={<PlusCircleOutlined />} href="#/campaigns/add" style={{marginBottom: 5}}>
                        Add Campaign
                    </Button>
                </Col>
            </Row>
            <Table
                bordered={true}
                size="small"
                columns={columns}
                dataSource={props.campaigns.data}
                pagination={tableParams.pagination}
                onChange={handleTableChange}
            />
        </>
    );
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns };
};

export default connect(
    mapStateToProps,
    { getCampaigns, deleteCampaign }
)(Campaigns);
