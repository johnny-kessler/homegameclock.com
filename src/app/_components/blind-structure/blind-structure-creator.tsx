"use client"

import { useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Calculator } from "lucide-react"
import type { BlindLevel } from "~/lib/interfaces/blind-level"
import { calculateBlindStructure } from "./calculate-blind-structure"
import { EditableLevelsList } from "./editable-lebels-list"
import { CalculatedLevelsGrid } from "./calculated-levels-grid"
import { TournamentParamsForm } from "./tournament-params-form"

interface BlindStructureCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAcceptStructure: (blindLevels: BlindLevel[]) => void
  levelDuration: number // in minutes
  numberOfPlayersInit: number
  saveNumberOfPlayers: (num: number) => void
}

export function BlindStructureCreator({ open, onOpenChange, onAcceptStructure, levelDuration, numberOfPlayersInit, saveNumberOfPlayers }: BlindStructureCreatorProps) {
  const [startingStack, setStartingStack] = useState<number>(20000)
  const [targetTournamentDuration, setTargetTournamentDuration] = useState<number>(180)
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(numberOfPlayersInit)
  const [smallestChip, setSmallestChip] = useState<number>(25)

  const [calculatedLevels, setCalculatedLevels] = useState<BlindLevel[]>([])
  const [editableLevels, setEditableLevels] = useState<BlindLevel[]>([])
  const [showCalculated, setShowCalculated] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const showLevelLimit = useMemo(() => {
    return Math.round((targetTournamentDuration / levelDuration) + 2)
  }, [targetTournamentDuration, levelDuration])


  const suggestBlindStructure = () => {
    const levels = calculateBlindStructure({ 
      startingStack, 
      targetTournamentDuration, 
      levelDuration,
      numberOfPlayers, // Use a default value; could be made configurable
      smallestChip // Assuming smallest chip denomination is 25; could be made configurable
    })
    setCalculatedLevels(levels)
    setEditableLevels(levels)
    setShowCalculated(true)
  }

  const handleAccept = () => {
    onAcceptStructure(isEditing ? editableLevels : calculatedLevels)
    saveNumberOfPlayers(numberOfPlayers)
    handleClose()
  }

  const handleEnterManually = () => setIsEditing(true)

  const handleClose = () => {
    onOpenChange(false)
    setShowCalculated(false)
    setIsEditing(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Blind Structure Creator</DialogTitle>
          <DialogDescription>Create a custom blind structure based on your tournament parameters</DialogDescription>
        </DialogHeader>

        {!showCalculated ? (
          <div className="space-y-6 py-4">
            <TournamentParamsForm
              startingStack={startingStack}
              targetTournamentDuration={targetTournamentDuration}
              numberOfPlayers={numberOfPlayers}
              smallestChip={smallestChip}
              onStartingStackChange={setStartingStack}
              onTargetTournamentDurationChange={setTargetTournamentDuration}
              onNumberOfPlayersChange={setNumberOfPlayers}
              onSmallestChipChange={setSmallestChip}
            />
            <Button onClick={suggestBlindStructure} className="w-full">
              <Calculator className="h-4 w-4 mr-2" />
              Suggest Blind Structure
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {isEditing ? (
              <EditableLevelsList levels={editableLevels} onChange={setEditableLevels} />
            ) : (
              <CalculatedLevelsGrid levels={calculatedLevels} showLevelLimit={showLevelLimit} />
            )}
          </div>
        )}

        <DialogFooter>
          {showCalculated ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              {!isEditing && (
                <Button variant="outline" onClick={handleEnterManually}>Enter Manually</Button>
              )}
              <Button onClick={() => {
                handleAccept()
              }}>Accept Structure</Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
