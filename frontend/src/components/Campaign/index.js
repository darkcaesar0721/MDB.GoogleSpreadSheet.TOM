// import CampaignAdd from "./Add";
// import CampaignEdit from "./Edit";
// import CampaignList from "./List";
// import CampaignPreview from "./Preview";
// import {connect} from "react-redux";
// import {
//     changeCampaignViewState,
//     createCampaign,
//     deleteCampaign,
//     getCampaigns, setSelectedCampaignIndex,
//     updateCampaign
// } from "../../redux/actions";
//
// function Campaign(props) {
//     return (
//         <>
//             {
//                 props.campaigns.viewState === 'add' ?
//                     <CampaignAdd
//                         createCampaign={props.createCampaign}
//                         changeCampaignViewState={props.changeCampaignViewState}
//                     /> : ''
//             }
//             {
//                 props.campaigns.viewState === 'edit' ?
//                     <CampaignEdit
//                         updateCampaign={props.updateCampaign}
//                         changeCampaignViewState={props.changeCampaignViewState}
//                         campaigns={props.campaigns}
//                     /> : ''
//             }
//             {
//                 props.campaigns.viewState === 'preview' ?
//                     <CampaignPreview
//                         updateCampaign={props.updateCampaign}
//                         changeCampaignViewState={props.changeCampaignViewState}
//                         campaigns={props.campaigns}
//                     /> : ''
//             }
//             {
//                 props.campaigns.viewState === 'list' ?
//                     <CampaignList
//                         getCampaigns={props.getCampaigns}
//                         updateCampaign={props.updateCampaign}
//                         deleteCampaign={props.deleteCampaign}
//                         changeCampaignViewState={props.changeCampaignViewState}
//                         setSelectedCampaignIndex={props.setSelectedCampaignIndex}
//                         campaigns={props.campaigns}
//                     /> : ''
//             }
//         </>
//     );
// }
//
// const mapStateToProps = state => {
//     return { campaigns: state.campaigns };
// };
//
// export default connect(
//     mapStateToProps,
//     { getCampaigns, createCampaign, updateCampaign, deleteCampaign, changeCampaignViewState, setSelectedCampaignIndex }
// )(Campaign);