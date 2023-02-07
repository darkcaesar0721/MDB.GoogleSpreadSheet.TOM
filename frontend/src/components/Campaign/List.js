import {Button, Divider, Popconfirm, Table} from "antd";
import {useEffect, useState} from "react";

function CampaignList(props) {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 5,
        },
    });

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
    }, [props.campaigns.data]);

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
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

    const handleEditClick = function(campaign) {
        props.setSelectedCampaign(campaign);
        props.changeCampaignViewState('edit');
    }

    const handleRemoveClick = function(campaign) {
        props.deleteCampaign(campaign);
    }

    const columns = [
        {
            title: 'Query',
            dataIndex: 'query',
            key: 'query',
            fixed: 'left',
            width: 200,
        },
        {
            title: 'Sheet URL',
            dataIndex: 'url',
            key: 'url',
            fixed: 'left',
            width: 200,
        },
        {
            title: 'Sheet Name',
            dataIndex: 'sheet',
            key: 'sheet',
        },
        {
            title: 'Schedule Name',
            dataIndex: 'schedule',
            key: 'schedule',
        },
        {
            title: 'Less Qty',
            dataIndex: 'less_qty',
            key: 'less_qty',
        },
        {
            title: 'Last Qty',
            dataIndex: 'last_qty',
            key: 'last_qty',
        },
        {
            title: 'Last_Phone',
            dataIndex: 'last_qty',
            key: 'last_qty',
        },
        {
            title: 'SystemCreateDate',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Action',
            key: 'operation',
            fixed: 'right',
            width: 150,
            render: (_, record) => {
                return (
                    <>
                        <Button type="dashed" onClick={(e) => {handleEditClick(record)}} style={{marginRight: 3}}>
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
        },
    ];

    return (
        <>
            <Button onClick={handleAdd} type="primary" style={{ marginBottom: 5, marginTop: 20 }}>
                Add Campaign
            </Button>
            <Divider>MDB QUERY CAMPAIGN LIST</Divider>
            <Table
                size="small"
                rowSelection={{
                    type: 'checkbox',
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
        </>
    );
}

export default CampaignList;
