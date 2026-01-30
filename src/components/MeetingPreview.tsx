import { useEffect, useState } from 'react';
import {
  VideoPreview,
  useCallStateHooks,
  useConnectedUser,
  BackgroundFiltersProvider,
  useBackgroundFilters,
} from '@stream-io/video-react-sdk';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sparkles
} from 'lucide-react';

import {
  AudioInputDeviceSelector,
  AudioOutputDeviceSelector,
  VideoInputDeviceSelector,
} from './DeviceSelector';
import IconButton from './IconButton';
import SpeechIndicator from './SpeechIndicator';
import useSoundDetected from '../hooks/useSoundDetected';

const MeetingPreview = () => {
  const user = useConnectedUser();
  const soundDetected = useSoundDetected();
  const [videoPreviewText, setVideoPreviewText] = useState('');
  const [displaySelectors, setDisplaySelectors] = useState(false);
  const [devicesEnabled, setDevicesEnabled] = useState(false);
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const {
    camera,
    optimisticIsMute: isCameraMute,
    hasBrowserPermission: hasCameraPermission,
  } = useCameraState();
  const {
    microphone,
    optimisticIsMute: isMicrophoneMute,
    hasBrowserPermission: hasMicrophonePermission,
    status: microphoneStatus,
  } = useMicrophoneState();

  useEffect(() => {
    const prepareDevices = async () => {
      // Defer enabling until user interaction to avoid permission churn
      setDevicesEnabled(true);
    };

    prepareDevices();
  }, []);

  useEffect(() => {
    if (hasMicrophonePermission === undefined) return;
    if (
      (hasMicrophonePermission && microphoneStatus) ||
      !hasMicrophonePermission
    ) {
      setDisplaySelectors(true);
    }
  }, [microphoneStatus, hasMicrophonePermission]);

  const toggleCamera = async () => {
    try {
      setVideoPreviewText((prev) =>
        prev === '' || prev === 'Camera is off'
          ? 'Camera is starting'
          : 'Camera is off'
      );
      await camera.toggle();
      setVideoPreviewText((prev) =>
        prev === 'Camera is off' ? 'Camera is starting' : 'Camera is off'
      );
    } catch (error) {
      console.error(error);
    }
  };

  const toggleMicrophone = async () => {
    try {
      await microphone.toggle();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-3xl lg:pr-2 lg:mt-8">
      <div className="relative w-full rounded-2xl max-w-185 aspect-video mx-auto shadow-2xl overflow-hidden border border-nj-grey-800 glass-card">
        {/* Background */}
        <div className="absolute inset-0 z-0 bg-nj-grey-950" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Video preview */}
        <div className="absolute inset-0 z-1 flex items-center justify-center rounded-2xl overflow-hidden [&_video]:-scale-x-100">
          <VideoPreview
            DisabledVideoPreview={() => DisabledVideoPreview(videoPreviewText)}
          />
        </div>

        {devicesEnabled && (
          <div className="z-20 absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-premium">
            {/* Microphone control */}
            <IconButton
              icon={isMicrophoneMute ? <MicOff size={20} /> : <Mic size={20} />}
              title={
                isMicrophoneMute ? 'Turn on microphone' : 'Turn off microphone'
              }
              onClick={toggleMicrophone}
              active={isMicrophoneMute}
              alert={!hasMicrophonePermission}
              variant="secondary"
            />
            {/* Camera control */}
            <IconButton
              icon={isCameraMute ? <VideoOff size={20} /> : <Video size={20} />}
              title={isCameraMute ? 'Turn on camera' : 'Turn off camera'}
              onClick={toggleCamera}
              active={isCameraMute}
              alert={!hasCameraPermission}
              variant="secondary"
            />
          </div>
        )}

        {/* Speech Indicator */}
        {microphoneStatus && microphoneStatus === 'enabled' && (
          <div className="z-20 absolute bottom-6 left-6 w-10 h-10 flex items-center justify-center bg-nj-red rounded-full shadow-red-glow border-2 border-white/20">
            <SpeechIndicator isSpeaking={soundDetected} />
          </div>
        )}

        {/* User name */}
        {devicesEnabled && hasCameraPermission && (
          <div className="z-20 absolute left-6 top-6 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-sm font-bold tracking-tight shadow-premium">
            {user?.name || 'Broadcaster'}
          </div>
        )}

        {devicesEnabled && (
          <BackgroundBlurButtonWithProvider />
        )}
      </div>

      <div className="hidden lg:flex items-center gap-4 mt-8 ml-2 px-4">
        {displaySelectors && (
          <>
            <div className="flex-1">
              <AudioInputDeviceSelector disabled={!hasMicrophonePermission} />
            </div>
            <div className="flex-1">
              <AudioOutputDeviceSelector disabled={!hasMicrophonePermission} />
            </div>
            <div className="flex-1">
              <VideoInputDeviceSelector disabled={!hasCameraPermission} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Background blur button component - uses the SDK's background filters
const BackgroundBlurButton = () => {
  const [isBlurEnabled, setIsBlurEnabled] = useState(false);
  const {
    isSupported,
    isReady,
    disableBackgroundFilter,
    applyBackgroundBlurFilter,
  } = useBackgroundFilters();

  const toggleBlur = () => {
    if (isBlurEnabled) {
      disableBackgroundFilter();
      setIsBlurEnabled(false);
    } else {
      applyBackgroundBlurFilter('medium');
      setIsBlurEnabled(true);
    }
  };

  // Don't render if not supported or not ready
  if (!isSupported || !isReady) return null;

  return (
    <div className="z-20 absolute bottom-6 right-6">
      <IconButton
        icon={<Sparkles size={20} />}
        title={isBlurEnabled ? 'Turn off background blur' : 'Turn on background blur'}
        onClick={toggleBlur}
        variant="secondary"
        className={`!bg-black/40 !border-white/10 ${isBlurEnabled ? '!text-nj-red' : 'hover:!text-nj-red'}`}
      />
    </div>
  );
};

// Wrapper that provides the BackgroundFiltersProvider context
const BackgroundBlurButtonWithProvider = () => {
  return (
    <BackgroundFiltersProvider>
      <BackgroundBlurButton />
    </BackgroundFiltersProvider>
  );
};

export const DisabledVideoPreview = (videoPreviewText: string) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-20 h-20 bg-nj-grey-900 rounded-full flex items-center justify-center border border-nj-grey-800 shadow-premium">
        <VideoOff size={40} className="text-nj-grey-500" />
      </div>
      <div className="text-xl font-bold tracking-tight text-nj-grey-400 uppercase">{videoPreviewText || 'Camera is off'}</div>
    </div>
  );
};

export default MeetingPreview;

