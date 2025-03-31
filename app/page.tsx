"use client"; // Only needed for App Router

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // Load WebGL for better performance
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { drawHand } from "../utils/drawHand";

export default function GestureWave() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = ["Slide 1", "Slide 2", "Slide 3"]; // Example slides

  useEffect(() => {
    const runHandpose = async () => {
      await tf.setBackend("webgl"); // Ensure TensorFlow.js uses WebGL
      await tf.ready();
      const net = await handpose.load();
      setInterval(() => {
        detect(net);
      }, 100);
    };

    const detect = async (net) => {
      if (
        webcamRef.current &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const hand = await net.estimateHands(video);
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        drawHand(hand, ctx); // Call drawHand to visualize tracking

        if (hand.length > 0) {
          const gesture = hand[0].annotations;
          if (gesture.indexFinger[0][0] > gesture.palmBase[0][0]) {
            setSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
          } else if (gesture.indexFinger[0][0] < gesture.palmBase[0][0]) {
            setSlideIndex((prev) => Math.max(prev - 1, 0));
          }
        }
      }
    };

    runHandpose();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Gesture-Wave</h1>
      <Webcam
        ref={webcamRef}
        className="w-1/2 h-auto rounded-lg"
        videoConstraints={{ facingMode: "user" }} // Use front camera
      />
      <canvas ref={canvasRef} className="absolute top-0 left-0" />
      <div className="mt-4 p-6 bg-gray-800 rounded-lg text-xl">{slides[slideIndex]}</div>
    </div>
  );
}