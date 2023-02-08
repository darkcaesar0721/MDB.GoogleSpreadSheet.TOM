import {Button, Divider, message, Popconfirm, Spin, Table} from "antd";
import {useEffect, useState} from "react";
import axios from "axios";
import {APP_API_URL} from "../../constants";
import qs from "qs";

function CampaignList(props) {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 3,
        },
    });
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [selectedCampaignKeys, setSelectedCampaignKeys] = useState([]);
    const [spinStatus, setSpinStatus] = useState('');
    const [columns, setColumns] = useState([]);

    useEffect(function() {
        props.getCampaigns();
    }, []);

    useEffect(function() {
        let db_compains = props.campaigns.data;
        let keys = [];
        let campaigns = [];
        db_compains.forEach(c => {
            if (c.status === 'get_mdb_data') {
                keys.push(c.key);
                campaigns.push(c);
            }
        })
        setSelectedCampaignKeys(keys);
        setSelectedCampaigns(campaigns);

        setTableParams({
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                total: db_compains.length,
            },
        });

        setColumns([
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
                width: 120,
                render: (_, record) => {
                    let index = -1;
                    db_compains.forEach((c, i) => {
                        if (c.query === record.query) {
                            index = i;
                        }
                    });

                    if (record.status === 'get_mdb_data') {
                        return (
                            <>
                                <Button type="dashed" onClick={(e) => {handlePreview(index)}} style={{marginRight: 3}}>
                                    Preview
                                </Button>
                            </>
                        )
                    } else {
                        return (
                            <>
                                <Button type="dashed" onClick={(e) => {handleEditClick(index)}} style={{marginRight: 3}}>
                                    Edit
                                </Button>
                                <Popconfirm
                                    title="Delete the campaign"
                                    description="Are you sure to delete this campaign?"
                                    onConfirm={(e) => {handleRemoveClick(record)}}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button danger>
                                        Delete
                                    </Button>
                                </Popconfirm>
                            </>
                        )
                    }
                }
            },
        ]);

    }, [props.campaigns.data]);

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

    const handleAdd = function() {
        props.changeCampaignViewState('add');
    }

    const handleEditClick = function(index) {
        props.setSelectedCampaignIndex(index);
        props.changeCampaignViewState('edit');
    }

    const handleRemoveClick = function(campaign) {
        props.deleteCampaign(campaign);
    }

    const handlePreview = function(index) {
        props.setSelectedCampaignIndex(index);
        props.changeCampaignViewState('preview');
    };

    const handleGetMDBData = function() {
        if (selectedCampaigns.length === 0) {
            messageApi.warning('Please select campaigns.');
            return;
        }

        setSpinStatus('GET LAST PHONE NUMBER.....');
        setLoading(true);
        axios.post(APP_API_URL + '/sheet.php', qs.stringify({
            action: 'get_last_phone',
            selectedCampaigns,
        })).then(function(resp) {
            setSpinStatus('GET MDB DATA BASED ON LAST PHONE NUMBER.....');
            axios.post(APP_API_URL + '/mdb.php', qs.stringify({
                action: 'get_data',
                campaigns: resp.data,
            })).then(function(resp) {
                setSpinStatus('BACKUP MDB DATA.....');
                resp.data.forEach(c => {
                    props.updateCampaign(c);
                });
                setTimeout(function() {
                    setLoading(false);
                }, 1000);
            })
        })
    }

    const handleUploadData = function() {
        setSpinStatus('UPLOAD DATA.....');
        setLoading(true);

        axios.get(APP_API_URL + '/json.php?action=get_campaigns')
            .then(function(resp) {

                let rows = [];
                selectedCampaignKeys.forEach(key => {
                    resp.data.forEach(c => {
                        if (key === c.query) {
                            rows.push(c);
                        }
                    })
                });
                axios.post(APP_API_URL + '/sheet.php', qs.stringify({
                    action: 'upload_data',
                    selectedCampaigns: rows,
                })).then(function(resp) {
                    document.location.href = 'localhost:3000';
                    setLoading(false);
                })
            })

    }

    return (
        <Spin spinning={loading} tip={spinStatus} delay={500}>
            {contextHolder}
            <Button onClick={handleAdd} type="primary" style={{ marginBottom: 5, marginTop: 20 }}>
                Add Campaign
            </Button>
            <Button onClick={handleGetMDBData} type="primary" style={{ marginBottom: 5, marginLeft: 20 }}>
                GET MDB DATA
            </Button>
            <Button onClick={handleUploadData} type="primary" style={{ marginBottom: 5, marginLeft: 20 }}>
                UPLOAD DATA
            </Button>
            <Divider>MDB QUERY CAMPAIGN LIST</Divider>
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
            />
        </Spin>
    );
}

export default CampaignList;
