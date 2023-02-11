import {Breadcrumb, Button, Col, Divider, Popconfirm, Row, Table} from "antd";
import {useEffect, useState} from "react";
import {connect} from "react-redux";
import {
    deleteGroup, getGroups, initTempGroup, setIsUpdatedGroup,
} from "../redux/actions";
import MDBPath from "./MDBPath";
import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {useNavigate} from "react-router-dom";

function Groups(props) {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [columns, setColumns] = useState([]);

    const navigate = useNavigate();

    useEffect(function() {
        props.getGroups();
        props.initTempGroup();
    }, []);

    useEffect(function() {
        let groups = props.groups.data;

        setTableParams({
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                total: groups.length,
            },
        });

        let no_column = {
            title: 'no',
            key: 'no',
            width: 30,
            render: (_, record) => {
                let number = 0;
                groups.forEach((g, i) => {
                    if (g['key'] === record['key']) {
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
                title: 'Group Name',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: 'Campaign Count',
                key: 'campaign_count',
                render: (_, record) => {
                    return (
                        <>
                            <span>{record.campaigns.length}</span>
                        </>
                    )
                }
            },
            {
                title: 'Action',
                key: 'operation',
                render: (_, record) => {
                    let index = -1;
                    groups.forEach((g, i) => {
                        if (g.key === record.key) {
                            index = i;
                        }
                    });

                    return (
                        <>
                            <Button icon={<EditOutlined /> } onClick={(e) => {handleEditClick(index)}} style={{marginRight: 1}}/>
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

    }, [props.groups]);

    const handleAddClick = function() {
        props.initTempGroup();
        navigate('/groups/add');
    }

    const handleEditClick = function(index) {
        props.setIsUpdatedGroup(index);
        navigate('/groups/' + index);
    }

    const handleRemoveClick = function(group) {
        props.deleteGroup(group);
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
                            <a href="#/">Upload Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a href="#/campaigns">Manage Campaign Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a className="selected" href="#/groups">Manage Campaign Action Group Page</a>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
            </Row>
            <MDBPath/>
            <Divider>CAMPAIGN ACTION GROUP MANAGE FORM</Divider>
            <Row>
                <Col span={2} offset={13}>
                    <Button type="primary" icon={<PlusCircleOutlined />} onClick={(e) =>{handleAddClick()}} style={{marginBottom: 5}}>
                        Add Group
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col span={8} offset={8}>
                    <Table
                        bordered={true}
                        size="small"
                        columns={columns}
                        dataSource={props.groups.data}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                    />
                </Col>
            </Row>
        </>
    );
}

const mapStateToProps = state => {
    return { groups: state.groups };
};

export default connect(
    mapStateToProps,
    { getGroups, deleteGroup, initTempGroup, setIsUpdatedGroup }
)(Groups);
