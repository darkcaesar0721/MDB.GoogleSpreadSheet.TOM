import {Button, Col, Divider, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {PlusCircleOutlined, EditOutlined} from '@ant-design/icons';
import {getCampaigns} from "../redux/actions";
import MDBPath from "./MDBPath";
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
        setTableParams({
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                total: props.campaigns.data.length,
            },
        });

        setColumns([
            {
                title: 'no',
                key: 'no',
                width: 30,
                fixed: 'left',
                render: (_, record) => {
                    return (
                        <>
                            <span>{(record.index + 1)}</span>
                        </>
                    )
                }
            },
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
                    const editUrl = "#/campaigns/" + record.index;
                    return (
                        <>
                            <Button icon={<EditOutlined /> } href={editUrl} style={{marginRight: 1}}/>
                        </>
                    )
                }
            },
        ]);
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
    { getCampaigns }
)(Campaigns);
