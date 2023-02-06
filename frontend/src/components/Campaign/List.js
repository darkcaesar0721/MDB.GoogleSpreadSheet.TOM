import {Button, Divider} from "antd";

function CampaignList(props) {
    const handleAdd = function() {
        props.changeCampaignViewState('add');
    }

    return (
        <>
            <Button onClick={handleAdd} type="primary" style={{ marginBottom: 5, marginTop: 20 }}>
                Add Campaign
            </Button>
            <Divider>MDB QUERY CAMPAIGNS</Divider>
        </>
    );
}

export default CampaignList;
