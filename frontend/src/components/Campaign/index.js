import CampaignAdd from "./Add";
import CampaignEdit from "./Edit";
import CampaignList from "./List";
import {connect} from "react-redux";
import {
    changeCampaignViewState,
    createCampaign,
    deleteCampaign,
    getCampaigns, setSelectedCampaign,
    updateCampaign
} from "../../redux/actions";

function Campaign(props) {
    return (
        <>
            {
                props.campaigns.viewState === 'add' ?
                    <CampaignAdd
                        createCampaign={props.createCampaign}
                        changeCampaignViewState={props.changeCampaignViewState}
                    /> : ''
            }
            {
                props.campaigns.viewState === 'edit' ?
                    <CampaignEdit
                        updateCampaign={props.updateCampaign}
                        changeCampaignViewState={props.changeCampaignViewState}
                        campaigns={props.campaigns}
                    /> : ''
            }
            {
                props.campaigns.viewState === 'list' ?
                    <CampaignList
                        getCampaigns={props.getCampaigns}
                        deleteCampaign={props.deleteCampaign}
                        changeCampaignViewState={props.changeCampaignViewState}
                        setSelectedCampaign={props.setSelectedCampaign}
                        campaigns={props.campaigns}
                    /> : ''
            }
        </>
    );
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns };
};

export default connect(
    mapStateToProps,
    { getCampaigns, createCampaign, updateCampaign, deleteCampaign, changeCampaignViewState, setSelectedCampaign }
)(Campaign);