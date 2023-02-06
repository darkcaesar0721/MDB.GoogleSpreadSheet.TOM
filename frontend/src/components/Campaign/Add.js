import {Button, Col, DatePicker, Divider, Form, Input, InputNumber, message, Row, Spin, TimePicker} from "antd";
import {useState} from "react";
import axios from "axios";
import {APP_API_URL} from "../../constants";
import qs from "qs";

function CampaignAdd(props) {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const handleSubmit = function(form) {
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

            }
        })
    }

    const handleFormChange = function({query}) {
    }

    const handleCancel = function() {
        props.changeCampaignViewState('list');
    }

    const layout = {
        labelCol: {
            span: 7,
        },
        wrapperCol: {
            span: 17,
        },
    };

    const validateMessages = {
        required: '${label} is required!'
    };

    return (
        <Spin spinning={loading} tip="Checking Query..." delay={500}>
            {contextHolder}
            <Row style={{marginTop: '2rem'}}>
                <Col span={8} offset={8}>
                    <Divider>CAMPAIGN COMPOSE FORM</Divider>
                    <Form
                        {...layout}
                        name="campaign_add_form"
                        onFinish={handleSubmit}
                        onValuesChange={handleFormChange}
                        style={{
                            maxWidth: 600,
                        }}
                        validateMessages={validateMessages}
                    >
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
                        <Form.Item
                            name={['less_qty']}
                            label="Less Qty count"
                        >
                            <InputNumber />
                        </Form.Item>
                        <Form.Item
                            name={['last_qty']}
                            label="Last Qty count"
                        >
                            <InputNumber />
                        </Form.Item>
                        <Form.Item
                            name={['phone']}
                            label="Last Phone"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name={['date']}
                            label="SystemCreateDate"
                        >
                            <DatePicker />
                        </Form.Item>
                        <Form.Item
                            name={['time']}
                            label="SystemCreateTime"
                        >
                            <TimePicker use12Hours format="h:mm:ss A" />
                        </Form.Item>
                        <Form.Item
                            wrapperCol={{
                                ...layout.wrapperCol,
                                offset: 4,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                Add
                            </Button>
                            <Button style={{marginLeft: 10}} onClick={handleCancel}>
                                Cancel
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Spin>
    );
}

export default CampaignAdd;
