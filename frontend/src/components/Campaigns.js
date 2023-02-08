import {Breadcrumb, Button, Col, Divider, Popconfirm, Row, Table} from "antd";
import {useEffect, useState} from "react";
import {connect} from "react-redux";
import {
    deleteCampaign, getCampaigns,
} from "../redux/actions";
import MDBPath from "./MDBPath";
import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

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
                title: 'Query',
                dataIndex: 'query',
                key: 'query',
                fixed: 'left',
                width: 300,
            },
            {
                title: 'Sheet URL',
                dataIndex: 'url',
                key: 'url',
                fixed: 'left',
                width: 500,
            },
            {
                title: 'Schedule',
                dataIndex: 'schedule',
                key: 'schedule',
                width: 80
            },
            {
                title: 'Less Qty',
                dataIndex: 'less_qty',
                key: 'less_qty',
                width: 80
            },
            {
                title: 'Last Qty',
                dataIndex: 'last_qty',
                key: 'last_qty',
                width: 80
            },
            {
                title: 'Last Phone',
                dataIndex: 'last_phone',
                key: 'last_phone',
                width: 100
            },
            {
                title: 'SystemCreateDate',
                dataIndex: 'SystemCreateDate',
                key: 'SystemCreateDate',
            },
            {
                title: 'Action',
                key: 'operation',
                fixed: 'right',
                width: 60,
                render: (_, record) => {
                    let index = -1;
                    campaigns.forEach((c, i) => {
                        if (c.query === record.query) {
                            index = i;
                        }
                    });

                    const editUrl = "/campaigns/" + index;
                    return (
                        <>
                            <Button icon={<EditOutlined /> } href={editUrl} style={{marginRight: 1}}/>
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
            <Row>
                <Col span={20} offset={1}>
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <a href="">Upload Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a class="selected" href="/campaigns">Manage Campaign Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a href="">Manage Campaign Action Group Page</a>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
            </Row>
            <MDBPath/>
            <Divider>MDB QUERY CAMPAIGN LIST</Divider>
            <Row>
                <Col span={2} offset={21}>
                    <Button type="primary" icon={<PlusCircleOutlined />} href="/campaigns/add" style={{marginBottom: 5}}>
                        Add Campaign
                    </Button>
                </Col>
            </Row>
            <Table
                bordered={true}
                size="small"
                columns={columns}
                dataSource={props.campaigns.data}
                scroll={{
                    x: 1500,
                    y: 300,
                }}
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
