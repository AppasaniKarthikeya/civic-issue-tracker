'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Mic, Square, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onRemove?: () => void;
}

export default function VoiceRecorder({ onRecordingComplete, onRemove }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please grant permission.');
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const removeRecording = () => {
    setAudioUrl(null);
    setDuration(0);
    onRemove?.();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioUrl) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <audio src={audioUrl} controls className="flex-1 h-8" />
        <button
          type="button"
          onClick={removeRecording}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isRecording ? (
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200 w-full">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-red-700">
            Recording... {formatDuration(duration)}
          </span>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={stopRecording}
            className="ml-auto"
          >
            <Square size={14} />
            Stop
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={startRecording}>
          <Mic size={16} />
          Record Voice Note
        </Button>
      )}
    </div>
  );
}
