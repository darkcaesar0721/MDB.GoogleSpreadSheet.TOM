import CampaignAdd from "./Add";
import CampaignEdit from "./Edit";
import CampaignList from "./List";
import {connect} from "react-redux";
import {changeCampaignViewState, createCampaign, deleteCampaign, updateCampaign} from "../../redux/actions";

function Campaign(props) {

    return (
        <div>
            <CampaignAdd
                createCampaign={props.createCampaign}
                changeCampaignViewState={props.changeCampaignViewState}
            />
            <CampaignEdit
                updateCampaign={props.updateCampaign}
                changeCampaignViewState={props.changeCampaignViewState}
            />
            <CampaignList
                deleteCampaign={props.deleteCampaign}
                changeCampaignViewState={props.changeCampaignViewState}
            />
        </div>
    );
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns };
};

export default connect(
    mapStateToProps,
    { createCampaign, updateCampaign, deleteCampaign, changeCampaignViewState }
)(Campaign);