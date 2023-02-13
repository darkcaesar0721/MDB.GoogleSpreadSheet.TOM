import {Button, Col, Form, InputNumber, Radio, Row, Table} from "antd";
import MDBPath from "./MDBPath";
import {connect} from "react-redux";
import {getCampaigns, getGroups} from "../redux/actions";
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import MenuList from "./MenuList";

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

const CampaignUploadPreview = (props) => {
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
    const {groupIndex, groupCampaignIndex, campaignIndex} = useParams();

    useEffect(function() {
        props.getCampaigns();
        props.getGroups();
    }, []);

    useEffect(function() {
        if (props.groups.data.length > 0 && props.campaigns.data.length > 0) {
            const selectedCampaign = props.groups.data[groupIndex].campaigns[groupCampaignIndex];
            setWay(selectedCampaign.way);
            setStaticCount(selectedCampaign.staticCount);
            mainForm.setFieldsValue(selectedCampaign);

            let tbl_columns = [];
            let no_column = {
                title: 'no',
                key: 'no',
                render: (_, record) => {
                    let number = 0;
                    props.campaigns.data[campaignIndex].upRows.forEach((c, i) => {
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
            tbl_columns.push({title: 'SystemCreateDate', dataIndex: 'SystemCreateDate', key: 'SystemCreateDate'});
            setTableColumns(tbl_columns);
        }
    }, [props.groups.data, props.campaigns.data]);

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    return (
        <>
            <MenuList
                currentPage="upload"
            />
            <MDBPath/>
            <Row>
                <Col span={20} offset={2} style={{marginTop: 20}}>
                    {
                        props.groups.data.length  > 0 && props.campaigns.data.length > 0 ?
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
                                    <span>{props.groups.data[groupIndex].name}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['query']}
                                    label="Query Name"
                                >
                                    <span>{props.campaigns.data[campaignIndex].query}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['urls']}
                                    label="Sheet URLS"
                                >
                                    {
                                        props.campaigns.data[campaignIndex].urls.map(url => {
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
                                    <span>{props.campaigns.data[campaignIndex].schedule}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['way']}
                                    label="Send Type"
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
                    props.campaigns.data.length  > 0 ?
                        <Col span={3} offset={1} style={{marginBottom: 5}}>
                            Qty Available : <span style={{color: 'red', fontSize: '1.2rem'}}>{props.campaigns.data[campaignIndex].last_qty}</span>
                        </Col> : ''
                }
                {
                    props.campaigns.data.length  > 0 ?
                        <Col span={4} style={{marginBottom: 5}}>
                            Qty Uploaded : <span style={{color: 'red', fontSize: '1.2rem'}}>{props.campaigns.data[campaignIndex].less_qty}</span>
                        </Col> : ''
                }
                {
                    props.campaigns.data.length  > 0 ?
                        <Col span={22} offset={1}>
                            <Table
                                size="small"
                                columns={tableColumns}
                                dataSource={props.campaigns.data[campaignIndex].upRows}
                                pagination={tableParams.pagination}
                                onChange={handleTableChange}
                            />
                        </Col> : ''
                }
            </Row>
            <Row style={{marginTop: '1rem'}}>
                <Col offset={20} span={3}>
                    <Button type="dashed" href="#/">
                        Go to Upload Page
                    </Button>
                </Col>
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
)(CampaignUploadPreview);