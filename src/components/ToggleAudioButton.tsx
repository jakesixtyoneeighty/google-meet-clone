import { useCallStateHooks, useNoiseCancellation } from '@stream-io/video-react-sdk';
import clsx from 'clsx';
import { Mic, MicOff, VolumeX } from 'lucide-react';

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

  const {
    isSupported,
    isEnabled: isNoiseCancellationEnabled,
    setEnabled: setNoiseCancellationEnabled,
  } = useNoiseCancellation();

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
          
          {isSupported && (
            <div className="flex items-center justify-between px-3 py-2 bg-nj-grey-800 rounded-lg border border-nj-grey-700">
              <div className="flex items-center gap-2">
                <VolumeX size={16} className="text-nj-grey-400" />
                <span className="text-xs font-medium text-white">Noise Suppression</span>
              </div>
              <button
                onClick={() => setNoiseCancellationEnabled(!isNoiseCancellationEnabled)}
                className={clsx(
                  'w-8 h-4 rounded-full transition-colors relative',
                  isNoiseCancellationEnabled ? 'bg-nj-red' : 'bg-nj-grey-600'
                )}
              >
                <div className={clsx(
                  'absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all',
                  isNoiseCancellationEnabled ? 'left-4.5' : 'left-0.5'
                )} />
              </button>
            </div>
          )}
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
