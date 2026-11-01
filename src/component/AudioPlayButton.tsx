import { useAppContext } from './AppContext';
import { audioParamsToQueueItem } from '../types/audio_player';

type AudioPlayButtonProps = {
    data: AudioPlayerParams;
    onPlay?: () => void;
};

export default function AudioPlayButton({ data, onPlay }: AudioPlayButtonProps) {
    const { nowPlaying, isPlaying, playEpisode, togglePlayback } = useAppContext();

    const targetId = data.id || data.itemId || data.src;
    const isCurrentEpisode = Boolean(
        nowPlaying &&
            ((targetId && nowPlaying.id === targetId) ||
                (data.src && nowPlaying.src === data.src))
    );
    const isPlayingThisEpisode = isCurrentEpisode && isPlaying;

    const onPlayBtnClick = () => {
        if (isCurrentEpisode) {
            togglePlayback();
            return;
        }
        if (onPlay) {
            onPlay();
            return;
        }
        playEpisode(audioParamsToQueueItem(data));
    };

    return (
        <button
            type="button"
            aria-label={isPlayingThisEpisode ? 'Pause episode' : 'Play episode'}
            title={isPlayingThisEpisode ? 'Pause episode' : 'Play episode'}
            className={`btn btn-circle btn-sm ${
                isPlayingThisEpisode ? 'btn-primary' : 'btn-outline'
            }`}
            onClick={onPlayBtnClick}
        >
            {isPlayingThisEpisode ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="fill-current rounded-full ml-0.5"
                >
                    <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
            )}
        </button>
    );
}
