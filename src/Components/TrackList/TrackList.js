import React from 'react';
import Track from '../Track/Track';
import './TrackList.css';

export default class TrackList extends React.Component {
  render() {
    return (
      <div className="TrackList">
        {this.props.tracks.map(track => {
          return <Track
          track={track}
          key={track.id}
          onAdd={track.props.onAdd}
          isRemoval={track.props.isRemoval}
          onRemove={track.props.onRemove} />;
        })}
      </div>
    );
  }
}
