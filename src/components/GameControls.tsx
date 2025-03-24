
import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ChevronRight } from 'lucide-react';

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
          className="bg-focus-purple text-white p-3 rounded-full"
          onTouchStart={onLeftPress}
          onTouchEnd={onLeftRelease}
          onMouseDown={onLeftPress}
          onMouseUp={onLeftRelease}
          onMouseLeave={onLeftRelease}
        >
          <ArrowLeft size={20} />
        </button>
        <button
          className="bg-focus-purple text-white p-3 rounded-full"
          onTouchStart={onRightPress}
          onTouchEnd={onRightRelease}
          onMouseDown={onRightPress}
          onMouseUp={onRightRelease}
          onMouseLeave={onRightRelease}
        >
          <ArrowRight size={20} />
        </button>
      </div>
      <button
        className="bg-focus-purple text-white p-3 rounded-full"
        onTouchStart={onJumpPress}
        onTouchEnd={onJumpRelease}
        onMouseDown={onJumpPress}
        onMouseUp={onJumpRelease}
        onMouseLeave={onJumpRelease}
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
};

export default GameControls;
