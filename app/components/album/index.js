import React from 'react'
import { connect } from 'react-redux'
import { 
  clearAlbumPageError, 
  getAlbumPageData, 
  clearAlbumPageData,
  appendAlbumToPlayQueue,
  replaceQueueWithAlbumAndPlay,
} from '../../actions/album-actions'

class Album extends React.Component {
  // only call for data once the page
  // has rendered on the client as lastfm's
  // rate limiting allows 5 requests per second
  // per originating IP adress averaged over a 5 album period
  constructor() {
    super();

    this.appendAlbumToQueue = this.appendAlbumToQueue.bind(this);
    this.replaceQueueWithAlbumAndPlay = this.replaceQueueWithAlbumAndPlay.bind(this);
  }

  componentDidMount() {
    if (this.props.params.mbid) {
      this.getAlbumData({ mbid: this.props.params.mbid});
    } else {
      this.getAlbumData({
        artist: this.props.params.artist, 
        album: this.props.params.album
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.mbid) {
      if(nextProps.params.mbid !== this.props.params.mbid) {
        // TODO:  investigate whether getAlbumPageDat action creator
        // can use a thunk as well as using promise middleware
        // if so we can just dispatch one action instead of three here
        this.props.dispatch(clearAlbumPageData());
        this.props.dispatch(clearAlbumPageError());
        this.getAlbumData({ mbid: nextProps.params.mbid});
      }
    } else if (nextProps.params.album !== this.props.params.album) {
      this.props.dispatch(clearAlbumPageData());
      this.props.dispatch(clearAlbumPageError());
      this.getAlbumData({
        artist: nextProps.params.artist, 
        album: nextProps.params.album
      });
    }
  }
  
  getAlbumData(params) {
    this.props.dispatch(
      getAlbumPageData(
        params,
      )
    );
  } 

  renderTracks() {
    if(this.props.albumPageData.tracks) {
      return (
        <table className="album__tracks-table">
          <tbody>
            {
              this.props.albumPageData.tracks.map((track, i) => {
                return (
                  <tr className="album__track-row" key={i}>
                    <td 
                      className="album__track-cell"
                    >
                      <span className="album__track-rank">
                        {track['@attr'].rank}
                      </span>
                      <span className="album__track-play">
                        <i className="fa fa-play" />
                      </span>
                    </td>
                    <td className="album__track-cell">{track.name}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table> 
      )
    } else {
      return null;
    }
  }

  appendAlbumToQueue() {
    this.props.dispatch(
      appendAlbumToPlayQueue(
        this.props.albumPageData.tracks
      )
    );
  }

  replaceQueueWithAlbumAndPlay() {
    this.props.dispatch(
      replaceQueueWithAlbumAndPlay(
        this.props.albumPageData.tracks
      )
    );
  }

  render() {
    const {
      albumPageData,
      currentAlbumPageError,
    } = this.props;
    
    if (albumPageData) {
      // sometimes lastfm returns successfully but with an empty 
      // json object. To counter this the reducer has a case for
      // this an returns and error property when it does happen
      if(albumPageData.error) {
        return(
          <h3>No album found for this search result.</h3>
        )
      } else {
        return (
          <div className="album">
            <div className="album__header">
              <img 
                src={albumPageData.image} 
                className="album__header-image"
                alt={`${albumPageData.name} by ${albumPageData.artist}`}
                width="174"
                height="174"
              />
              <h5 className="album__header-identifier">Album</h5>
              <h1 className="album__header-name">{albumPageData.name}</h1>
              <h3 className="album__header-artist">{albumPageData.artist}</h3>
              <button 
                onClick={this.replaceQueueWithAlbumAndPlay}
                className="button button--primary button--play"
                >
                Play
              </button>
              <button 
                onClick={this.appendAlbumToQueue}
                className="button button--add"
                >
                +
              </button>
            </div>
            <div className="album__tracks">
              {this.renderTracks()}
            </div>
          </div>
        );
      }
    } else if(currentAlbumPageError) {
      return(
        <h3>No album found for this search result.</h3>
      );
    } else {
      return (
        <div className="route-content-spinner" />
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    albumPageData: state.albumPage.albumPageData,
    currentAlbumPageError: state.currentAlbumPageError,
  }
}

export default connect(mapStateToProps)(Album);
