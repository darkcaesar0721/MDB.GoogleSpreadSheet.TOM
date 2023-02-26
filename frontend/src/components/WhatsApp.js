import {Input, Col, Row, Divider, Form} from 'antd';
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {getWhatsApp, updateWhatsApp} from "../redux/actions";
import MenuList from "./MenuList";
import Path from "./Path/Path";

const formItemLayout = {
    labelCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 3,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 21,
        },
    },
};

function WhatsApp(props) {
    const [form] = Form.useForm();
    const [defaultMessage, setDefaultMessage] = useState('');
    const [instanceId, setInstanceId] = useState('');
    const [token, setToken] = useState('');

    useEffect(function() {
        props.getWhatsApp();
    }, []);

    useEffect(function() {
        form.setFieldsValue(props.whatsapp);
    }, [props.whatsapp]);

    const handleDefaultMessageChange = function(e) {
        setDefaultMessage(e.target.value);
    }

    const saveDefaultMessage = function() {
        props.updateWhatsApp({default_message: defaultMessage});
    }

    const handleInstanceIdChange = function(e) {
        setInstanceId(e.target.value);
    }

    const saveInstanceId = function() {
        props.updateWhatsApp({instance_id: instanceId,});
    }

    const handleTokenChange = function(e) {
        setToken(e.target.value);
    }

    const saveToken = function() {
        props.updateWhatsApp({token: token});
    }

    return (
        <>
            <MenuList
                currentPage="whatsapp"
            />
            <Path/>
            <Divider>WHATSAPP INSTANCE SETTING</Divider>
            <Row style={{marginTop: '2rem'}}>
                <Col span={20} offset={2}>
                    <Form
                        {...formItemLayout}
                        form={form}
                        name="whatsapp"
                        scrollToFirstError
                    >
                        <Form.Item
                            name="default_message"
                            label="Default Message"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input default message',
                                },
                            ]}
                        >
                            <Input.TextArea showCount autoSize={{ minRows: 3, maxRows: 10 }} value={defaultMessage} onBlur={saveDefaultMessage} onChange={handleDefaultMessageChange}/>
                        </Form.Item>
                        <Form.Item
                            name="instance_id"
                            label="Ultramsg Instance Id"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input instance id',
                                },
                            ]}
                        >
                            <Input value={instanceId} onBlur={saveInstanceId} onChange={handleInstanceIdChange}/>
                        </Form.Item>
                        <Form.Item
                            name="token"
                            label="Ultramsg Token"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input token',
                                },
                            ]}
                        >
                            <Input value={token} onBlur={saveToken} onChange={handleTokenChange}/>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </>
    );
}

const mapStateToProps = state => {
    return { whatsapp: state.whatsapp };
};

export default connect(
    mapStateToProps,
    { getWhatsApp, updateWhatsApp }
)(WhatsApp);