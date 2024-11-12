import { useState, useEffect } from "react";
import { MicrophoneIcon, StopCircleIcon } from "@heroicons/react/24/solid";

const AudioRecorder = ({ fileReady }) => {
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recording, setRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        let interval;
        if (recording) {
            interval = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } else {
            setRecordingTime(0);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [recording]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const onMicrophoneClick = async () => {
        if (recording) {
            setRecording(false);
            if (mediaRecorder) {
                mediaRecorder.stop();
                setMediaRecorder(null);
            }
            return;
        }

        setRecording(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const newMediaRecorder = new MediaRecorder(stream);
            const chunks = [];

            newMediaRecorder.addEventListener("dataavailable", (event) => {
                chunks.push(event.data);
            });

            newMediaRecorder.addEventListener("stop", () => {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());

                let audioBlob = new Blob(chunks, {
                    type: "audio/ogg; codecs=opus",
                });
                let audioFile = new File([audioBlob], "recorded_audio.ogg", {
                    type: "audio/ogg; codecs=opus",
                });
                const url = URL.createObjectURL(audioFile);
                fileReady(audioFile, url);
            });

            newMediaRecorder.start();
            setMediaRecorder(newMediaRecorder);
        } catch (error) {
            setRecording(false);
            console.error("Error accessing microphone:", error);
            // You might want to show an error message to the user here
        }
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={onMicrophoneClick}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className={`p-2 rounded-full transition-all duration-200 ${
                    recording 
                        ? "bg-red-500/10 hover:bg-red-500/20" 
                        : "text-gray-400 hover:text-gray-200"
                }`}
            >
                {recording ? (
                    <div className="relative">
                        <StopCircleIcon className="w-6 h-6 text-red-500 animate-pulse" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    </div>
                ) : (
                    <MicrophoneIcon className="w-6 h-6" />
                )}
            </button>

            {/* Recording time indicator */}
            {recording && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 
                             text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {formatTime(recordingTime)}
                </div>
            )}

            {/* Tooltip */}
            {isHovering && !recording && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 
                             text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    Record Audio
                </div>
            )}
            {isHovering && recording && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 
                             text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    Stop Recording
                </div>
            )}
        </div>
    );
};

export default AudioRecorder;