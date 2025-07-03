import { useEffect, useRef, useState } from "react";

type RoutePoint = {
  x: number;
  y: number;
  delay: number;
};

export const DotMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Set up routes that will animate across the map
  const routes: { start: RoutePoint; end: RoutePoint; color: string }[] = [
    {
      start: { x: 100, y: 150, delay: 0 },
      end: { x: 200, y: 80, delay: 2 },
      color: "#2563eb", // Slightly darker blue for better visibility on light bg
    },
    {
      start: { x: 200, y: 80, delay: 2 },
      end: { x: 260, y: 120, delay: 4 },
      color: "#2563eb",
    },
    {
      start: { x: 50, y: 50, delay: 1 },
      end: { x: 150, y: 180, delay: 3 },
      color: "#2563eb",
    },
    {
      start: { x: 280, y: 60, delay: 0.5 },
      end: { x: 180, y: 180, delay: 2.5 },
      color: "#2563eb",
    },
  ];

  // Create dots for the world map
  const generateDots = (width: number, height: number) => {
    const dots = [];
    const gap = 12;
    const dotRadius = 1;

    // Create a dot grid pattern with random opacity
    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        // Shape the dots to form a world map silhouette
        const isInMapShape =
          // North America
          (x < width * 0.25 &&
            x > width * 0.05 &&
            y < height * 0.4 &&
            y > height * 0.1) ||
          // South America
          (x < width * 0.25 &&
            x > width * 0.15 &&
            y < height * 0.8 &&
            y > height * 0.4) ||
          // Europe
          (x < width * 0.45 &&
            x > width * 0.3 &&
            y < height * 0.35 &&
            y > height * 0.15) ||
          // Africa
          (x < width * 0.5 &&
            x > width * 0.35 &&
            y < height * 0.65 &&
            y > height * 0.35) ||
          // Asia
          (x < width * 0.7 &&
            x > width * 0.45 &&
            y < height * 0.5 &&
            y > height * 0.1) ||
          // Australia
          (x < width * 0.8 &&
            x > width * 0.65 &&
            y < height * 0.8 &&
            y > height * 0.6);

        if (isInMapShape && Math.random() > 0.3) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.5 + 0.2, // Slightly higher opacity for light theme
          });
        }
      }
    }
    return dots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });

    resizeObserver.observe(canvas.parentElement as Element);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dots = generateDots(dimensions.width, dimensions.height);
    let animationFrameId: number;
    let startTime = Date.now();

    // Draw background dots
    function drawDots() {
      ctx?.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw the dots
      dots.forEach((dot) => {
        ctx?.beginPath();
        ctx?.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(37, 99, 235, ${dot.opacity})`; // Blue dots for light theme
        ctx?.fill();
      });
    }

    // Draw animated routes
    function drawRoutes() {
      const currentTime = (Date.now() - startTime) / 1000; // Time in seconds

      routes.forEach((route) => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;

        const duration = 3; // Animation duration in seconds
        const progress = Math.min(elapsed / duration, 1);

        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;

        // Draw the route line
        ctx?.beginPath();
        ctx?.moveTo(route.start.x, route.start.y);
        ctx?.lineTo(x, y);
        ctx!.strokeStyle = route.color;
        ctx!.lineWidth = 1.5;
        ctx?.stroke();

        // Draw the start point
        ctx?.beginPath();
        ctx?.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = route.color;
        ctx?.fill();

        // Draw the moving point
        ctx?.beginPath();
        ctx?.arc(x, y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = "#3b82f6";
        ctx?.fill();

        // Add glow effect to the moving point
        ctx?.beginPath();
        ctx?.arc(x, y, 6, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(59, 130, 246, 0.4)";
        ctx?.fill();

        // If the route is complete, draw the end point
        if (progress === 1) {
          ctx?.beginPath();
          ctx?.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
          ctx!.fillStyle = route.color;
          ctx?.fill();
        }
      });
    }

    // Animation loop
    function animate() {
      drawDots();
      drawRoutes();

      // If all routes are complete, restart the animation
      const currentTime = (Date.now() - startTime) / 1000;
      if (currentTime > 15) {
        // Reset after 15 seconds
        startTime = Date.now();
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
