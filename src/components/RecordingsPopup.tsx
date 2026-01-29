import { MutableRefObject, useEffect, useState } from 'react';
import {
  CallRecording,
  CallRecordingList,
  useCall,
} from '@stream-io/video-react-sdk';
import { Video } from 'lucide-react';

import Popup from './Popup';
import useClickOutside from '../hooks/useClickOutside';

interface RecordingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecordingsPopup = ({ isOpen, onClose }: RecordingsPopupProps) => {
  const call = useCall();
  const [callRecordings, setCallRecordings] = useState<CallRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useClickOutside(() => {
    onClose();
  }, true) as MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    const fetchCallRecordings = async () => {
      try {
        const response = await call?.queryRecordings();
        setCallRecordings(response?.recordings || []);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    call && isOpen && fetchCallRecordings();
  }, [call, isOpen]);

  return (
    <Popup
      ref={ref}
      open={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Video size={18} className="text-nj-red" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">Broadcast Recordings</h2>
        </div>
      }
      className="left-auto right-0 bottom-24 w-96 h-[30rem] !bg-nj-grey-950/90 backdrop-blur-xl border border-nj-grey-800 shadow-red-glow"
    >
      <div className="w-full h-full p-4 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-nj-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <CallRecordingList callRecordings={callRecordings} />
        )}
      </div>
    </Popup>
  );
};

export default RecordingsPopup;
