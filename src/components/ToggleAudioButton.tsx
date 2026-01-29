import { useCallStateHooks } from '@stream-io/video-react-sdk';
import clsx from 'clsx';
import { Mic, MicOff } from 'lucide-react';

import {
  AudioInputDeviceSelector,
  AudioOutputDeviceSelector,
} from './DeviceSelector';
import CallControlButton from './CallControlButton';
import ToggleButtonContainer from './ToggleButtonContainer';

const ICON_SIZE = 20;

const ToggleAudioButton = () => {
  const { useMicrophoneState } = useCallStateHooks();
  const {
    microphone,
    optimisticIsMute: isMicrophoneMute,
    hasBrowserPermission,
  } = useMicrophoneState();

  const toggleMicrophone = async () => {
    try {
      await microphone.toggle();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ToggleButtonContainer
      deviceSelectors={
        <div className="flex flex-col gap-3 p-2">
          <AudioInputDeviceSelector
            className="w-full"
            dark
            disabled={!hasBrowserPermission}
          />
          <AudioOutputDeviceSelector
            className="w-full"
            dark
            disabled={!hasBrowserPermission}
          />
        </div>
      }
    >
      <CallControlButton
        icon={
          isMicrophoneMute ? (
            <MicOff size={ICON_SIZE} />
          ) : (
            <Mic size={ICON_SIZE} />
          )
        }
        title={isMicrophoneMute ? 'Turn on microphone' : 'Turn off microphone'}
        onClick={toggleMicrophone}
        active={isMicrophoneMute}
        alert={!hasBrowserPermission}
        className={clsx(isMicrophoneMute && '!bg-nj-red')}
      />
    </ToggleButtonContainer>
  );
};

export default ToggleAudioButton;
