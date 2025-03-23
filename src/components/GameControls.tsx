
import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

interface GameControlsProps {
  onLeftPress: () => void;
  onLeftRelease: () => void;
  onRightPress: () => void;
  onRightRelease: () => void;
  onJumpPress: () => void;
  onJumpRelease: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  onLeftPress,
  onLeftRelease,
  onRightPress,
  onRightRelease,
  onJumpPress,
  onJumpRelease
}) => {
  return (
    <div className="flex justify-between mt-2 md:hidden">
      <div className="flex gap-2">
        <button
          className="bg-focus-purple text-white p-3 rounded-full active:bg-purple-700"
          onTouchStart={onLeftPress}
          onTouchEnd={onLeftRelease}
          onTouchCancel={onLeftRelease}
          onMouseDown={onLeftPress}
          onMouseUp={onLeftRelease}
          onMouseLeave={onLeftRelease}
          aria-label="Move Left"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          className="bg-focus-purple text-white p-3 rounded-full active:bg-purple-700"
          onTouchStart={onRightPress}
          onTouchEnd={onRightRelease}
          onTouchCancel={onRightRelease}
          onMouseDown={onRightPress}
          onMouseUp={onRightRelease}
          onMouseLeave={onRightRelease}
          aria-label="Move Right"
        >
          <ArrowRight size={20} />
        </button>
      </div>
      <button
        className="bg-focus-purple text-white p-3 rounded-full active:bg-purple-700"
        onTouchStart={onJumpPress}
        onTouchEnd={onJumpRelease}
        onTouchCancel={onJumpRelease}
        onMouseDown={onJumpPress}
        onMouseUp={onJumpRelease}
        onMouseLeave={onJumpRelease}
        aria-label="Jump"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
};

export default GameControls;
