import {
    Button,
    Checkbox,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Row, Table,
} from "antd";
import {useEffect, useState} from "react";

function CampaignPreview(props) {
    const [mainForm] = Form.useForm();
    const [columnForm] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState(false);
    const [columns, setColumns] = useState([]);
    const [tableColumns, setTableColumns] = useState([]);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [selectedCampaignKeys, setSelectedCampaignKeys] = useState([]);

    useEffect(function() {
        const selectedCampaign = props.campaigns.data[props.campaigns.selectedIndex];
        let _columns = selectedCampaign.columns;
        _columns = _columns.map(c => {
            return Object.assign({...c}, {display: c.display ==='true'})
        })
        setColumns(_columns);

        let data = {};
        selectedCampaign.columns.forEach((c, i) =>{
            data[c.name + '_order'] = c.order;
            data[c.name + '_name'] = c.field;
        });
        columnForm.setFieldsValue(data);

        data = selectedCampaign;
        mainForm.setFieldsValue(selectedCampaign);

        let tbl_columns = [];
        let no_column = {
            title: 'no',
            key: 'no',
            render: (_, record) => {
                let number = 0;
                selectedCampaign.rows.forEach((c, i) => {
                    if (c['Phone'] === record['Phone']) {
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
        tbl_columns.push(no_column);
        selectedCampaign.columns.forEach(c => {
            if (c.display == 'true') {
                tbl_columns.push({title: c.field, dataIndex: c.name, key: c.name});
            }
        });
        setTableColumns(tbl_columns);
    }, [props.campaigns]);

    const handleSubmit = function(form) {
        if (columns.length === 0) {
            messageApi.warning('Please custom column! Currently nothing columns.');
            return;
        }
    }

    const handleModalOk = function() {
        if (columns.length === 0) {
            messageApi.warning('Please custom column! Currently nothing columns.');
            return;
        }

        let campaign = {...props.campaigns.data[props.campaigns.selectedIndex]};
        campaign.columns = columns;
        props.updateCampaign(campaign);

        setOpen(false);
    }

    const handleCancel = function() {
        props.changeCampaignViewState('list');
    }

    const layout = {
        labelCol: {
            span: 6,
        },
        wrapperCol: {
            span: 18,
        },
    };

    const date = {
        labelCol: {
            span: 9,
        },
        wrapperCol: {
            span: 15,
        },
    };

    const columnLayout = {
        labelCol: {
            span: 12,
        },
        wrapperCol: {
            span: 11,
        },
    }

    const handleColumnCheck = function(e, column) {
        if (column.name === 'Phone') return;

        let _columns = columns;
        _columns = _columns.map((c, i) => c === column ? Object.assign({...c}, {display: e.target.checked}) : c);
        setColumns(_columns);
    }

    const handleColumnOrderChange = function(e, column) {
        let _columns = columns;
        _columns = _columns.map((c, i) => c === column ? Object.assign({...c}, {order: e.target.value}) : c);
        _columns = _columns.sort((a, b) => {
            if (parseInt(a.order) < parseInt(b.order)) return -1;

            return 0;
        });
        setColumns(_columns);
    }

    const handleColumnFieldChange = function(e, column) {
        let _columns = columns;
        _columns = _columns.map((c, i) => c === column ? Object.assign({...c}, {field: e.target.value}) : c);
        setColumns(_columns);
    }

    const handleViewColumnClick = function() {
        let _columns = columns;
        _columns = _columns.sort((a, b) => {
            if (parseInt(a.order) < parseInt(b.order)) return -1;

            return 0;
        });
        setColumns(_columns);

        setOpen(true);
    }

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

    return (
        <>
            {contextHolder}
            <Row style={{marginTop: '2rem'}}>
                <Col span={20} offset={2}>
                    <Divider>CAMPAIGN PREVIEW FORM</Divider>
                    <Form
                        {...layout}
                        name="campaign_add_form"
                        onFinish={handleSubmit}
                        form={mainForm}
                    >
                        <Row>
                            <Col span={12}>
                                <Form.Item
                                    name={['query']}
                                    label="Query Name"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input readOnly={true}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={['url']}
                                    label="Sheet URL"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input readOnly={true}/>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Button type="dashed" danger onClick={handleViewColumnClick} style={{marginBottom: 10}}>
                            View Column List
                        </Button>
                    </Form>
                    <Modal
                        title="CUSTOM COLUMN"
                        centered
                        open={open}
                        onOk={handleModalOk}
                        onCancel={() => setOpen(false)}
                        width={500}
                    >
                        <Form
                            {...columnLayout}
                            name="campaign_add_form"
                            form={columnForm}
                        >
                            {
                                columns.map((c, i) => {
                                    return (
                                        <div key={i}>
                                            <br/>
                                            <Checkbox style={{position: 'absolute', marginTop: '0.3rem'}} checked={c.display} onChange={(e) => {handleColumnCheck(e, c)}}/>
                                            <Form.Item
                                                name={[c.name + '_name']}
                                                label={c.name}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(70% - 5px)',
                                                }}
                                            >
                                                {
                                                    c.name === 'Phone' ? c.name : <Input disabled={!c.display} onChange={(e) => {handleColumnFieldChange(e, c)}} value={c.field}/>
                                                }
                                            </Form.Item>
                                            <Form.Item
                                                name={[c.name + '_order']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(30% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <Input disabled={!c.display} onChange={(e) => {handleColumnOrderChange(e, c)}} value={c.order}/>
                                            </Form.Item>
                                        </div>
                                    )
                                })
                            }
                        </Form>
                    </Modal>
                </Col>
                <Divider>UPLOAD DATA PREVIEW</Divider>
                <Col span={22} offset={1}>
                    <Table
                        size="small"
                        rowSelection={{
                            type: 'checkbox',
                            selectedRowKeys: selectedCampaignKeys,
                            ...rowSelection,
                        }}
                        columns={tableColumns}
                        dataSource={props.campaigns.data[props.campaigns.selectedIndex].rows}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                    />
                </Col>
            </Row>
        </>
    );
}

export default CampaignPreview;
