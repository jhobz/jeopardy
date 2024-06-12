import NodeCG from '@nodecg/types'
import type { GameData } from '../types/schemas'

export interface GameDataParser {
    parse: (assetFile: NodeCG.AssetFile) => Promise<GameData>
}
