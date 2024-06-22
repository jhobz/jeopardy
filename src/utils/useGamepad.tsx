import { useState, useEffect } from 'react';

type GamepadInfo = { connected: false } | {
  connected: true;
  buttonA: boolean;
  buttonB: boolean;
  buttonX: boolean;
  buttonY: boolean;
}
export const useGamepad = () => {
  const [gamepadInfo, setGamepadInfo] = useState<GamepadInfo[]>([]);

  // Function to update gamepad state
  const updateGamepadState = () => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

    const newGamepadInfo = gamepads.map(gamepad => {
      if (!gamepad) return { connected: false };

      return {
        connected: true,
        buttonA: gamepad.buttons[0].pressed,
        buttonB: gamepad.buttons[1].pressed,
        buttonX: gamepad.buttons[2].pressed,
        buttonY: gamepad.buttons[3].pressed,
        // joystickRight: [gamepad.axes[2], gamepad.axes[3]],
        // LT: gamepad.buttons[6].pressed,
        // RT: gamepad.buttons[7].pressed,
        // LB: gamepad.buttons[4].pressed,
        // RB: gamepad.buttons[5].pressed,

        // start: gamepad.buttons[9].pressed,
        // select: gamepad.buttons[8].pressed,
        // up: gamepad.buttons[12].pressed,
        // down: gamepad.buttons[13].pressed,
        // left: gamepad.buttons[14].pressed,
        // right: gamepad.buttons[15].pressed,
        // joystick: [gamepad.axes[0], gamepad.axes[1]]
      };
    });

    // Update state only if there's a change
    if (JSON.stringify(newGamepadInfo) !== JSON.stringify(gamepadInfo)) {
      setGamepadInfo(newGamepadInfo as GamepadInfo[]);
    }
  };

  useEffect(() => {
    const gamepadConnected = () => {
      console.log('Gamepad connected!');
      updateGamepadState();
    };

    const gamepadDisconnected = () => {
      console.log('Gamepad disconnected!');
      updateGamepadState();
    };

    window.addEventListener('gamepadconnected', gamepadConnected);
    window.addEventListener('gamepaddisconnected', gamepadDisconnected);

    const interval = setInterval(updateGamepadState, 20);

    return () => {
      window.removeEventListener('gamepadconnected', gamepadConnected);
      window.removeEventListener('gamepaddisconnected', gamepadDisconnected);
      clearInterval(interval);
    };
  }, [gamepadInfo]);

  return gamepadInfo;
};