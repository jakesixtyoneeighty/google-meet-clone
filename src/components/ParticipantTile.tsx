import { memo } from 'react';
import {
  ParticipantView,
  StreamVideoParticipant,
} from '@stream-io/video-react-sdk';

import ParticipantViewUI from './ParticipantViewUI';
import VideoPlaceholder from './VideoPlaceholder';

interface ParticipantTileProps {
  participant: StreamVideoParticipant;
  trackType?: 'videoTrack' | 'screenShareTrack';
}

const ParticipantTile = memo(({ participant, trackType }: ParticipantTileProps) => {
  return (
    <ParticipantView
      participant={participant}
      trackType={trackType}
      ParticipantViewUI={ParticipantViewUI}
      VideoPlaceholder={VideoPlaceholder}
    />
  );
});

ParticipantTile.displayName = 'ParticipantTile';

export default ParticipantTile;
