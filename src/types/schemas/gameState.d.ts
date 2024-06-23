/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Global game state for the game.
 */
export interface GameState {
	answerControls?: 0 | 1;
	currentClue?: {
		question: string;
		answer: string;
		row: number;
		column: number;
		value: number;
		[k: string]: unknown;
	};
	currentRound?: 'single' | 'double' | 'final';
	boardDisplayMode?: 'intro' | 'board' | 'question';
}
