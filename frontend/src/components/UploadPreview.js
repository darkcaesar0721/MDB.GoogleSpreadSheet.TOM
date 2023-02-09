import {Breadcrumb, Button, Col, Form, InputNumber, Radio, Row, Table} from "antd";
import MDBPath from "./MDBPath";
import {connect} from "react-redux";
import {getCampaigns, getGroups} from "../redux/actions";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";

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

const UploadPreview = (props) => {
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
    const {campaignIndex, groupIndex} = useParams();
    const navigate = useNavigate();

    useEffect(function() {
        props.getCampaigns();
        props.getGroups();
    }, []);

    useEffect(function() {
        if (props.groups.data.length > 0 && props.campaigns.data.length > 0) {
            const selectedCampaign = props.groups.data[groupIndex].campaigns[campaignIndex];
            setWay(selectedCampaign.way);
            setStaticCount(selectedCampaign.staticCount);
            mainForm.setFieldsValue(selectedCampaign);

            let tbl_columns = [];
            let no_column = {
                title: 'no',
                key: 'no',
                render: (_, record) => {
                    let number = 0;
                    selectedCampaign.upRows.forEach((c, i) => {
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
        }
    }, [props.groups.data]);

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    return (
        <>
            <Row>
                <Col span={20} offset={1}>
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <a className="selected" href="/">Upload Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a href="/campaigns">Manage Campaign Page</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a href="/groups">Manage Campaign Action Group Page</a>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
            </Row>
            <MDBPath/>
            <Row>
                <Col span={20} offset={2} style={{marginTop: 20}}>
                    {
                        props.groups.data.length  > 0 ?
                            <Form
                                {...layout}
                                name="add_group_form"
                                className="group-setting-form"
                                form={mainForm}
                            >
                                <Form.Item
                                    name={['query']}
                                    label="Query"
                                >
                                    <span>{props.groups.data[groupIndex].campaigns[campaignIndex].key}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['way']}
                                    label="Select Way"
                                >
                                    <Radio.Group disabled={true} defaultValue={way} value={way}>
                                        <Radio value="all">All Select</Radio>
                                        <Radio value="static">Static Select</Radio>
                                        <Radio value="random">Random Select</Radio>
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
                            </Form> : ''
                    }
                </Col>
                {
                    props.groups.data.length  > 0 ?
                        <Col span={3} offset={3} style={{marginBottom: 5}}>
                            Total Rows : {props.groups.data[groupIndex].campaigns[campaignIndex].last_qty}
                        </Col> : ''
                }
                {
                    props.groups.data.length  > 0 ?
                        <Col span={4} style={{marginBottom: 5}}>
                            Upload Rows : {props.groups.data[groupIndex].campaigns[campaignIndex].less_qty}
                        </Col> : ''
                }
                {
                    props.groups.data.length  > 0 ?
                        <Col span={22} offset={1}>
                            <Table
                                size="small"
                                columns={tableColumns}
                                dataSource={props.groups.data[groupIndex].campaigns[campaignIndex].upRows}
                                pagination={tableParams.pagination}
                                onChange={handleTableChange}
                            />
                        </Col> : ''
                }
            </Row>
        </>
    )
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns, groups: state.groups };
};

export default connect(
    mapStateToProps,
    { getCampaigns, getGroups }
)(UploadPreview);