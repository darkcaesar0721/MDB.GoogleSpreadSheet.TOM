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
    Radio
} from "antd";
import {useEffect, useState} from "react";
import {updateCampaign} from "../../redux/actions";

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
    const [selectedRecords, setSelectedRecords] = useState([]);
    const [selectedRecordKeys, setSelectedRecordKeys] = useState([]);
    const [recordCountType, setRecordCountType] = useState(1);
    const [staticCount, setStaticCount] = useState(1);

    useEffect(function() {
        changeRecordCountType(1);

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

    const handleSubmit = function() {
        if (selectedRecords.length === 0) {
            messageApi.warning('Please select rows! Currently nothing rows.');
            return;
        }

        let selectedCampaign = props.campaigns.data[props.campaigns.selectedIndex];
        selectedCampaign.recordCountType = recordCountType;
        selectedCampaign.staticCount = staticCount;
        selectedCampaign.uploadRows = selectedRecords;
        props.updateCampaign(selectedCampaign);
        props.changeCampaignViewState('list');
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
            setSelectedRecordKeys(selectedRowKeys);
            setSelectedRecords(selectedRows);
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

    const handleRecordCountTypeChange = function(e) {
        changeRecordCountType(e.target.value);
        setRecordCountType(e.target.value);
    }

    const changeRecordCountType = function(value, static_count = -1) {
        const selectedCampaign = props.campaigns.data[props.campaigns.selectedIndex];

        if (value === 1) {
            let keys = [];
            let records = [];
            selectedCampaign.rows.forEach(r => {
                keys.push(r['Phone']);
                records.push(r);
            })
            setSelectedRecordKeys(keys);
            setSelectedRecords(records);

        } else if (value === 2) {
            if (static_count === -1) static_count = staticCount;

            let keys = [];
            let records = [];
            for (let i = 0; i < static_count; i++) {
                keys.push(selectedCampaign.rows[i]['Phone']);
                records.push(selectedCampaign.rows[i]);
            }
            setSelectedRecordKeys(keys);
            setSelectedRecords(records);
        } else if (value === 3) {
            setSelectedRecordKeys([]);
            setSelectedRecords([]);
        }
    }

    const handleStaticCountChange = function(e) {
        setStaticCount(e.target.value);
        changeRecordCountType(recordCountType, e.target.value);
    }

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
                <Col span={4} offset={1} style={{marginBottom: 5}}>
                    total selected rows count : {selectedRecords.length}
                </Col>
                <Col span={12} style={{marginBottom: 5}}>
                    <Radio.Group name="radiogroup" defaultValue={1} value={recordCountType} onChange={handleRecordCountTypeChange}>
                        <Radio value={1}>All Select</Radio>
                        <Radio value={2}>Static Select</Radio>
                        <Radio value={3}>Random Select</Radio>
                    </Radio.Group>
                </Col>
                <Col span={3} style={{marginBottom: 5}}>
                    {
                        recordCountType === 2 ? <Input placeholder="static count" defaultValue={1} value={staticCount} onChange={handleStaticCountChange}/> : ''
                    }
                </Col>
                <Col span={3} style={{marginBottom: 5}}>
                    <Button type="primary" onClick={handleSubmit}>OK</Button>
                </Col>
                <Col span={22} offset={1}>
                    <Table
                        size="small"
                        rowSelection={{
                            type: 'checkbox',
                            selectedRowKeys: selectedRecordKeys,
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
