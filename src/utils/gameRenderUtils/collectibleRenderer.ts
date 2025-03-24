
import { Coin } from "@/types/gameTypes";
import { getExtensionURL } from "../chromeUtils";

// Create the face image outside the function to ensure it's only created once
const sinaImage = new Image();
// Add an onload handler to ensure the image is fully loaded before use
sinaImage.onload = () => {
  console.log("Coin image loaded successfully");
};
sinaImage.onerror = (err) => {
  console.error("Error loading coin image:", err);
};
sinaImage.src = getExtensionURL("/assets/coin-sina.png");

// Create the face image outside the function to ensure it's only created once
const cristinaImage = new Image();
// Add an onload handler to ensure the image is fully loaded before use
cristinaImage.onload = () => {
  console.log("Coin image loaded successfully");
};
cristinaImage.onerror = (err) => {
  console.error("Error loading coin image:", err);
};
cristinaImage.src = getExtensionURL("/assets/coin-cristina.png");

// Draw collectibles with variety
export const drawCollectibles = (
  ctx: CanvasRenderingContext2D,
  coins: Coin[],
  cameraOffsetX: number
) => {
  // Draw each coin
  coins.forEach((coin, i) => {
    if (!coin.collected) {
      const adjustedX = coin.x - cameraOffsetX;

      // Only render coins that are visible on screen or near it
      if (adjustedX < 700 && adjustedX + coin.width > -20) {
        // Increase the rendering size by 50%
        const scaleFactor = 1.5;
        const centerX = adjustedX + coin.width / 2;
        const centerY = coin.y + coin.height / 2;
        const renderWidth = coin.width * scaleFactor;
        const renderHeight = coin.height * scaleFactor;

        // Yellow coin with face (original style)
        // Draw yellow circle background
        ctx.fillStyle = "#FFD746";
        ctx.beginPath();
        ctx.arc(centerX, centerY, renderWidth / 2, 0, Math.PI * 2);
        ctx.fill();

        // Create circular clipping path
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, renderWidth / 2 - 1, 0, Math.PI * 2);
        ctx.clip();

        // Draw the image within the clipping path
        ctx.drawImage(
          i % 2 === 0 ? sinaImage : cristinaImage,
          centerX - renderWidth / 2,
          centerY - renderHeight / 2,
          renderWidth,
          renderHeight
        );

        // Restore the context
        ctx.restore();

        // Add a subtle border
        ctx.strokeStyle = "#FFD746";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, renderWidth / 2, 0, Math.PI * 2);
        ctx.stroke();

        i++;
      }
    }
  });
};
