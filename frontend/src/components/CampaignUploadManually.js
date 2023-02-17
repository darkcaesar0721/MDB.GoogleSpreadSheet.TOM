import {
    Button,
    Checkbox,
    Col,
    Form,
    Input,
    InputNumber,
    message,
    Popconfirm,
    Radio,
    Row,
    Select,
    Spin,
    Table
} from "antd";
import React, {useEffect, useState} from "react";

const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 20,
    },
};

const randomLayout = {
    labelCol: {
        span: 13,
    },
    wrapperCol: {
        span: 3,
    },
};

const meridiemOption = [
    {value: 'AM', label: 'AM'},
    {value: 'PM', label: 'PM'},
]

const CampaignUploadManually = (props) => {
    const [way, setWay] = useState('all'); //all,static,random
    const [mainForm] = Form.useForm();
    const [staticCount, setStaticCount] = useState(1);
    const [tableColumns, setTableColumns] = useState([]);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [isTime, setIsTime] = useState(false);
    const [time, setTime] = useState('');
    const [meridiem, setMeridiem] = useState('AM');
    const [dayOld, setDayOld] = useState(1);
    const [loading, setLoading] = useState(false);
    const [tip, setTip] = useState('');
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(function() {
        const selectedCampaign = props.groups[props.groupIndex].campaigns[props.groupCampaignIndex];

        setWay(selectedCampaign.way);
        setStaticCount(selectedCampaign.staticCount);
        setDayOld(selectedCampaign.dayOld);
        setMeridiem(!selectedCampaign.meridiem ? 'AM' : selectedCampaign.meridiem);
        setTime(selectedCampaign.time);
        setIsTime(selectedCampaign.isTime == "true");

        setStaticCount(selectedCampaign.staticCount);
        mainForm.setFieldsValue(selectedCampaign);

        let tbl_columns = [];
        let no_column = {
            title: 'no',
            key: 'no',
            render: (_, record) => {
                let number = 0;
                props.campaigns[props.campaignIndex]._upRows.forEach((c, i) => {
                    if (c['Phone'] === record['Phone']) {
                        number = i + 1;
                        return;
                    }
                });
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
        tbl_columns.push({title: 'SystemCreateDate', dataIndex: 'SystemCreateDate', key: 'SystemCreateDate'});
        setTableColumns(tbl_columns);
    }, [props.campaigns, props.groups]);

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    const handleCancelClick = () => {
        const selectedCampaign = props.campaigns[props.campaignIndex];

        const campaign = {
            isManually: false,
            _upRows: [],
            _up_rows: [],
            _last_phone: '',
            _SystemCreateDate: '',
            _last_qty: '',
            _less_qty: '',
        };
        props.updateCampaign(selectedCampaign.file_name, campaign, {}, function() {
            props.setOpen(false);
        });
    }

    const handleUploadAfterPreview = () => {
        setLoading(true);
        setTip("Wait for uploading....");
        props.uploadAfterPreview(props.groupIndex, props.groupCampaignIndex, props.campaignIndex, function() {
            setLoading(false);
            messageApi.success('upload success');
            props.setOpen(false);
        });
    }

    return (
        <Spin spinning={loading} tip={tip} delay={500}>
            {contextHolder}
            <Row>
                <Col span={20} offset={2} style={{marginTop: 20}}>
                    <Form
                        {...layout}
                        name="add_group_form"
                        className="group-setting-form"
                        form={mainForm}
                    >
                        <Form.Item
                            name={['group']}
                            label="Action Group Name"
                        >
                            <span>{props.groups[props.groupIndex].name}</span>
                        </Form.Item>
                        <Form.Item
                            name={['query']}
                            label="Query Name"
                        >
                            <span>{props.campaigns[props.campaignIndex].query}</span>
                        </Form.Item>
                        <Form.Item
                            name={['urls']}
                            label="Sheet URLS"
                        >
                            {
                                props.campaigns[props.campaignIndex].urls.map(url => {
                                    return (
                                        <div key={url}>
                                            <span>{url}</span>
                                        </div>
                                    )
                                })
                            }
                        </Form.Item>
                        <Form.Item
                            name={['schedule']}
                            label="Sheet Name"
                        >
                            <span>{props.campaigns[props.campaignIndex].schedule}</span>
                        </Form.Item>
                        <Form.Item
                            name={['way']}
                            label="Send Type"
                        >
                            <Radio.Group disabled={true} defaultValue={way} value={way}>
                                <Radio value="all">All Select</Radio>
                                <Radio value="static">Static Select</Radio>
                                <Radio value="random">Random Select</Radio>
                                <Radio value="date">Date & Time</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {
                            way === 'static' ?
                                <Form.Item
                                    name={['staticCount']}
                                    label="Static Count"
                                >
                                    <Col span={3}>
                                        <InputNumber disabled={true} placeholder="Static Count" value={staticCount} onChange={(e) => {setStaticCount(e.target.value)}}/>
                                    </Col>
                                </Form.Item> : ''
                        }
                        {
                            way === 'random' ?
                                <Col span={24}>
                                    <Form.Item
                                        {...randomLayout}
                                        name={['randomStart']}
                                        label="Random Count"
                                        style={{
                                            display: 'inline-block',
                                            width: 'calc(30% - 5px)',
                                        }}
                                    >
                                        <InputNumber disabled={true} placeholder="Start"/>
                                    </Form.Item>
                                    <Form.Item
                                        name={['random']}
                                        style={{
                                            display: 'inline-block',
                                            width: 'calc(5% - 5px)',
                                            margin: '0 5px',
                                        }}
                                    >
                                        <span>~</span>
                                    </Form.Item>
                                    <Form.Item
                                        name={['randomEnd']}
                                        style={{
                                            display: 'inline-block',
                                            width: 'calc(30% - 5px)',
                                            margin: '0 5px',
                                        }}
                                    >
                                        <InputNumber disabled={true} placeholder="End"/>
                                    </Form.Item>
                                </Col> : ''
                        }
                        {
                            way === 'date' ?
                                <Form.Item label="Days Old" name={['date']} valuePropName="checked">
                                    <Row>
                                        <Col span={3}>
                                            <Input disabled={true} placeholder="Days Old" value={dayOld}/>
                                        </Col>
                                        <Col span={1} offset={1}>
                                            <Checkbox disabled={true} checked={isTime} style={{paddingTop: '0.3rem'}}></Checkbox>
                                        </Col>
                                        <Col span={2}>
                                            <Input disabled={true} placeholder="Time" value={time}/>
                                        </Col>
                                        <Col span={2}>
                                            <Select
                                                size="middle"
                                                defaultValue="AM"
                                                style={{ width: 70 }}
                                                options={meridiemOption}
                                                value={meridiem}
                                                disabled={true}
                                            />
                                        </Col>
                                    </Row>
                                </Form.Item> : ''
                        }
                    </Form>
                </Col>
                <Col span={3} offset={1}>
                    Qty Available : <span style={{color: 'red', fontSize: '1.2rem'}}>{props.campaigns[props.campaignIndex]._last_qty}</span>
                </Col>
                <Col span={4}>
                    Qty Uploaded : <span style={{color: 'red', fontSize: '1.2rem'}}>{props.campaigns[props.campaignIndex]._less_qty}</span>
                </Col>
                <Col span={4} offset={12}>
                    <Popconfirm
                        title="Confirm uploading"
                        description="Are you gonna upload this result?"
                        onConfirm={(e) => {handleUploadAfterPreview(props.groupIndex, props.groupCampaignIndex, props.campaignIndex)}}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary">Upload</Button>
                    </Popconfirm>
                    <Popconfirm
                        title="Cancel uploading data"
                        description="Are you gonna cancel your uploading?"
                        onConfirm={handleCancelClick}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="dashed">Cancel</Button>
                    </Popconfirm>
                </Col>
                <Col span={22} offset={1} style={{marginTop: 5}}>
                    <Table
                        size="small"
                        columns={tableColumns}
                        dataSource={props.campaigns[props.campaignIndex]._upRows}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                    />
                </Col>
            </Row>
        </Spin>
    )
}

export default CampaignUploadManually;