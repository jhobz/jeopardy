import type NodeCG from '@nodecg/types'
import { GameDataParser } from './GameDataParser'
import { JArchiveParser } from './JArchiveParser'
import { GameData, GameState, Player } from '../types/schemas'

let logger: NodeCG.Logger
let hasDoneInitialLoad = false

module.exports = function (nodecg: NodeCG.ServerAPI) {
    logger = nodecg.log

    const gameDataRep = nodecg.Replicant<GameData>('gameData', {
        defaultValue: {
            categories: [],
            clues: [],
        },
    })
    const gameDataFileRep =
        nodecg.Replicant<NodeCG.AssetFile[]>('assets:game-data')
    let gameDataParser: GameDataParser

    gameDataFileRep.on('change', async (fileRep) => {
        if ((!fileRep || !fileRep.length) && !hasDoneInitialLoad) {
            hasDoneInitialLoad = true
            return
        }

        if (!fileRep || !fileRep.length) {
            logger.warn('No Game Data File found in assets group.')
            return
        }

        // TODO: Check for file type
        gameDataParser = new JArchiveParser()

        gameDataRep.value = await gameDataParser.parse(fileRep[0])
    })

    const playersRep = nodecg.Replicant<Player[]>('players', {
        defaultValue: [],
    })

    const gameStateRep = nodecg.Replicant<GameState>('gameState', {
        defaultValue: {},
    })

    const activeBuzzerRep = nodecg.Replicant<number| null>('activeBuzzer', { 
        defaultValue: null,
    });

    nodecg.listenFor('buzzerPressed', ({ index }) => {
        console.log('Buzzer pressed: ', index);

        if (activeBuzzerRep.value === null) {
            activeBuzzerRep.value = index;
        }
    });

    nodecg.listenFor('buzzerReset', () => {
        console.log('Buzzer reset');
        
        activeBuzzerRep.value = null;
    });

    
    nodecg.listenFor('updatePlayer', (player) => {        
        playersRep.value = playersRep.value.map(x => x.id === player.id ? player : x);
    })
}
