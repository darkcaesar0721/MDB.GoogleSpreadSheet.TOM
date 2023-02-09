import {Breadcrumb, Button, Col, Divider, Form, Input, Row, Table} from "antd";
import {useEffect, useState} from "react";
import {connect} from "react-redux";
import {
    getCampaigns, getTempGroup, updateTempGroup,
} from "../redux/actions";
import MDBPath from "./MDBPath";
import { SettingOutlined } from '@ant-design/icons';

function GroupAdd(props) {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [columns, setColumns] = useState([]);
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [selectedCampaignKeys, setSelectedCampaignKeys] = useState([]);
    const [name, setName] = useState('');

    useEffect(function() {
        props.getCampaigns();
        props.getTempGroup();
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

                    const editUrl = "/groups/add/" + index;
                    return (
                        <>
                            <Button icon={<SettingOutlined /> } href={editUrl} style={{marginRight: 1}}/>
                        </>
                    )
                }
            },
        ]);

    }, [props.campaigns]);

    useEffect(function() {
        setName(props.temp.name);
    }, [props.temp])

    const handleSubmit = function(form) {
        console.log(form);
    }

    const layout = {
        labelCol: {
            span: 6,
        },
        wrapperCol: {
            span: 18,
        },
    };

    const validateMessages = {
        required: '${label} is required!'
    };

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedCampaignKeys(selectedRowKeys);
            setSelectedCampaigns(selectedRows);
        },
        getCheckboxProps: (record) => ({
            disabled: record.name === 'Disabled User',
            // Column configuration not to be checked
            name: record.name,
        }),
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        let temp = props.temp;
        temp.name = e.target.value;
        props.updateTempGroup(temp);
    }

    console.log(name);

    return (
        <>
            <Row>
                <Col span={20} offset={1}>
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <a href="">Upload Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a className="selected" href="/campaigns">Manage Campaign Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a href="">Manage Campaign Action Group Page</a>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
            </Row>
            <MDBPath/>
            <Divider>CAMPAIGN ACTION GROUP ADD FORM</Divider>
            <Row style={{marginBottom: 5}}>
                <Col span={2} offset={7}>
                    <span style={{lineHeight: 2}}>Group Name:</span>
                </Col>
                <Col span={7}>
                    <Input placeholder="8AM ACTION" value={name} onChange={handleNameChange}/>
                </Col>
            </Row>
            <Table
                bordered={true}
                size="small"
                rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: selectedCampaignKeys,
                    ...rowSelection,
                }}
                columns={columns}
                dataSource={props.campaigns.data}
                scroll={{
                    x: 1500,
                    y: 300,
                }}
                pagination={tableParams.pagination}
                onChange={handleTableChange}
            />
            <Row>
                <Col span={1} offset={22}>
                    <Button type="primary" onClick={handleSubmit} style={{marginBottom: 5}}>
                        Add Group
                    </Button>
                </Col>
            </Row>
        </>
    );
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns, temp: state.groups.temp };
};

export default connect(
    mapStateToProps,
    { getCampaigns, getTempGroup, updateTempGroup }
)(GroupAdd);
