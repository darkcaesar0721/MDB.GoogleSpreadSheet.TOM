import {
    Button,
    Checkbox,
    Col,
    Divider,
    Form,
    Input,
    message,
    Modal,
    Row,
    Spin,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React, {useEffect, useState} from "react";
import axios from "axios";
import {APP_API_URL} from "../constants";
import qs from "qs";
import MDBPath from "./MDBPath";
import {connect} from "react-redux";
import { useNavigate } from 'react-router-dom';
import MenuList from "./MenuList";
import {createCampaign} from "../redux/actions";

const layout = {
    labelCol: {
        span: 3,
    },
    wrapperCol: {
        span: 21,
    },
};

const columnLayout = {
    labelCol: {
        span: 13,
    },
    wrapperCol: {
        span: 11,
    },
}

const formItemLayout = {
    labelCol: {
        xs: {
            span: 3,
        },
        sm: {
            span: 3,
        },
    },
    wrapperCol: {
        xs: {
            span: 21,
        },
        sm: {
            span: 21,
        },
    },
};

const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: {
            span: 21,
            offset: 3,
        },
        sm: {
            span: 21,
            offset: 3,
        },
    },
};

function CampaignAdd(props) {
    const [columnForm] = Form.useForm();
    const [mainForm] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [columns, setColumns] = useState([]);
    const [buttonState, setButtonState] = useState('column');

    const navigate = useNavigate();

    useEffect(function() {
        let data = {};
        data['urls'] = [''];
        mainForm.setFieldsValue(data);
    }, []);

    useEffect(function() {
        let data = {};
        columns.forEach((c, i) =>{
            data[c.name + '_order'] = c.order;
            data[c.name + '_name'] = c.field;
        });
        columnForm.setFieldsValue(data);
    }, [columns]);

    const getQueryColumns = function(query) {
        setLoading(true);

        axios.post(APP_API_URL + 'api.php?class=Mdb&fn=get_query_columns', qs.stringify({
            query,
        })).then(function(resp) {
            setLoading(false);
            if (resp.data.status === 'error') {
                messageApi.error(resp.data.description);
            } else {
                let _columns = [];
                let status = false;
                resp.data.columns.forEach((c, i) => {
                    if (c.name === 'SystemCreateDate')
                        status = true;

                    if (!status)
                        _columns.push({name: c.name, field: c.field, display: true, order: (i + 1), isInputDate: c.isInputDate});
                });
                setColumns(_columns);
                setOpen(true);
                setButtonState('campaign');
            }
        })
    }

    const handleSubmit = function(form) {
        if (buttonState === 'column') {
            getQueryColumns(form.query);
            return;
        }

        if (validation()) {
            let _columns = columns;
            _columns = _columns.sort((a, b) => {
                if (parseInt(a.order) < parseInt(b.order)) return -1;

                return 0;
            });
            form.columns = _columns;

            props.createCampaign(form, function() {
                messageApi.success('create success');
                setTimeout(function() {
                    navigate('/campaigns');
                }, 1000);
            });
        }
    }

    const validation = function() {
        if (columns.length === 0) {
            messageApi.warning('Please custom column! Currently nothing columns.');
            return false;
        }

        return true;
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
        <Spin spinning={loading} tip="CHECKING QUERY AND GET COLUMN LIST BASED ON QUERY ..." delay={300}>
            {contextHolder}
            <MenuList
                currentPage="campaign"
            />
            <MDBPath/>
            <Row style={{marginTop: '1rem'}}>
                <Col span={20} offset={2}>
                    <Divider>CAMPAIGN ADD FORM</Divider>
                    <Form
                        {...layout}
                        name="campaign_add_form"
                        onFinish={handleSubmit}
                        validateMessages={validateMessages}
                        form={mainForm}
                    >
                        <Form.Item
                            name={['query']}
                            label="Query Name"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            form={mainForm}
                        >
                            <Input />
                        </Form.Item>
                        <Form.List
                            name="urls"
                            rules={[
                                {
                                    validator: async (_, names) => {
                                        if (!names || names.length < 1) {
                                            return Promise.reject(new Error('At least 1 sheets'));
                                        }
                                    },
                                },
                            ]}
                        >
                            {(fields, { add, remove }, { errors }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Form.Item
                                            {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                                            label={index === 0 ? 'Sheet URLS' : ''}
                                            required={false}
                                            key={field.key}
                                        >
                                            <Form.Item
                                                {...field}
                                                validateTrigger={['onChange', 'onBlur']}
                                                rules={[
                                                    {
                                                        required: true,
                                                        whitespace: true,
                                                        message: "Please input sheet url or delete this field.",
                                                    },
                                                ]}
                                                noStyle
                                            >
                                                <Input
                                                    placeholder="Sheet URL"
                                                    style={{
                                                        width: '95%',
                                                    }}
                                                />
                                            </Form.Item>
                                            {fields.length > 1 ? (
                                                <MinusCircleOutlined
                                                    className="dynamic-delete-button"
                                                    onClick={() => remove(field.name)}
                                                />
                                            ) : null}
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            style={{
                                                width: '20%',
                                                marginLeft: '14%'
                                            }}
                                            icon={<PlusOutlined />}
                                        >
                                            Add Sheet URL
                                        </Button>
                                        <Form.ErrorList errors={errors} />
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
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
                        <Row>
                            <Col span={4} offset={10}>
                                <Button type="dashed" danger onClick={handleViewColumnClick} style={{marginBottom: 10}}>
                                    View Column List
                                </Button>
                            </Col>
                        </Row>
                        <Form.Item
                            wrapperCol={{
                                ...layout.wrapperCol,
                                offset: 19,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                {
                                    buttonState === 'column' ? 'Get Column List' : 'Add Campaign'
                                }
                            </Button>
                            <Button type="dashed" href="#/campaigns" style={{marginLeft: 5}}>
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
                                                    c.name === 'Phone' ? c.name : ((c.isInputDate == "true" || c.isInputDate == true) ? c.field : <Input disabled={!c.display} onChange={(e) => {handleColumnFieldChange(e, c)}} value={c.field}/>)
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

export default connect(
    "",
    { createCampaign }
)(CampaignAdd);
