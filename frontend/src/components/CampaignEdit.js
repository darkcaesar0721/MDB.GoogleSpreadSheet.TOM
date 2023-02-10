import {
    Breadcrumb,
    Button,
    Checkbox,
    Col,
    Divider,
    Form,
    Input,
    message,
    Modal,
    Row,
} from "antd";
import {useEffect, useState} from "react";
import {connect} from "react-redux";
import {getCampaigns, updateCampaign} from "../redux/actions";
import {useNavigate, useParams} from 'react-router-dom';
import MDBPath from "./MDBPath";

function CampaignEdit(props) {
    const [mainForm] = Form.useForm();
    const [columnForm] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState(false);
    const [columns, setColumns] = useState([]);

    const {index} = useParams();
    const navigate = useNavigate();

    useEffect(function() {
        props.getCampaigns();
    }, []);

    useEffect(function() {
        if (props.campaigns.data.length > 0) {
            const selectedCampaign = props.campaigns.data[index];
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
        }
    }, [props.campaigns.data]);

    const handleSubmit = function(form) {
        if (columns.length === 0) {
            messageApi.warning('Please custom column! Currently nothing columns.');
            return;
        }

        let _columns = columns;
        _columns = _columns.sort((a, b) => {
            if (parseInt(a.order) < parseInt(b.order)) return -1;

            return 0;
        });

        form.key = form.query;
        form.columns = _columns;
        form.group = {};
        form.group.columns = _columns;
        props.updateCampaign(form);
        messageApi.success('update success');
        setTimeout(function() {
            navigate('/#/campaigns');
        }, 1000);
    }

    const layout = {
        labelCol: {
            span: 6,
        },
        wrapperCol: {
            span: 18,
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
        <>
            {contextHolder}
            <Row>
                <Col span={20} offset={1}>
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <a href="/#/">Upload Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a className="selected" href="/#/campaigns">Manage Campaign Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a href="/#/groups">Manage Campaign Action Group Page</a>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
            </Row>
            <MDBPath/>
            <Row style={{marginTop: '2rem'}}>
                <Col span={12} offset={6}>
                    <Divider>CAMPAIGN EDIT FORM</Divider>
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
                        >
                            <Input readOnly />
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
                                offset: 15,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                Update Campaign
                            </Button>
                            <Button type="dashed" href="/#/campaigns" style={{marginLeft: 5}}>
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
        </>
    );
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns };
};

export default connect(
    mapStateToProps,
    { getCampaigns, updateCampaign }
)(CampaignEdit);