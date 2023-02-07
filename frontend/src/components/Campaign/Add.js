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
    Row,
    Spin,
    TimePicker
} from "antd";
import {useEffect, useState} from "react";
import axios from "axios";
import {APP_API_URL} from "../../constants";
import qs from "qs";

function CampaignAdd(props) {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [columns, setColumns] = useState([]);
    const [buttonState, setButtonState] = useState('column');

    useEffect(function() {
        let data = {};
        columns.forEach((c, i) =>{
            data[c.name + '_order'] = c.order;
            data[c.name + '_name'] = c.field;
        });
        form.setFieldsValue(data);
    }, [columns]);

    const handleSubmit = function(form) {
        if (buttonState === 'column') {
            setLoading(true);
            const query = form.query;

            axios.post(APP_API_URL + '/mdb.php', qs.stringify({
                action: 'get_query_data',
                query,
            })).then(function(resp) {
                setLoading(false);
                if (resp.data.status === 'error') {
                    messageApi.error(resp.data.description);
                } else {
                    let _columns = [];
                    let status = false;
                    resp.data.columnList.forEach(c => {
                        if (!status)
                            _columns.push({name: c, field: c, display: true, order: ''});

                        if (c === 'SystemCreateDate') {
                            status = true;
                        }
                    });
                    setColumns(_columns);
                    setOpen(true);
                    setButtonState('compaign');
                }
            })
        } else {
            if (columns.length === 0) {
                messageApi.warning('Please custom column! Currently nothing columns.');
                return;
            }

            let _columns = columns;
            _columns = _columns.sort((a, b) => {
                if (parseInt(a.order) < parseInt(b.order)) return -1;

                return 0;
            });

            form.columns = _columns;
            props.createCampaign(form);
            messageApi.success('create success');
            setTimeout(function() {
                props.changeCampaignViewState('list');
            }, 1000);
        }
    }

    const handleFormChange = function({query}) {
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

    const validateMessages = {
        required: '${label} is required!'
    };

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

    return (
        <Spin spinning={loading} tip="Checking Query..." delay={500}>
            {contextHolder}
            <Row style={{marginTop: '2rem'}}>
                <Col span={20} offset={2}>
                    <Divider>CAMPAIGN COMPOSE FORM</Divider>
                    <Form
                        {...layout}
                        name="campaign_add_form"
                        onFinish={handleSubmit}
                        onValuesChange={handleFormChange}
                        validateMessages={validateMessages}
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
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={['less_qty']}
                                    label="Less Qty count"
                                >
                                    <InputNumber />
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
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={['last_qty']}
                                    label="Last Qty count"
                                >
                                    <InputNumber />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={['sheet']}
                                    label="Sheet Name"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    {...date}
                                    name={['date']}
                                    label="SystemCreateDate"
                                    style={{
                                        display: 'inline-block',
                                        width: 'calc(70% - 5px)',
                                    }}
                                >
                                    <DatePicker />
                                </Form.Item>
                                <Form.Item
                                    name={['time']}
                                    style={{
                                        display: 'inline-block',
                                        width: 'calc(30% - 5px)',
                                        margin: '0 5px',
                                    }}
                                >
                                    <TimePicker use12Hours format="h:mm:ss A" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={['schedule']}
                                    label="Schedule Name"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={['phone']}
                                    label="Last Phone"
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Button type="dashed" danger onClick={handleViewColumnClick} style={{marginBottom: 10}}>
                            View Column List
                        </Button>
                        <Form.Item
                            wrapperCol={{
                                ...layout.wrapperCol,
                                offset: 3,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                {
                                    buttonState === 'column' ? 'Get Column List' : 'Add Campaign'
                                }
                            </Button>
                            <Button style={{marginLeft: 10}} onClick={handleCancel}>
                                Cancel
                            </Button>
                        </Form.Item>
                    </Form>
                    <Modal
                        title="CUSTOM COLUMN"
                        centered
                        open={open}
                        onOk={() => setOpen(false)}
                        onCancel={() => setOpen(false)}
                        width={500}
                    >
                        <Form
                            {...columnLayout}
                            name="campaign_add_form"
                            form={form}
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
            </Row>
        </Spin>
    );
}

export default CampaignAdd;
