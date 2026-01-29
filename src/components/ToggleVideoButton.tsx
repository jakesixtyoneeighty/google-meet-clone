import { useCallStateHooks } from '@stream-io/video-react-sdk';
import clsx from 'clsx';
import { Video, VideoOff, Sparkles } from 'lucide-react';

import CallControlButton from './CallControlButton';
import ToggleButtonContainer from './ToggleButtonContainer';
import { VideoInputDeviceSelector } from './DeviceSelector';

const ICON_SIZE = 20;

const ToggleVideoButton = () => {
  const { useCameraState } = useCallStateHooks();
  const {
    camera,
    optimisticIsMute: isCameraMute,
    hasBrowserPermission,
  } = useCameraState();

  const toggleCamera = async () => {
    try {
      await camera.toggle();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ToggleButtonContainer
      deviceSelectors={
        <div className="p-2">
          <VideoInputDeviceSelector
            className="w-full"
            dark
            disabled={!hasBrowserPermission}
          />
        </div>
      }
      icons={
        <div title="Apply visual effects" className="text-nj-grey-400 hover:text-nj-red cursor-pointer p-2">
          <Sparkles size={ICON_SIZE} />
        </div>
      }
    >
      <CallControlButton
        icon={
          isCameraMute ? (
            <VideoOff size={ICON_SIZE} />
          ) : (
            <Video size={ICON_SIZE} />
          )
        }
        title={isCameraMute ? 'Turn on camera' : 'Turn off camera'}
        onClick={toggleCamera}
        active={isCameraMute}
        alert={!hasBrowserPermission}
        className={clsx(isCameraMute && '!bg-nj-red')}
      />
    </ToggleButtonContainer>
  );
};

export default ToggleVideoButton;
